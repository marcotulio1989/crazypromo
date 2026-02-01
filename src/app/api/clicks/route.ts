import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackClick } from '@/lib/affiliate-link-generator'

// POST - Registrar clique e redirecionar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, promotionId } = body

    // Registrar clique
    await trackClick(productId, promotionId, request)

    // Buscar URL de afiliado
    let redirectUrl = null

    if (promotionId) {
      const promotion = await prisma.promotion.findUnique({
        where: { id: promotionId },
        include: { product: true }
      })
      redirectUrl = promotion?.product.affiliateUrl || promotion?.product.originalUrl
    } else if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
      redirectUrl = product?.affiliateUrl || product?.originalUrl
    }

    if (!redirectUrl) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ redirectUrl })

  } catch (error) {
    console.error('Erro ao registrar clique:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Estatísticas de cliques
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const productId = searchParams.get('productId')
  const promotionId = searchParams.get('promotionId')
  const days = parseInt(searchParams.get('days') || '30')

  const since = new Date()
  since.setDate(since.getDate() - days)

  const where: Record<string, unknown> = {
    createdAt: { gte: since }
  }

  if (productId) where.productId = productId
  if (promotionId) where.promotionId = promotionId

  const [totalClicks, clicksByDay] = await Promise.all([
    prisma.click.count({ where }),
    prisma.click.groupBy({
      by: ['createdAt'],
      where,
      _count: true,
      orderBy: { createdAt: 'asc' }
    })
  ])

  return NextResponse.json({
    totalClicks,
    clicksByDay
  })
}
