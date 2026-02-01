import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzePromotion } from '@/lib/price-analyzer'

// GET - Obter promoção específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      product: {
        include: {
          store: true,
          category: true,
          priceHistory: {
            orderBy: { createdAt: 'desc' },
            take: 90
          }
        }
      }
    }
  })

  if (!promotion) {
    return NextResponse.json({ error: 'Promoção não encontrada' }, { status: 404 })
  }

  // Obter análise atualizada
  const analysis = await analyzePromotion(
    promotion.productId,
    promotion.promotionPrice,
    promotion.originalPrice
  )

  return NextResponse.json({
    promotion,
    analysis
  })
}

// PATCH - Atualizar promoção
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const promotion = await prisma.promotion.findUnique({
      where: { id }
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Promoção não encontrada' }, { status: 404 })
    }

    // Se preço mudou, reanalisar
    let analysisData = {}
    if (body.promotionPrice || body.originalPrice) {
      const analysis = await analyzePromotion(
        promotion.productId,
        body.promotionPrice || promotion.promotionPrice,
        body.originalPrice || promotion.originalPrice
      )
      
      const discountPercent = ((body.originalPrice || promotion.originalPrice) - (body.promotionPrice || promotion.promotionPrice)) / (body.originalPrice || promotion.originalPrice) * 100

      analysisData = {
        isRealDeal: analysis.isRealDeal,
        dealScore: analysis.dealScore,
        discountPercent
      }
    }

    const updated = await prisma.promotion.update({
      where: { id },
      data: {
        ...body,
        ...analysisData,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      },
      include: {
        product: {
          include: {
            store: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error('Erro ao atualizar promoção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Remover promoção
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.promotion.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar promoção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
