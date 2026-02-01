/**
 * Sistema Inteligente de Análise de Preços
 * 
 * Este módulo é responsável por:
 * 1. Calcular se uma promoção é real ou falsa
 * 2. Gerar pontuação de qualidade da promoção (Deal Score)
 * 3. Detectar manipulação de preços (aumentar para depois "diminuir")
 */

import { prisma } from './prisma'

export interface PriceAnalysis {
  isRealDeal: boolean
  dealScore: number // 0-100
  discountFromAverage: number // % de desconto em relação ao preço médio
  discountFromLowest: number // % de desconto em relação ao menor preço
  priceManipulationDetected: boolean
  recommendation: 'excellent' | 'good' | 'average' | 'suspicious' | 'avoid'
  analysis: string
}

export interface PriceStats {
  average: number
  lowest: number
  highest: number
  median: number
  standardDeviation: number
  recentTrend: 'rising' | 'falling' | 'stable'
}

/**
 * Calcula estatísticas de preço baseado no histórico
 */
export async function calculatePriceStats(productId: string, days: number = 90): Promise<PriceStats | null> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const history = await prisma.priceHistory.findMany({
    where: {
      productId,
      createdAt: { gte: since }
    },
    orderBy: { createdAt: 'asc' }
  })

  if (history.length < 3) {
    return null // Dados insuficientes para análise
  }

  const prices = history.map((h: { price: number }) => h.price)
  
  // Cálculos básicos
  const average = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
  const lowest = Math.min(...prices)
  const highest = Math.max(...prices)
  
  // Mediana
  const sorted = [...prices].sort((a, b) => a - b)
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]
  
  // Desvio padrão
  const squaredDiffs = prices.map((price: number) => Math.pow(price - average, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a: number, b: number) => a + b, 0) / prices.length
  const standardDeviation = Math.sqrt(avgSquaredDiff)

  // Tendência recente (últimos 7 dias vs média)
  const recentPrices = history.slice(-7).map((h: { price: number }) => h.price)
  const recentAverage = recentPrices.reduce((a: number, b: number) => a + b, 0) / recentPrices.length
  
  let recentTrend: 'rising' | 'falling' | 'stable' = 'stable'
  const trendThreshold = average * 0.05 // 5% de variação
  
  if (recentAverage > average + trendThreshold) {
    recentTrend = 'rising'
  } else if (recentAverage < average - trendThreshold) {
    recentTrend = 'falling'
  }

  return {
    average,
    lowest,
    highest,
    median,
    standardDeviation,
    recentTrend
  }
}

/**
 * Detecta possível manipulação de preços
 * Padrão: Aumento significativo seguido de "desconto" para o preço original
 */
export async function detectPriceManipulation(productId: string, days: number = 30): Promise<boolean> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const history = await prisma.priceHistory.findMany({
    where: {
      productId,
      createdAt: { gte: since }
    },
    orderBy: { createdAt: 'asc' }
  })

  if (history.length < 5) {
    return false // Dados insuficientes
  }

  // Procura por padrões de manipulação
  // Padrão 1: Aumento > 20% seguido de queda para próximo do preço original
  for (let i = 2; i < history.length; i++) {
    const priceBefore = history[i - 2].price
    const priceMiddle = history[i - 1].price
    const priceAfter = history[i].price

    const increasePercent = ((priceMiddle - priceBefore) / priceBefore) * 100
    const decreasePercent = ((priceMiddle - priceAfter) / priceMiddle) * 100

    // Se houve aumento > 20% e depois queda > 15%, pode ser manipulação
    if (increasePercent > 20 && decreasePercent > 15) {
      // Verifica se o preço final está próximo do preço original
      const diffFromOriginal = Math.abs(priceAfter - priceBefore) / priceBefore * 100
      if (diffFromOriginal < 10) {
        return true // Manipulação detectada
      }
    }
  }

  return false
}

/**
 * Analisa se uma promoção é real e calcula o Deal Score
 */
