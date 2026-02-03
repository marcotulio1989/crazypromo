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
  Tag,
  ShoppingBag,
  CheckCircle,
  Copy,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import PriceHistoryChart from './PriceHistoryChart'
import { useOpenTabs } from '@/contexts/OpenTabsContext'

interface PriceHistory {
  id: string
  price: number
  createdAt: string | Date
}

interface Promotion {
  id: string
  title: string
  promotionPrice: number
  originalPrice: number
  discountPercent: number
  isRealDeal: boolean
  dealScore: number | null
  createdAt: string | Date
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

interface ProductModalProps {
  promotion: Promotion | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ promotion, isOpen, onClose }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const { addTab } = useOpenTabs()

  useEffect(() => {
    // Reset state when modal opens/closes
    if (isOpen && promotion) {
      setRedirectUrl(null)
      setCopied(false)
      setPriceHistory([])
      // Pre-fetch the redirect URL and price history
      fetchRedirectUrl()
      fetchPriceHistory()
    }
  }, [isOpen, promotion])

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const fetchPriceHistory = async () => {
    if (!promotion) return
    
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/products/${promotion.product.id}`)
      const data = await response.json()
      if (data.product?.priceHistory) {
        setPriceHistory(data.product.priceHistory)
      }
    } catch (error) {
      console.error('Erro ao buscar histórico de preços:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

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
      // Fallback
      setRedirectUrl(promotion.product.affiliateUrl || promotion.product.originalUrl)
    }
  }

  const handleGoToStore = async () => {
    if (!promotion) return
    
    setIsLoading(true)
    
    const url = redirectUrl || promotion.product.affiliateUrl || promotion.product.originalUrl
    
    // Abrir em nova aba/janela
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    
    // Tentar manter foco na janela atual (pode não funcionar em todos os browsers)
    if (newWindow) {
      // Voltar foco para janela atual
      window.focus()
      
      // Adicionar ao indicador global de abas abertas
      addTab(url, promotion.product.store.name)
    }
    
    setIsLoading(false)
  }

  const handleCopyLink = async () => {
    if (!promotion) return
    
    const url = redirectUrl || promotion.product.affiliateUrl || promotion.product.originalUrl
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
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

  if (!isOpen || !promotion) return null

  const { product } = promotion
  const isLowestPrice = product.lowestPrice && promotion.promotionPrice <= product.lowestPrice
  const savings = promotion.originalPrice - promotion.promotionPrice

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com imagem */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-red-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
              -{Math.round(promotion.discountPercent)}% OFF
            </div>
            
            {isLowestPrice && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-lg">
                <TrendingDown className="w-3 h-3" />
                Menor preço histórico!
              </div>
            )}

            {!promotion.isRealDeal && promotion.dealScore && promotion.dealScore < 40 && (
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                <AlertTriangle className="w-3 h-3" />
                Promoção duvidosa
              </div>
            )}
          </div>

          {/* Imagem do produto */}
          <div className="h-64 flex items-center justify-center p-8">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={250}
                height={250}
                className="object-contain max-h-full"
              />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <ShoppingBag className="w-16 h-16 mb-2" />
                <span>Sem imagem</span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Loja e categoria */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              <Store className="w-4 h-4" />
              {product.store.name}
            </div>
            {product.category && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {product.category.name}
              </div>
            )}
          </div>

          {/* Título */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {promotion.title || product.name}
          </h2>

          {/* Preços */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Preço promocional</div>
                <div className="text-3xl font-bold text-green-600">
                  R$ {promotion.promotionPrice.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-sm text-gray-400 line-through">
                  De R$ {promotion.originalPrice.toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Você economiza</div>
                <div className="text-2xl font-bold text-orange-600">
                  R$ {savings.toFixed(2).replace('.', ',')}
                </div>
              </div>
            </div>

            {/* Preço médio histórico */}
            {product.averagePrice && (
              <div className="mt-3 pt-3 border-t border-green-200 text-sm text-gray-600">
                📊 Preço médio histórico: <strong>R$ {product.averagePrice.toFixed(2).replace('.', ',')}</strong>
                {promotion.promotionPrice < product.averagePrice && (
                  <span className="text-green-600 ml-2">
                    ({Math.round((1 - promotion.promotionPrice / product.averagePrice) * 100)}% abaixo da média)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Deal Score */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
            <div className={`${getDealScoreColor(promotion.dealScore)} text-white px-4 py-2 rounded-lg font-bold text-lg`}>
              {promotion.dealScore ? `${promotion.dealScore}/100` : 'N/A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${promotion.isRealDeal ? 'text-green-500' : 'text-gray-400'}`} />
                <span className={`font-semibold ${promotion.isRealDeal ? 'text-green-600' : 'text-gray-600'}`}>
                  {getDealScoreLabel(promotion.dealScore)}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {promotion.isRealDeal 
                  ? 'Esta promoção foi verificada e é confiável.' 
                  : 'Verifique o histórico de preços antes de comprar.'}
              </div>
            </div>
          </div>

          {/* Tempo */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Clock className="w-4 h-4" />
            Publicada {formatDistanceToNow(new Date(promotion.createdAt), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>

          {/* Gráfico de histórico de preços */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">📈 Histórico de Preços</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              {loadingHistory ? (
                <div className="h-32 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <PriceHistoryChart 
                  data={priceHistory} 
                  currentPrice={promotion.promotionPrice}
                  averagePrice={product.averagePrice}
                  lowestPrice={product.lowestPrice}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer com ações */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title="Copiar link"
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 font-medium">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">Copiar</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleGoToStore}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Abrindo...
              </>
            ) : (
              <>
                Ir para {product.store.name}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
