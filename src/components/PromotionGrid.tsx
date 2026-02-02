'use client'

import PromotionCard from './PromotionCard'

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

interface PromotionGridProps {
  promotions: Promotion[]
}

export default function PromotionGrid({ promotions }: PromotionGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {promotions.map((promo) => (
        <PromotionCard 
          key={promo.id} 
          promotion={promo}
        />
      ))}
    </div>
  )
}
