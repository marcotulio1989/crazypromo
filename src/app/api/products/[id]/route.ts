import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePriceStats, analyzePromotion } from '@/lib/price-analyzer'

// GET - Obter produto específico com histórico de preços
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      store: true,
      category: true,
      priceHistory: {
        orderBy: { createdAt: 'desc' },
        take: 90 // Últimos 90 registros
      },
      promotions: {
        where: { isActive: true },
        orderBy: { dealScore: 'desc' }
      }
    }
  })

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  // Calcular estatísticas de preço
  const priceStats = await calculatePriceStats(id)

  // Se há promoção ativa, obter análise
  let currentAnalysis = null
  if (product.promotions.length > 0) {
    const promo = product.promotions[0]
    currentAnalysis = await analyzePromotion(id, promo.promotionPrice, promo.originalPrice)
  }

  return NextResponse.json({
    product,
    priceStats,
    currentAnalysis
  })
}

// PATCH - Atualizar produto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id },
      data: body,
      include: {
        store: true,
        category: true
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Remover produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
