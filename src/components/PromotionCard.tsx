'use client'

import Image from 'next/image'
import { ExternalLink, TrendingDown, AlertTriangle, Award, Clock, Columns } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSplitView } from '@/components/SplitViewContext'

interface PromotionCardProps {
  promotion: {
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
  onOpenModal?: () => void // Mantido para compatibilidade
}

export default function PromotionCard({ promotion, onOpenModal }: PromotionCardProps) {
  const { product } = promotion
  const isLowestPrice = product.lowestPrice && promotion.promotionPrice <= product.lowestPrice
  const { openPanelOnly, openPanelWithPopup } = useSplitView()
  
  // Ver Detalhes - apenas abre o painel com informações
  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    openPanelOnly(promotion)
  }

  // Comprar - abre o painel E a popup da loja
  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation()
    openPanelWithPopup(promotion)
  }

  const handleCardClick = () => {
    // Click no card abre apenas os detalhes
    openPanelOnly(promotion)
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

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Badges */}
      <div className="relative">
        {/* Imagem */}
        <div className="relative h-48 bg-gray-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
        </div>

        {/* Badge de desconto */}
        <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
          -{Math.round(promotion.discountPercent)}%
        </div>

        {/* Badge de menor preço histórico */}
        {isLowestPrice && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full font-bold text-xs flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Menor preço!
          </div>
        )}

        {/* Deal Score */}
        <div className={`absolute bottom-2 right-2 ${getDealScoreColor(promotion.dealScore)} text-white px-2 py-1 rounded-lg text-xs font-semibold`}>
          {promotion.dealScore ? `${promotion.dealScore}/100` : 'N/A'}
        </div>

        {/* Alerta de promoção duvidosa */}
        {!promotion.isRealDeal && promotion.dealScore && promotion.dealScore < 40 && (
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Verificar
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Loja e categoria */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 font-medium">
            {product.store.name}
          </span>
          {product.category && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Nome do produto */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
          {promotion.title || product.name}
        </h3>

        {/* Preços */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">
              R$ {promotion.promotionPrice.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-sm text-gray-400 line-through">
              R$ {promotion.originalPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          {/* Informações de preço histórico */}
          {product.averagePrice && (
            <div className="text-xs text-gray-500 mt-1">
              Média histórica: R$ {product.averagePrice.toFixed(2).replace('.', ',')}
            </div>
          )}
        </div>

        {/* Deal Score Label */}
        <div className="flex items-center gap-2 mb-3">
          <Award className={`w-4 h-4 ${promotion.isRealDeal ? 'text-green-500' : 'text-gray-400'}`} />
          <span className={`text-sm ${promotion.isRealDeal ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            {getDealScoreLabel(promotion.dealScore)}
          </span>
        </div>

        {/* Tempo */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(promotion.createdAt), { 
            addSuffix: true, 
            locale: ptBR 
          })}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <Columns className="w-4 h-4" />
            Ver Detalhes
          </button>
          <button
            onClick={handleBuy}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
          >
            Comprar
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
