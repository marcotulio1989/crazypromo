import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  importLomadeeFeed, 
  importAwinFeed, 
  importCsvFeed,
  getBestPrices 
} from '@/lib/feed-importer'

// POST - Importar feed de uma loja
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, feedUrl, feedType, mapping, sourceId } = body

    // Validar loja
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    let results

    switch (feedType || store.feedType) {
      case 'lomadee':
        results = await importLomadeeFeed(
          feedUrl || store.feedUrl || '',
          storeId,
          sourceId || store.affiliateId || ''
        )
        break

      case 'awin':
        results = await importAwinFeed(
          feedUrl || store.feedUrl || '',
          storeId
        )
        break

      case 'csv':
        results = await importCsvFeed(
          feedUrl || store.feedUrl || '',
          storeId,
          mapping || store.feedMapping as Record<string, string> || {}
        )
        break

      default:
        return NextResponse.json({ error: 'Tipo de feed não suportado' }, { status: 400 })
    }

    // Atualizar data da última sincronização
    await prisma.store.update({
      where: { id: storeId },
      data: { 
        lastFeedSync: new Date(),
        feedUrl: feedUrl || store.feedUrl,
        feedType: feedType || store.feedType,
        feedMapping: mapping || store.feedMapping
      }
    })

    return NextResponse.json({
      success: true,
      ...results,
      message: `Importação concluída: ${results.imported} produtos importados, ${results.errors} erros`
    })

  } catch (error) {
    console.error('Erro ao importar feed:', error)
    return NextResponse.json({ 
      error: 'Erro ao importar feed', 
      message: String(error) 
    }, { status: 500 })
  }
}

// GET - Listar melhores preços (comparativo entre lojas)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const bestPrices = await getBestPrices(limit)

    return NextResponse.json({
      bestPrices,
      total: bestPrices.length
    })

  } catch (error) {
    console.error('Erro ao buscar melhores preços:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
