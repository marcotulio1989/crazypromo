import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAffiliateLink } from '@/lib/affiliate-link-generator'
import { recordPrice } from '@/lib/price-analyzer'

// GET - Listar produtos
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const store = searchParams.get('store')

  const where: Record<string, unknown> = {
    isActive: true
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (category) {
    where.category = { slug: category }
  }

  if (store) {
    where.store = { slug: store }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        store: true,
        category: true,
        promotions: {
          where: { isActive: true },
          orderBy: { dealScore: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ])

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
}

// POST - Criar produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      image, 
      originalUrl, 
      currentPrice, 
      originalPrice,
      storeId, 
      categoryId 
    } = body

    // Validar loja
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Gerar slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now()

    // Gerar link de afiliado
    const affiliateUrl = await generateAffiliateLink(originalUrl, storeId)

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        image,
        originalUrl,
        affiliateUrl,
        currentPrice,
        originalPrice,
        storeId,
        categoryId,
        lowestPrice: currentPrice,
        highestPrice: currentPrice,
        averagePrice: currentPrice
      },
      include: {
        store: true,
        category: true
      }
    })

    // Registrar primeiro preço no histórico
    await recordPrice(product.id, currentPrice, 'manual')

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
