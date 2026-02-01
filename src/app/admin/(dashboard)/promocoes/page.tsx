'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Award } from 'lucide-react'
import Link from 'next/link'
import DealScoreBadge from '@/components/DealScoreBadge'

interface Promotion {
  id: string
  title: string
  promotionPrice: number
  originalPrice: number
  discountPercent: number
  dealScore: number | null
  isRealDeal: boolean
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  product: {
    name: string
    store: {
      name: string
    }
  }
}

export default function AdminPromocoes() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPromotions()
  }, [page])

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
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

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await fetch(`/api/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !featured })
      })
      fetchPromotions()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !active })
      })
      fetchPromotions()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta promoção?')) return
    
    try {
      await fetch(`/api/promotions/${id}`, { method: 'DELETE' })
      fetchPromotions()
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Promoções</h1>
        <Link
          href="/admin/promocoes/nova"
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Promoção
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold">{promotions.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-500 text-sm">Ativas</p>
          <p className="text-2xl font-bold text-green-600">
            {promotions.filter(p => p.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-500 text-sm">Reais (Verificadas)</p>
          <p className="text-2xl font-bold text-blue-600">
            {promotions.filter(p => p.isRealDeal).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-500 text-sm">Em Destaque</p>
          <p className="text-2xl font-bold text-orange-500">
            {promotions.filter(p => p.isFeatured).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Promoção
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preços
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Desconto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deal Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {promotions.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800 line-clamp-1">{promo.title}</p>
                    <p className="text-sm text-gray-500">
                      {promo.product.store.name}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-green-600">
                    R$ {promo.promotionPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 line-through">
                    R$ {promo.originalPrice.toFixed(2)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-red-600 font-bold">
                    -{Math.round(promo.discountPercent)}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <DealScoreBadge 
                    score={promo.dealScore} 
                    isRealDeal={promo.isRealDeal}
                    size="sm"
                    showLabel={false}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleToggleActive(promo.id, promo.isActive)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        promo.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {promo.isActive ? 'Ativa' : 'Inativa'}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(promo.id, promo.isFeatured)}
                      className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                        promo.isFeatured 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      {promo.isFeatured ? 'Destaque' : 'Normal'}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/promocoes/${promo.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {promotions.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma promoção encontrada
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2 bg-white rounded-lg shadow">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white rounded-lg shadow disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}
