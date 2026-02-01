/**
 * Gerador de Links de Afiliados
 * 
 * Este módulo gera links de afiliados para diferentes lojas
 * baseado nas configurações salvas no banco de dados
 */

import { prisma } from './prisma'

export interface AffiliateConfig {
  type: 'query_param' | 'path_append' | 'domain_replace' | 'custom'
  paramName?: string // Para query_param
  pathPrefix?: string // Para path_append
  customTemplate?: string // Para custom, usa {url} e {affiliateId}
}

// Templates padrão para lojas conhecidas
export const STORE_TEMPLATES: Record<string, AffiliateConfig> = {
  amazon: {
    type: 'query_param',
    paramName: 'tag'
  },
  magazineluiza: {
    type: 'query_param', 
    paramName: 'partner_id'
  },
  americanas: {
    type: 'custom',
    customTemplate: 'https://www.awin1.com/cread.php?awinmid=XXXXX&awinaffid={affiliateId}&clickref=&p={url}'
  },
  mercadolivre: {
    type: 'custom',
    customTemplate: 'https://mercadolivre.com.br/jm/search?as_word={url}&as_advertiser_id={affiliateId}'
  },
  aliexpress: {
    type: 'custom',
    customTemplate: 'https://s.click.aliexpress.com/e/{affiliateId}?dp={url}'
  },
  shopee: {
    type: 'custom',
    customTemplate: 'https://shope.ee/{affiliateId}?smtt=0.0.9&url={url}'
  },
  casasbahia: {
    type: 'query_param',
    paramName: 'partner_id'
  },
  kabum: {
    type: 'query_param',
    paramName: 'tag'
  },
  // Awin (rede de afiliados)
  awin: {
    type: 'custom',
    customTemplate: 'https://www.awin1.com/cread.php?awinmid={merchantId}&awinaffid={affiliateId}&clickref=crazypromo&p={url}'
  },
  // Lomadee (rede de afiliados)
  lomadee: {
    type: 'custom', 
    customTemplate: 'https://redir.lomadee.com/v2/deeplink?sourceId={affiliateId}&url={url}'
  }
}

/**
 * Gera link de afiliado para um produto
 */
export async function generateAffiliateLink(
  originalUrl: string,
  storeId: string
): Promise<string> {
  const store = await prisma.store.findUnique({
    where: { id: storeId }
  })

  if (!store || !store.affiliateId) {
    return originalUrl // Retorna original se não há configuração
  }

  const config = store.affiliateConfig as AffiliateConfig | null
  
  if (!config) {
    return originalUrl
  }

  try {
    switch (config.type) {
      case 'query_param':
        return addQueryParam(originalUrl, config.paramName!, store.affiliateId)
      
      case 'path_append':
        return appendToPath(originalUrl, config.pathPrefix!, store.affiliateId)
      
      case 'custom':
        return applyCustomTemplate(originalUrl, config.customTemplate!, {
          affiliateId: store.affiliateId,
          merchantId: (store.affiliateConfig as Record<string, string>)?.merchantId || ''
        })
      
      default:
        return originalUrl
    }
  } catch {
    console.error('Erro ao gerar link de afiliado:', originalUrl)
    return originalUrl
  }
}

/**
 * Adiciona parâmetro de query ao URL
 */
function addQueryParam(url: string, paramName: string, paramValue: string): string {
  const urlObj = new URL(url)
  urlObj.searchParams.set(paramName, paramValue)
  return urlObj.toString()
}

/**
 * Adiciona ao path do URL
 */
function appendToPath(url: string, prefix: string, affiliateId: string): string {
  const urlObj = new URL(url)
  urlObj.pathname = `/${prefix}/${affiliateId}${urlObj.pathname}`
  return urlObj.toString()
}

/**
 * Aplica template customizado
 */
function applyCustomTemplate(
  url: string, 
  template: string, 
  params: Record<string, string>
): string {
  let result = template
  result = result.replace('{url}', encodeURIComponent(url))
  
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, value)
  }
  
  return result
}

/**
 * Atualiza links de afiliados de todos os produtos de uma loja
 */
export async function updateStoreAffiliateLinks(storeId: string): Promise<number> {
  const products = await prisma.product.findMany({
    where: { storeId }
  })

  let updated = 0

  for (const product of products) {
    const newAffiliateUrl = await generateAffiliateLink(product.originalUrl, storeId)
    
    if (newAffiliateUrl !== product.affiliateUrl) {
      await prisma.product.update({
        where: { id: product.id },
        data: { affiliateUrl: newAffiliateUrl }
      })
      updated++
    }
  }

  return updated
}

/**
 * Registra um clique em link de afiliado
 */
export async function trackClick(
  productId: string | null,
  promotionId: string | null,
  request: Request
): Promise<void> {
  const headers = Object.fromEntries(request.headers)
  
  await prisma.click.create({
    data: {
      productId,
      promotionId,
      ipAddress: headers['x-forwarded-for'] || headers['x-real-ip'] || null,
      userAgent: headers['user-agent'] || null,
      referer: headers['referer'] || null
    }
  })
}
