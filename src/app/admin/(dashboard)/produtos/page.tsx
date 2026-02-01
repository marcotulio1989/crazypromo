'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, TrendingUp, Eye } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  image: string | null
  currentPrice: number
  averagePrice: number | null
  lowestPrice: number | null
  store: {
    name: string
  }
  category: {
    name: string
  } | null
  promotions: Array<{
    id: string
    isActive: boolean
  }>
}

export default function AdminProdutos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [page, search])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      })
      
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      fetchProducts()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir produto')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar produtos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Atual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Média
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menor
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
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                      {product.category && (
                        <p className="text-sm text-gray-500">{product.category.name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {product.store.name}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  R$ {product.currentPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {product.averagePrice 
                    ? `R$ ${product.averagePrice.toFixed(2)}`
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  {product.lowestPrice 
                    ? `R$ ${product.lowestPrice.toFixed(2)}`
                    : '-'
                  }
                </td>
                <td className="px-6 py-4">
                  {product.promotions.some(p => p.isActive) ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Em promoção
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      Normal
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/produtos/${product.id}/historico`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver histórico"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            Nenhum produto encontrado
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
