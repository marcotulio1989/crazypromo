'use client'

import { useState, useEffect } from 'react'
import PromotionCard from '@/components/PromotionCard'
import FilterBar, { FilterState } from '@/components/FilterBar'
import { Loader2 } from 'lucide-react'

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

interface Category {
  id: string
  name: string
  slug: string
}

interface Store {
  id: string
  name: string
  slug: string
}

export default function PromocoesPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    store: '',
    minDiscount: 0,
    onlyReal: false,
    sortBy: 'dealScore'
  })

  useEffect(() => {
    fetchCategories()
    fetchStores()
  }, [])

  useEffect(() => {
    fetchPromotions()
  }, [page, filters])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    }
  }

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores')
      const data = await res.json()
      setStores(data)
    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
    }
  }

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: filters.sortBy,
        minDiscount: filters.minDiscount.toString(),
        onlyReal: filters.onlyReal.toString()
      })
      
      if (filters.category) params.append('category', filters.category)
      if (filters.store) params.append('store', filters.store)

      const res = await fetch(`/api/promotions?${params}`)
      const data = await res.json()
      
      setPromotions(data.promotions)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Erro ao buscar promoções:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        🔥 Todas as Promoções
      </h1>

      <FilterBar 
        categories={categories} 
        stores={stores} 
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : promotions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {promotions.map((promo) => (
              <PromotionCard 
                key={promo.id} 
                promotion={promo}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-4 py-2">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl">
          <p className="text-gray-500 text-lg">
            Nenhuma promoção encontrada com os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  )
}
