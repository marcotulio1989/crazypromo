import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  try {
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            priceHistory: {
              orderBy: { createdAt: 'desc' },
              take: 100 // Últimos 100 registros de preço
            },
            category: true,
            _count: {
              select: { clicks: true }
            }
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Processar dados com análise de preços
    const productsWithAnalysis = store.products.map(product => {
      const priceHistory = product.priceHistory
      
      // Análise de preços
      const prices = priceHistory.map(h => h.price)
      const currentPrice = product.currentPrice
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : currentPrice
      const highestPrice = prices.length > 0 ? Math.max(...prices) : currentPrice
      const averagePrice = prices.length > 0 
        ? prices.reduce((a, b) => a + b, 0) / prices.length 
        : currentPrice

      // Calcular variação de preço
      const priceChange = priceHistory.length >= 2 
        ? ((currentPrice - priceHistory[priceHistory.length - 1].price) / priceHistory[priceHistory.length - 1].price) * 100
        : 0

      // Detectar quedas de preço significativas (últimos 7 dias)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const recentPrices = priceHistory.filter(h => h.createdAt >= sevenDaysAgo)
      const priceDropLast7Days = recentPrices.length > 0
        ? ((currentPrice - Math.max(...recentPrices.map(h => h.price))) / Math.max(...recentPrices.map(h => h.price))) * 100
        : 0

      // Detectar quedas nos últimos 30 dias
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const monthPrices = priceHistory.filter(h => h.createdAt >= thirtyDaysAgo)
      const priceDropLast30Days = monthPrices.length > 0
        ? ((currentPrice - Math.max(...monthPrices.map(h => h.price))) / Math.max(...monthPrices.map(h => h.price))) * 100
        : 0

      // Verificar se está no menor preço histórico
      const isAtLowestPrice = currentPrice <= lowestPrice
      const isNearLowestPrice = currentPrice <= lowestPrice * 1.05 // 5% acima do menor

      // Calcular score de oportunidade (quanto menor, melhor a oportunidade)
      const opportunityScore = averagePrice > 0 
        ? Math.round((1 - (currentPrice / averagePrice)) * 100)
        : 0

      return {
        // Dados básicos do produto
        id: product.id,
        nome: product.name,
        descricao: product.description,
        marca: product.brand,
        categoria: product.category?.name || 'Sem categoria',
        ean: product.ean,
        sku: product.sku,
        imagem: product.image,
        urlOriginal: product.originalUrl,
        urlAfiliado: product.affiliateUrl,
        externalId: product.externalId,
        
        // Preços atuais
        precoAtual: currentPrice,
        precoOriginal: product.originalPrice,
        descontoLoja: product.originalPrice 
          ? Math.round((1 - currentPrice / product.originalPrice) * 100) 
          : 0,
        
        // Análise de preços históricos
        analisePrecos: {
          menorPrecoHistorico: lowestPrice,
          maiorPrecoHistorico: highestPrice,
          precoMedio: Math.round(averagePrice * 100) / 100,
          variacaoTotal: Math.round(priceChange * 100) / 100,
          queda7Dias: Math.round(priceDropLast7Days * 100) / 100,
          queda30Dias: Math.round(priceDropLast30Days * 100) / 100,
          estaMenorPreco: isAtLowestPrice,
          proximoMenorPreco: isNearLowestPrice,
          scoreOportunidade: opportunityScore,
          quantidadeRegistros: priceHistory.length
        },

        // Histórico detalhado (últimos 30 registros)
        historicoPrecos: priceHistory.slice(0, 30).map(h => ({
          preco: h.price,
          data: h.createdAt.toISOString(),
          fonte: h.source
        })),

        // Métricas de engajamento
        metricas: {
          totalClicks: product._count.clicks,
          ativo: product.isActive,
          ultimaVerificacao: product.lastChecked?.toISOString(),
          criadoEm: product.createdAt.toISOString(),
          atualizadoEm: product.updatedAt.toISOString()
        }
      }
    })

    // Resumo da loja
    const summary = {
      loja: {
        id: store.id,
        nome: store.name,
        website: store.website,
        totalProdutos: store.products.length,
        produtosAtivos: store.products.filter(p => p.isActive).length,
        comissao: store.commission,
        ultimaSincronizacao: store.lastFeedSync?.toISOString(),
        exportadoEm: new Date().toISOString()
      },
      estatisticas: {
        produtosNoMenorPreco: productsWithAnalysis.filter(p => p.analisePrecos.estaMenorPreco).length,
        produtosComQueda7Dias: productsWithAnalysis.filter(p => p.analisePrecos.queda7Dias < -5).length,
        produtosComQueda30Dias: productsWithAnalysis.filter(p => p.analisePrecos.queda30Dias < -10).length,
        mediaScoreOportunidade: productsWithAnalysis.length > 0
          ? Math.round(productsWithAnalysis.reduce((a, b) => a + b.analisePrecos.scoreOportunidade, 0) / productsWithAnalysis.length)
          : 0
      },
      topOportunidades: productsWithAnalysis
        .filter(p => p.analisePrecos.scoreOportunidade > 0)
        .sort((a, b) => b.analisePrecos.scoreOportunidade - a.analisePrecos.scoreOportunidade)
        .slice(0, 10)
        .map(p => ({
          nome: p.nome,
          precoAtual: p.precoAtual,
          precoMedio: p.analisePrecos.precoMedio,
          scoreOportunidade: p.analisePrecos.scoreOportunidade
        }))
    }

    const exportData = {
      resumo: summary,
      produtos: productsWithAnalysis
    }

    if (format === 'csv') {
      // Gerar CSV
      const headers = [
        'ID', 'Nome', 'Marca', 'Categoria', 'EAN', 'SKU',
        'Preço Atual', 'Preço Original', 'Desconto Loja (%)',
        'Menor Preço Histórico', 'Maior Preço Histórico', 'Preço Médio',
        'Queda 7 Dias (%)', 'Queda 30 Dias (%)', 'Score Oportunidade',
        'Está no Menor Preço', 'Total Cliques', 'URL Original', 'URL Afiliado'
      ]

      const rows = productsWithAnalysis.map(p => [
        p.id,
        `"${p.nome.replace(/"/g, '""')}"`,
        p.marca || '',
        p.categoria,
        p.ean || '',
        p.sku || '',
        p.precoAtual,
        p.precoOriginal || '',
        p.descontoLoja,
        p.analisePrecos.menorPrecoHistorico,
        p.analisePrecos.maiorPrecoHistorico,
        p.analisePrecos.precoMedio,
        p.analisePrecos.queda7Dias,
        p.analisePrecos.queda30Dias,
        p.analisePrecos.scoreOportunidade,
        p.analisePrecos.estaMenorPreco ? 'Sim' : 'Não',
        p.metricas.totalClicks,
        p.urlOriginal,
        p.urlAfiliado || ''
      ])

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${store.slug}-produtos-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // JSON (padrão)
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${store.slug}-produtos-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}