export async function analyzePromotion(
  productId: string,
  currentPrice: number,
  claimedOriginalPrice: number
): Promise<PriceAnalysis> {
  const stats = await calculatePriceStats(productId)
  const manipulationDetected = await detectPriceManipulation(productId)

  // Se não temos histórico suficiente
  if (!stats) {
    return {
      isRealDeal: false,
      dealScore: 50, // Neutro
      discountFromAverage: 0,
      discountFromLowest: 0,
      priceManipulationDetected: false,
      recommendation: 'average',
      analysis: 'Histórico de preços insuficiente para análise completa. Recomendamos aguardar mais dados.'
    }
  }

  // Cálculos de desconto
  const discountFromAverage = ((stats.average - currentPrice) / stats.average) * 100
  const discountFromLowest = ((stats.lowest - currentPrice) / stats.lowest) * 100
  const claimedDiscount = ((claimedOriginalPrice - currentPrice) / claimedOriginalPrice) * 100

  // Verificar se o "preço original" é real
  const isOriginalPriceReal = claimedOriginalPrice <= stats.highest * 1.1 // 10% de tolerância

  // Calcular Deal Score (0-100)
  let dealScore = 50 // Base

  // Bônus por desconto real em relação à média
  if (discountFromAverage > 0) {
    dealScore += Math.min(discountFromAverage * 1.5, 30) // Max +30
  } else {
    dealScore += Math.max(discountFromAverage * 2, -30) // Max -30
  }

  // Bônus por estar abaixo ou próximo do menor preço histórico
  if (currentPrice <= stats.lowest) {
    dealScore += 20 // Melhor preço de todos os tempos!
  } else if (currentPrice <= stats.lowest * 1.05) {
    dealScore += 10 // Muito próximo do menor preço
  }

  // Penalidade por manipulação de preço
  if (manipulationDetected) {
    dealScore -= 25
  }

  // Penalidade se o "preço original" declarado é irreal
  if (!isOriginalPriceReal) {
    dealScore -= 15
  }

  // Bônus/penalidade por tendência
  if (stats.recentTrend === 'falling') {
    dealScore += 5 // Preços caindo é bom
  } else if (stats.recentTrend === 'rising') {
    dealScore -= 5 // Preços subindo
  }

  // Limitar entre 0-100
  dealScore = Math.max(0, Math.min(100, dealScore))

  // Determinar se é uma promoção real
  const isRealDeal = dealScore >= 60 && 
                     discountFromAverage > 5 && 
                     !manipulationDetected &&
                     isOriginalPriceReal

  // Determinar recomendação
  let recommendation: PriceAnalysis['recommendation']
  if (manipulationDetected) {
    recommendation = 'suspicious'
  } else if (dealScore >= 80) {
    recommendation = 'excellent'
  } else if (dealScore >= 65) {
    recommendation = 'good'
  } else if (dealScore >= 45) {
    recommendation = 'average'
  } else if (dealScore >= 30) {
    recommendation = 'suspicious'
  } else {
    recommendation = 'avoid'
  }

  // Gerar análise textual
  let analysis = ''
  
  if (currentPrice <= stats.lowest) {
    analysis = '🔥 MENOR PREÇO HISTÓRICO! Este é o melhor momento para comprar. '
  } else if (discountFromAverage > 20) {
    analysis = '✨ Excelente promoção! Preço muito abaixo da média histórica. '
  } else if (discountFromAverage > 10) {
    analysis = '👍 Boa promoção! Preço abaixo da média histórica. '
  } else if (discountFromAverage > 0) {
    analysis = '📊 Promoção modesta. Preço levemente abaixo da média. '
  } else {
    analysis = '⚠️ Preço acima da média histórica. '
  }

  if (manipulationDetected) {
    analysis += '🚨 ALERTA: Detectamos possível manipulação de preços recente. '
  }

  if (!isOriginalPriceReal) {
    analysis += '⚠️ O "preço original" declarado parece inflacionado. '
  }

  if (stats.recentTrend === 'falling') {
    analysis += '📉 Tendência: preços em queda.'
  } else if (stats.recentTrend === 'rising') {
    analysis += '📈 Tendência: preços em alta.'
  }

  return {
    isRealDeal,
    dealScore: Math.round(dealScore),
    discountFromAverage: Math.round(discountFromAverage * 10) / 10,
    discountFromLowest: Math.round(discountFromLowest * 10) / 10,
    priceManipulationDetected: manipulationDetected,
    recommendation,
    analysis
  }
}

/**
 * Atualiza as estatísticas de preço de um produto
 */
export async function updateProductPriceStats(productId: string): Promise<void> {
  const stats = await calculatePriceStats(productId)
  
  if (!stats) return

  await prisma.product.update({
    where: { id: productId },
    data: {
      averagePrice: stats.average,
      lowestPrice: stats.lowest,
      highestPrice: stats.highest,
    }
  })
}

/**
 * Registra um novo preço no histórico
 */
export async function recordPrice(
  productId: string, 
  price: number, 
  source: string = 'scraping'
): Promise<void> {
  // Registrar no histórico
  await prisma.priceHistory.create({
    data: {
      productId,
      price,
      source
    }
  })

  // Atualizar preço atual do produto
  await prisma.product.update({
    where: { id: productId },
    data: {
      currentPrice: price,
      lastChecked: new Date()
    }
  })

  // Recalcular estatísticas
  await updateProductPriceStats(productId)
}
