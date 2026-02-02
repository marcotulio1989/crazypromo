'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  X, 
  ExternalLink, 
  TrendingDown, 
  AlertTriangle, 
  Award, 
  Clock,
  Store,
  ShoppingBag,
  CheckCircle,
  Copy,
  RefreshCw,
  Maximize2,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Promotion {
  id: string
  title: string
  promotionPrice: number
  originalPrice: number
  discountPercent: number
  isRealDeal: boolean
  dealScore: number | null
  createdAt: string
  product: {
    id: string
    name: string
    image: string | null
    slug: string
    affiliateUrl: string | null
    originalUrl: string
    lowestPrice: number | null
    averagePrice: number | null
    store: {
      name: string
      logo: string | null
    }
    category: {
      name: string
    } | null
  }
}

interface SplitViewPanelProps {
  promotion: Promotion | null
  onClose: () => void
  popupWindow: Window | null
  popupBlocked: boolean
  onRetryPopup: () => void
}

export default function SplitViewPanel({ 
  promotion, 
  onClose, 
  popupWindow, 
  popupBlocked, 
  onRetryPopup 
}: SplitViewPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    const url = promotion?.product.affiliateUrl || promotion?.product.originalUrl
    if (!url) return
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const handleOpenInNewTab = () => {
    const url = promotion?.product.affiliateUrl || promotion?.product.originalUrl
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const getDealScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-400'
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-lime-500'
    if (score >= 40) return 'bg-yellow-500'
    if (score >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getDealScoreLabel = (score: number | null) => {
    if (!score) return 'Sem dados'
    if (score >= 80) return 'Excelente!'
    if (score >= 60) return 'Bom negócio'
    if (score >= 40) return 'Razoável'
    if (score >= 20) return 'Duvidoso'
    return 'Evite!'
  }

  if (!promotion) return null

  const { product } = promotion
  const isLowestPrice = product.lowestPrice && promotion.promotionPrice <= product.lowestPrice
  const savings = promotion.originalPrice - promotion.promotionPrice
  const popupIsOpen = popupWindow && !popupWindow.closed

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white border-l border-gray-200 shadow-xl">
      {/* Header do painel */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          <span className="font-semibold truncate max-w-[200px]">{product.store.name}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          title="Fechar painel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Imagem do produto */}
        <div className="mb-6">
          <div className="relative w-full h-48 bg-white rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-16 h-16" />
              </div>
            )}
            
            {/* Badge de desconto */}
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold shadow-lg">
              -{Math.round(promotion.discountPercent)}%
            </div>
            
            {/* Badge de menor preço */}
            {isLowestPrice && (
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full font-bold text-sm flex items-center gap-1 shadow-lg">
                <TrendingDown className="w-4 h-4" />
                Menor preço!
              </div>
            )}
          </div>
        </div>

        {/* Informações do produto */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
            {promotion.title || product.name}
          </h2>

          {/* Categoria e tempo */}
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
            {product.category && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(promotion.createdAt), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>

          {/* Preços */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-4 border border-green-200">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-green-600">
                R$ {promotion.promotionPrice.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-lg text-gray-500 line-through">
                R$ {promotion.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="text-green-700 font-semibold">
              Economia de R$ {savings.toFixed(2).replace('.', ',')}
            </div>
            {product.averagePrice && (
              <div className="text-sm text-gray-600 mt-2 pt-2 border-t border-green-200">
                Média histórica: R$ {product.averagePrice.toFixed(2).replace('.', ',')}
              </div>
            )}
          </div>

          {/* Deal Score */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200">
            <div className={`${getDealScoreColor(promotion.dealScore)} text-white px-4 py-2 rounded-lg text-2xl font-bold`}>
              {promotion.dealScore || 'N/A'}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Deal Score</div>
              <div className={`font-semibold ${promotion.isRealDeal ? 'text-green-600' : 'text-gray-600'}`}>
                {getDealScoreLabel(promotion.dealScore)}
              </div>
            </div>
            {promotion.isRealDeal && (
              <Award className="w-6 h-6 text-green-500" />
            )}
            {!promotion.isRealDeal && promotion.dealScore && promotion.dealScore < 40 && (
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Status da janela popup */}
        <div className="mb-6">
          {popupBlocked ? (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-800 mb-1">
                    Pop-up bloqueado
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Seu navegador bloqueou a abertura da loja. Clique no botão abaixo para tentar novamente ou abra manualmente.
                  </p>
                  <button
                    onClick={onRetryPopup}
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar abrir novamente
                  </button>
                </div>
              </div>
            </div>
          ) : popupIsOpen ? (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 mb-1 flex items-center gap-2">
                    Loja aberta
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  </h3>
                  <p className="text-sm text-green-700">
                    A página do {product.store.name} está aberta em uma janela separada no lado direito da tela (30%).
                    Você pode continuar navegando aqui enquanto compra!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ArrowUpRight className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-800 mb-1">
                    Janela fechada
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    A janela da loja foi fechada. Clique abaixo para reabrir.
                  </p>
                  <button
                    onClick={onRetryPopup}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Reabrir loja
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <button
            onClick={handleOpenInNewTab}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <ExternalLink className="w-5 h-5" />
            Abrir {product.store.name} em nova aba
          </button>
          
          <button
            onClick={handleCopyLink}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                Link copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar link do produto
              </>
            )}
          </button>
        </div>

        {/* Dica */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <p className="text-sm text-purple-900 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Dica:</strong> A janela da loja abre no lado direito ocupando 30% da tela. 
              Você pode continuar navegando nas promoções enquanto completa sua compra!
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
