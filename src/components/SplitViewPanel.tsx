'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  X, 
  ExternalLink, 
  TrendingDown, 
  AlertTriangle, 
  Award, 
  Clock,
  Store,
  Tag,
  ShoppingBag,
  CheckCircle,
  Copy,
  ArrowRight,
  Loader2,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Maximize2
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
}

type IframeStatus = 'loading' | 'loaded' | 'blocked' | 'error'

export default function SplitViewPanel({ promotion, onClose }: SplitViewPanelProps) {
  const [iframeStatus, setIframeStatus] = useState<IframeStatus>('loading')
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showProductInfo, setShowProductInfo] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (promotion) {
      setIframeStatus('loading')
      setShowProductInfo(true)
      fetchRedirectUrl()
    }
  }, [promotion])

  // Detectar se o iframe foi bloqueado
  useEffect(() => {
    if (!redirectUrl || !promotion) return

    // Timeout para detectar bloqueio (se não carregar em 5s, provavelmente foi bloqueado)
    loadTimeoutRef.current = setTimeout(() => {
      if (iframeStatus === 'loading') {
        setIframeStatus('blocked')
      }
    }, 5000)

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [redirectUrl, iframeStatus, promotion])

  const fetchRedirectUrl = async () => {
    if (!promotion) return
    
    try {
      const response = await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: promotion.product.id,
          promotionId: promotion.id 
        })
      })
      
      const data = await response.json()
      if (data.redirectUrl) {
        setRedirectUrl(data.redirectUrl)
      }
    } catch (error) {
      setRedirectUrl(promotion.product.affiliateUrl || promotion.product.originalUrl)
    }
  }

  const handleIframeLoad = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }
    
    // Tentar verificar se o iframe carregou corretamente
    try {
      const iframe = iframeRef.current
      if (iframe) {
        // Se conseguimos acessar o contentWindow, provavelmente carregou
        // Mas sites bloqueados também podem "carregar" uma página em branco
        setIframeStatus('loaded')
      }
    } catch (e) {
      // Cross-origin error - o iframe foi bloqueado ou carregou outro domínio
      setIframeStatus('blocked')
    }
  }

  const handleIframeError = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current)
    }
    setIframeStatus('blocked')
  }

  const handleOpenInNewTab = () => {
    const url = redirectUrl || promotion?.product.affiliateUrl || promotion?.product.originalUrl
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleCopyLink = async () => {
    const url = redirectUrl || promotion?.product.affiliateUrl || promotion?.product.originalUrl
    if (!url) return
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const handleRetry = () => {
    setIframeStatus('loading')
    // Forçar reload do iframe
    if (iframeRef.current && redirectUrl) {
      iframeRef.current.src = redirectUrl
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

  if (!promotion) return null

  const { product } = promotion
  const isLowestPrice = product.lowestPrice && promotion.promotionPrice <= product.lowestPrice
  const savings = promotion.originalPrice - promotion.promotionPrice
  const storeUrl = redirectUrl || product.affiliateUrl || product.originalUrl

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 shadow-xl">
      {/* Header do painel */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          <span className="font-semibold truncate max-w-[150px]">{product.store.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenInNewTab}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Abrir em nova aba"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Fechar painel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Informações do produto (colapsável) */}
      {showProductInfo && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            {/* Imagem pequena */}
            <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden border">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="object-contain w-full h-full p-1"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                {promotion.title || product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-green-600">
                  R$ {promotion.promotionPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  R$ {promotion.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  -{Math.round(promotion.discountPercent)}%
                </span>
                {isLowestPrice && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Menor!
                  </span>
                )}
                <span className={`${getDealScoreColor(promotion.dealScore)} text-white text-xs px-2 py-0.5 rounded-full`}>
                  {promotion.dealScore || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Botão para esconder info */}
          <button
            onClick={() => setShowProductInfo(false)}
            className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-3 h-3 rotate-90" />
            Esconder detalhes
          </button>
        </div>
      )}

      {/* Área do iframe / fallback */}
      <div className="flex-1 relative overflow-hidden">
        {/* Estado de carregamento */}
        {iframeStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600 font-medium">Carregando {product.store.name}...</p>
            <p className="text-gray-400 text-sm mt-1">Isso pode levar alguns segundos</p>
          </div>
        )}

        {/* Iframe bloqueado - Fallback */}
        {iframeStatus === 'blocked' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-10 p-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Site protegido
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                O <strong>{product.store.name}</strong> bloqueia visualização embutida por segurança.
                Abra em uma nova aba para continuar sua compra.
              </p>

              {/* Resumo da oferta */}
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <div className="text-2xl font-bold text-green-600">
                  R$ {promotion.promotionPrice.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-sm text-gray-500">
                  Economia de R$ {savings.toFixed(2).replace('.', ',')}
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-2">
                <button
                  onClick={handleOpenInNewTab}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                >
                  Abrir {product.store.name}
                  <ExternalLink className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleCopyLink}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Link copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar link
                    </>
                  )}
                </button>

                <button
                  onClick={handleRetry}
                  className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Tentar novamente
                </button>
              </div>
            </div>

            {/* Dica */}
            <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
              💡 Dica: Você pode continuar navegando nas promoções enquanto a loja fica aberta em outra aba
            </p>
          </div>
        )}

        {/* Iframe */}
        {storeUrl && (
          <iframe
            ref={iframeRef}
            src={storeUrl}
            className={`w-full h-full border-0 ${iframeStatus === 'blocked' ? 'invisible' : ''}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            referrerPolicy="no-referrer-when-downgrade"
            title={`${product.store.name} - ${product.name}`}
          />
        )}
      </div>

      {/* Botão flutuante para mostrar info novamente */}
      {!showProductInfo && (
        <button
          onClick={() => setShowProductInfo(true)}
          className="absolute top-16 left-2 bg-white shadow-lg rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition-colors z-20"
          title="Mostrar detalhes do produto"
        >
          <ChevronLeft className="w-4 h-4 -rotate-90 text-gray-600" />
        </button>
      )}
    </div>
  )
}
