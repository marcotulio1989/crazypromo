'use client'

import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react'

interface FilterBarProps {
  categories: Array<{ id: string; name: string; slug: string }>
  stores: Array<{ id: string; name: string; slug: string }>
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  category: string
  store: string
  minDiscount: number
  onlyReal: boolean
  sortBy: 'dealScore' | 'discount' | 'price' | 'newest'
}

export default function FilterBar({ categories, stores, onFilterChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    store: '',
    minDiscount: 0,
    onlyReal: false,
    sortBy: 'dealScore'
  })

  const handleChange = (key: keyof FilterState, value: string | number | boolean) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      category: '',
      store: '',
      minDiscount: 0,
      onlyReal: false,
      sortBy: 'dealScore'
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = filters.category || filters.store || filters.minDiscount > 0 || filters.onlyReal

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      {/* Mobile toggle */}
      <button
        className="md:hidden flex items-center justify-between w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              Ativos
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filters */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Loja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loja
            </label>
            <select
              value={filters.store}
              onChange={(e) => handleChange('store', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.slug}>{store.name}</option>
              ))}
            </select>
          </div>

          {/* Desconto mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desconto mínimo
            </label>
            <select
              value={filters.minDiscount}
              onChange={(e) => handleChange('minDiscount', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value={0}>Qualquer</option>
              <option value={10}>10% ou mais</option>
              <option value={20}>20% ou mais</option>
              <option value={30}>30% ou mais</option>
              <option value={50}>50% ou mais</option>
            </select>
          </div>

          {/* Ordenar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value as FilterState['sortBy'])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="dealScore">Melhor oferta</option>
              <option value="discount">Maior desconto</option>
              <option value="price">Menor preço</option>
              <option value="newest">Mais recentes</option>
            </select>
          </div>

          {/* Apenas reais */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyReal}
                onChange={(e) => handleChange('onlyReal', e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Apenas promoções reais</span>
            </label>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  )
}
