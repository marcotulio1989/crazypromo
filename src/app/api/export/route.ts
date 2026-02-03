import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertToCSV, convertToJSON, getContentType, getFileExtension } from '@/lib/export-utils'

type ResourceType = 'products' | 'promotions' | 'stores' | 'categories'

async function fetchProducts() {
  const products = await prisma.product.findMany({
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    image: p.image,
    originalUrl: p.originalUrl,
    affiliateUrl: p.affiliateUrl,
    currentPrice: p.currentPrice,
    originalPrice: p.originalPrice,
    lowestPrice: p.lowestPrice,
    highestPrice: p.highestPrice,
    averagePrice: p.averagePrice,
    isActive: p.isActive,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    store_id: p.store?.id,
    store_name: p.store?.name,
    store_slug: p.store?.slug,
    category_id: p.category?.id,
    category_name: p.category?.name,
    category_slug: p.category?.slug
  }))
}

async function fetchPromotions() {
  const promotions = await prisma.promotion.findMany({
    include: {
      product: {
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return promotions.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    promotionPrice: p.promotionPrice,
    originalPrice: p.originalPrice,
    discountPercent: p.discountPercent,
    dealScore: p.dealScore,
    isRealDeal: p.isRealDeal,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    startsAt: p.startsAt,
    endsAt: p.endsAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    product_id: p.product?.id,
    product_name: p.product?.name,
    product_slug: p.product?.slug,
    store_id: p.product?.store?.id,
    store_name: p.product?.store?.name,
    store_slug: p.product?.store?.slug,
    category_id: p.product?.category?.id,
    category_name: p.product?.category?.name,
    category_slug: p.product?.category?.slug
  }))
}

async function fetchStores() {
  const stores = await prisma.store.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Remove sensitive affiliate config data
  return stores.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    website: s.website,
    logo: s.logo,
    description: s.description,
    commission: s.commission,
    isActive: s.isActive,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    productsCount: s._count.products
  }))
}

async function fetchCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      },
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    image: c.image,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    parent_id: c.parent?.id,
    parent_name: c.parent?.name,
    parent_slug: c.parent?.slug,
    productsCount: c._count.products
  }))
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const resource = searchParams.get('resource') as ResourceType | null
    const format = (searchParams.get('format') || 'json') as 'json' | 'csv'

    if (!resource || !['products', 'promotions', 'stores', 'categories'].includes(resource)) {
      return NextResponse.json(
        { error: 'Parâmetro resource inválido. Use: products, promotions, stores ou categories' },
        { status: 400 }
      )
    }

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Parâmetro format inválido. Use: json ou csv' },
        { status: 400 }
      )
    }

    let data: Record<string, unknown>[]

    switch (resource) {
      case 'products':
        data = await fetchProducts()
        break
      case 'promotions':
        data = await fetchPromotions()
        break
      case 'stores':
        data = await fetchStores()
        break
      case 'categories':
        data = await fetchCategories()
        break
    }

    const contentType = getContentType(format)
    const fileExtension = getFileExtension(format)
    const todayDateString = new Date().toISOString().slice(0, 10)
    const filename = `${resource}_${todayDateString}.${fileExtension}`

    let content: string
    if (format === 'csv') {
      content = convertToCSV(data)
    } else {
      content = convertToJSON(data)
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
