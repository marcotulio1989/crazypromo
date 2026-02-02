/**
 * Importador de Feeds de Afiliados
 * Suporta: Lomadee, Awin, CSV genérico
 */

import { prisma } from './prisma'
import { recordPrice } from './price-analyzer'

export interface FeedProduct {
  externalId: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  url: string
  category?: string
  brand?: string
  ean?: string // Código de barras - usado para match entre lojas
  sku?: string
}

export interface FeedConfig {
  type: 'lomadee' | 'awin' | 'csv' | 'json'
  url: string
  storeId: string
  mapping?: Record<string, string> // Mapeamento de campos
}

/**
 * Importa produtos de um feed Lomadee
 */
export async function importLomadeeFeed(
  feedUrl: string,
  storeId: string,
  sourceId: string
): Promise<{ imported: number; updated: number; errors: number }> {
  const results = { imported: 0, updated: 0, errors: 0 }

  try {
    // Lomadee retorna JSON
    const response = await fetch(`${feedUrl}&sourceId=${sourceId}`)
    const data = await response.json()

    const products = data.products || data.offers || []

    for (const item of products) {
      try {
        await processProduct({
          externalId: item.id?.toString() || item.sku,
          name: item.name || item.productName,
          description: item.description,
          price: parseFloat(item.price || item.salePrice),
          originalPrice: parseFloat(item.oldPrice || item.listPrice || item.price),
          image: item.image || item.thumbnail,
          url: item.link || item.url,
          category: item.category?.name || item.categoryName,
          brand: item.brand,
          ean: item.ean || item.barcode,
          sku: item.sku
        }, storeId)

        results.imported++
      } catch (err) {
        results.errors++
        console.error('Erro ao processar produto:', err)
      }
    }
  } catch (error) {
    console.error('Erro ao importar feed Lomadee:', error)
    throw error
  }

  return results
}

/**
 * Importa produtos de um feed Awin (XML)
 */
