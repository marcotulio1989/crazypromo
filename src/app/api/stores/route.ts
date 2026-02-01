import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateStoreAffiliateLinks } from '@/lib/affiliate-link-generator'

// GET - Listar lojas
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const onlyActive = searchParams.get('onlyActive') !== 'false'

  const where = onlyActive ? { isActive: true } : {}

  const stores = await prisma.store.findMany({
    where,
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(stores)
}

// POST - Criar loja
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      website, 
      logo, 
      description,
      affiliateUrl,
      affiliateId,
      affiliateConfig,
      commission
    } = body

    // Gerar slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const store = await prisma.store.create({
      data: {
        name,
        slug,
        website,
        logo,
        description,
        affiliateUrl,
        affiliateId,
        affiliateConfig,
        commission
      }
    })

    return NextResponse.json(store, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
