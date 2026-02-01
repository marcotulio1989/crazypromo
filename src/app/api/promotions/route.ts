import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzePromotion } from '@/lib/price-analyzer'

// GET - Listar promoções
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category')
  const store = searchParams.get('store')
  const minDiscount = parseInt(searchParams.get('minDiscount') || '0')
  const onlyReal = searchParams.get('onlyReal') === 'true'
  const featured = searchParams.get('featured') === 'true'
  const sortBy = searchParams.get('sortBy') || 'dealScore'

  const where: Record<string, unknown> = {
    isActive: true,
    discountPercent: { gte: minDiscount }
  }

  if (onlyReal) {
    where.isRealDeal = true
  }

  if (featured) {
    where.isFeatured = true
  }

  if (category) {
    where.product = {
      category: { slug: category }
    }
  }

  if (store) {
    where.product = {
      ...where.product as object,
      store: { slug: store }
    }
  }

  const orderBy: Record<string, string> = {}
  switch (sortBy) {
    case 'dealScore':
      orderBy.dealScore = 'desc'
      break
    case 'discount':
      orderBy.discountPercent = 'desc'
      break
    case 'price':
      orderBy.promotionPrice = 'asc'
      break
    case 'newest':
      orderBy.createdAt = 'desc'
      break
    default:
      orderBy.dealScore = 'desc'
  }

  const [promotions, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      include: {
        product: {
          include: {
            store: true,
            category: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.promotion.count({ where })
  ])

  return NextResponse.json({
    promotions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}

// POST - Criar promoção
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, title, description, promotionPrice, originalPrice, startsAt, endsAt, isFeatured } = body

    // Validar produto
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Analisar a promoção
    const analysis = await analyzePromotion(productId, promotionPrice, originalPrice)

    // Calcular desconto
    const discountPercent = ((originalPrice - promotionPrice) / originalPrice) * 100

    const promotion = await prisma.promotion.create({
      data: {
        productId,
        title: title || `${Math.round(discountPercent)}% OFF - ${product.name}`,
        description,
        promotionPrice,
        originalPrice,
        discountPercent,
        isRealDeal: analysis.isRealDeal,
        dealScore: analysis.dealScore,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isFeatured: isFeatured || false
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

    return NextResponse.json({
      promotion,
      analysis
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar promoção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
