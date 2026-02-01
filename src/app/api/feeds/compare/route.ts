import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findSimilarProducts, getBestPrices } from '@/lib/feed-importer'

// GET - Buscar produtos similares e comparar preços
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ean = searchParams.get('ean')
    const name = searchParams.get('name')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!ean && !name) {
      // Retorna os melhores preços gerais
      const bestPrices = await getBestPrices(limit)
      return NextResponse.json({
        success: true,
        mode: 'best-prices',
        data: bestPrices
      })
    }

    // Buscar produtos similares
    const products = await findSimilarProducts(ean || undefined, name || undefined)

    // Agrupar por loja e calcular economia
    const grouped = products.reduce((acc, product) => {
      const key = product.ean || product.name.toLowerCase().trim()
      if (!acc[key]) {
        acc[key] = {
          name: product.name,
          ean: product.ean,
          brand: product.brand,
          image: product.image,
          offers: []
        }
      }
      acc[key].offers.push({
        id: product.id,
        storeId: product.storeId,
        storeName: product.store?.name || 'Loja',
        storeLogo: product.store?.logo,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        affiliateLink: product.affiliateLink,
        inStock: product.inStock
      })
      return acc
    }, {} as Record<string, {
      name: string
      ean: string | null
      brand: string | null
      image: string | null
      offers: Array<{
        id: string
        storeId: string
        storeName: string
        storeLogo: string | null | undefined
        price: number
        originalPrice: number | null
        discount: number | null
        affiliateLink: string | null
        inStock: boolean
      }>
    }>)

    // Ordenar ofertas por preço dentro de cada grupo
    Object.values(grouped).forEach(group => {
      group.offers.sort((a, b) => a.price - b.price)
    })

    return NextResponse.json({
      success: true,
      mode: 'similar-products',
      searchedEan: ean,
      searchedName: name,
      productGroups: Object.values(grouped),
      totalProducts: products.length
    })

  } catch (error) {
    console.error('Erro ao comparar preços:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