export async function importAwinFeed(
  feedUrl: string,
  storeId: string
): Promise<{ imported: number; updated: number; errors: number }> {
  const results = { imported: 0, updated: 0, errors: 0 }

  try {
    const response = await fetch(feedUrl)
    const xmlText = await response.text()

    // Parse XML simples (em produção usar xml2js ou similar)
    const productMatches = xmlText.matchAll(/<product>([\s\S]*?)<\/product>/g)

    for (const match of productMatches) {
      try {
        const xml = match[1]
        const getValue = (tag: string) => {
          const m = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[(.+?)\\]\\]></${tag}>|<${tag}>(.+?)</${tag}>`))
          return m ? (m[1] || m[2]) : undefined
        }

        await processProduct({
          externalId: getValue('aw_product_id') || getValue('merchant_product_id') || '',
          name: getValue('product_name') || '',
          description: getValue('description'),
          price: parseFloat(getValue('search_price') || getValue('aw_deep_link') || '0'),
          originalPrice: parseFloat(getValue('rrp_price') || '0'),
          image: getValue('aw_image_url') || getValue('merchant_image_url'),
          url: getValue('aw_deep_link') || getValue('merchant_deep_link') || '',
          category: getValue('merchant_category'),
          brand: getValue('brand_name'),
          ean: getValue('ean'),
          sku: getValue('merchant_product_id')
        }, storeId)

        results.imported++
      } catch (err) {
        results.errors++
      }
    }
  } catch (error) {
    console.error('Erro ao importar feed Awin:', error)
    throw error
  }

  return results
}

/**
 * Importa produtos de um CSV genérico
 */
export async function importCsvFeed(
  feedUrl: string,
  storeId: string,
  mapping: Record<string, string>
): Promise<{ imported: number; updated: number; errors: number }> {
  const results = { imported: 0, updated: 0, errors: 0 }

  try {
    const response = await fetch(feedUrl)
    const csvText = await response.text()
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => row[h] = values[idx])

        await processProduct({
          externalId: row[mapping.externalId || 'id'] || row[mapping.sku || 'sku'],
          name: row[mapping.name || 'name'],
          description: row[mapping.description || 'description'],
          price: parseFloat(row[mapping.price || 'price']),
          originalPrice: parseFloat(row[mapping.originalPrice || 'original_price'] || row[mapping.price || 'price']),
          image: row[mapping.image || 'image'],
          url: row[mapping.url || 'url'],
          category: row[mapping.category || 'category'],
          brand: row[mapping.brand || 'brand'],
          ean: row[mapping.ean || 'ean'],
          sku: row[mapping.sku || 'sku']
        }, storeId)

        results.imported++
      } catch (err) {
        results.errors++
      }
    }
  } catch (error) {
    console.error('Erro ao importar CSV:', error)
    throw error
  }

  return results
}

/**
 * Processa e salva um produto
 */
async function processProduct(product: FeedProduct, storeId: string): Promise<void> {
  if (!product.name || !product.price || !product.url) return

  // Gerar slug único
  const slug = product.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100) + '-' + (product.externalId || Date.now())

  // Buscar ou criar produto
  const existing = await prisma.product.findFirst({
    where: {
      OR: [
        { externalId: product.externalId, storeId },
        { ean: product.ean, storeId: product.ean ? storeId : undefined }
      ]
    }
  })

  if (existing) {
    // Atualizar produto existente
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        currentPrice: product.price,
        originalPrice: product.originalPrice,
        lastChecked: new Date()
      }
    })

    // Registrar preço no histórico
    await recordPrice(existing.id, product.price, 'feed')
  } else {
    // Criar novo produto
    const newProduct = await prisma.product.create({
      data: {
        name: product.name,
        slug,
        description: product.description,
        image: product.image,
        originalUrl: product.url,
        affiliateUrl: product.url, // Já vem com link de afiliado do feed
        currentPrice: product.price,
        originalPrice: product.originalPrice || product.price,
        lowestPrice: product.price,
        highestPrice: product.price,
        averagePrice: product.price,
        storeId,
        externalId: product.externalId,
        ean: product.ean,
        sku: product.sku,
        brand: product.brand
      }
    })

    // Registrar primeiro preço
    await recordPrice(newProduct.id, product.price, 'feed')
  }
}

/**
 * Busca produtos por EAN ou nome (usado na comparação de preços)
 */
export async function findProductsByEanOrName(ean?: string, name?: string): Promise<Array<{
  id: string;
  name: string;
  ean: string | null;
  brand: string | null;
  image: string | null;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  affiliateLink: string | null;
  inStock: boolean;
  storeId: string;
  store?: { name: string; logo: string | null } | null;
}>> {
  const where: Record<string, unknown> = {
    isActive: true
  }

  if (ean) {
    where.ean = ean
  } else if (name) {
    const keywords = name.toLowerCase().split(' ').filter(w => w.length > 3)
    if (keywords.length > 0) {
      where.OR = keywords.slice(0, 3).map(kw => ({
        name: { contains: kw, mode: 'insensitive' as const }
      }))
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: { store: true },
    take: 100
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    ean: p.ean,
    brand: p.brand,
    image: p.image,
    price: p.currentPrice,
    originalPrice: p.originalPrice,
    discount: p.originalPrice ? Math.round((1 - p.currentPrice / p.originalPrice) * 100) : null,
    affiliateLink: p.affiliateUrl,
    inStock: p.isActive,
    storeId: p.storeId,
    store: p.store
  }))
}

/**
 * Busca produtos similares entre lojas (pelo EAN ou nome similar)
 */
export async function findSimilarProducts(productId: string): Promise<Array<{
  product: { id: string; name: string; currentPrice: number; store: { name: string } };
  similarity: number;
}>> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true }
  })

  if (!product) return []

  const similar = []

  // Buscar por EAN (match exato)
  if (product.ean) {
    const byEan = await prisma.product.findMany({
      where: {
        ean: product.ean,
        id: { not: productId }
      },
      include: { store: true }
    })
    similar.push(...byEan.map(p => ({ product: p, similarity: 100 })))
  }

  // Buscar por nome similar (simplificado)
  const keywords = product.name.toLowerCase().split(' ').filter(w => w.length > 3)
  if (keywords.length > 0) {
    const byName = await prisma.product.findMany({
      where: {
        id: { not: productId },
        storeId: { not: product.storeId },
        OR: keywords.slice(0, 3).map(kw => ({
          name: { contains: kw, mode: 'insensitive' as const }
        }))
      },
      include: { store: true },
      take: 10
    })

    for (const p of byName) {
      // Calcular similaridade básica
      const pKeywords = p.name.toLowerCase().split(' ').filter(w => w.length > 3)
      const matches = keywords.filter(k => pKeywords.includes(k)).length
      const similarity = Math.round((matches / keywords.length) * 100)
      if (similarity >= 50) {
        similar.push({ product: p, similarity })
      }
    }
  }

  return similar.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Agrupa produtos similares e retorna o melhor preço
 */
export async function getBestPrices(limit: number = 20): Promise<Array<{
  name: string;
  ean?: string;
  bestPrice: number;
  bestStore: string;
  prices: Array<{ store: string; price: number; url: string }>;
}>> {
  // Buscar produtos com EAN (podem ser comparados)
  const productsWithEan = await prisma.product.findMany({
    where: {
      ean: { not: null },
      isActive: true
    },
    include: { store: true },
    orderBy: { updatedAt: 'desc' },
    take: 500
  })

  // Agrupar por EAN
  const groups = new Map<string, typeof productsWithEan>()
  for (const p of productsWithEan) {
    if (!p.ean) continue
    const existing = groups.get(p.ean) || []
    existing.push(p)
    groups.set(p.ean, existing)
  }

  // Filtrar apenas grupos com mais de uma loja
  const results = []
  for (const [ean, products] of groups) {
    if (products.length < 2) continue

    const prices = products.map(p => ({
      store: p.store.name,
      price: p.currentPrice,
      url: p.affiliateUrl || p.originalUrl
    })).sort((a, b) => a.price - b.price)

    results.push({
      name: products[0].name,
      ean,
      bestPrice: prices[0].price,
      bestStore: prices[0].store,
      prices
    })
  }

  return results.sort((a, b) => {
    // Ordenar por maior economia (diferença entre maior e menor preço)
    const savingA = a.prices[a.prices.length - 1].price - a.prices[0].price
    const savingB = b.prices[b.prices.length - 1].price - b.prices[0].price
    return savingB - savingA
  }).slice(0, limit)
}
