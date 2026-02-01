'use client'

import { useState, useEffect } from 'react'

interface ProductOffer {
  id: string
  storeId: string
  storeName: string
  storeLogo?: string | null
  price: number
  originalPrice: number | null
  discount: number | null
  affiliateLink: string | null
  inStock: boolean
}

interface ProductGroup {
  name: string
  ean: string | null
  brand: string | null
  image: string | null
  lowestPrice: number
  highestPrice: number
  storeCount: number
  savings: number
  offers: ProductOffer[]
}

interface BestPrice {
  name: string
  ean: string
  brand: string | null
  image: string | null
  lowestPrice: number
  highestPrice: number
  storeCount: number
  savings: number
  offers: ProductOffer[]
}

export default function ComparadorPage() {
  const [bestPrices, setBestPrices] = useState<BestPrice[]>([])
  const [searchResults, setSearchResults] = useState<ProductGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState<'name' | 'ean'>('name')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  useEffect(() => {
    fetchBestPrices()
  }, [])

  const fetchBestPrices = async () => {
    try {
      const res = await fetch('/api/feeds?limit=50')
      const data = await res.json()
      setBestPrices(data.bestPrices || [])
    } catch (error) {
      console.error('Erro ao carregar melhores preços:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setSearching(true)
    try {
      const params = new URLSearchParams()
      if (searchType === 'ean') {
        params.set('ean', searchTerm)
      } else {
        params.set('name', searchTerm)
      }

      const res = await fetch(`/api/feeds/compare?${params}`)
      const data = await res.json()
      
      if (data.productGroups) {
        setSearchResults(data.productGroups)
      } else if (data.data) {
        setSearchResults(data.data)
      }
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setSearching(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const displayProducts = searchResults.length > 0 ? searchResults : bestPrices

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⚖️ Comparador de Preços</h1>
        <p className="text-gray-600">Compare preços do mesmo produto em diferentes lojas</p>
      </div>

      {/* Busca */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'name' | 'ean')}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="name">Nome</option>
            <option value="ean">EAN/Código de Barras</option>
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchType === 'ean' ? 'Digite o código EAN...' : 'Digite o nome do produto...'}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {searching ? 'Buscando...' : '🔍 Buscar'}
          </button>
          {searchResults.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchResults([])
                setSearchTerm('')
              }}
              className="text-gray-600 hover:text-gray-800 px-4 py-2"
            >
              Limpar
            </button>
          )}
        </div>
      </form>

      {/* Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800">
          <strong>💡 Dica:</strong> Produtos são agrupados automaticamente pelo código EAN (código de barras).
          Isso permite comparar o mesmo produto em diferentes lojas e encontrar o melhor preço!
        </p>
      </div>

      {/* Lista de Produtos Comparados */}
      {displayProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-2">Nenhum produto para comparar</p>
          <p>Importe produtos de feeds para começar a comparar preços</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayProducts.map((product, index) => (
            <div key={product.ean || index} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header do Produto */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedProduct(expandedProduct === (product.ean || String(index)) ? null : (product.ean || String(index)))}
              >
                <div className="flex items-center gap-4">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-16 h-16 object-contain rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      {product.brand && <span>Marca: {product.brand}</span>}
                      {product.ean && <span>EAN: {product.ean}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(product.lowestPrice)}
                        </p>
                        {product.highestPrice > product.lowestPrice && (
                          <p className="text-sm text-gray-400 line-through">
                            até {formatPrice(product.highestPrice)}
                          </p>
                        )}
                      </div>
                      {product.savings > 0 && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Economia: {formatPrice(product.savings)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Em {product.storeCount} {product.storeCount === 1 ? 'loja' : 'lojas'}
                    </p>
                  </div>
                  <span className="text-gray-400 text-xl">
                    {expandedProduct === (product.ean || String(index)) ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {/* Lista de Ofertas (expandido) */}
              {expandedProduct === (product.ean || String(index)) && product.offers && (
                <div className="border-t border-gray-100">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loja</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Desconto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {product.offers.map((offer, offerIndex) => (
                        <tr 
                          key={offer.id || offerIndex} 
                          className={offerIndex === 0 ? 'bg-green-50' : ''}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {offer.storeLogo && (
                                <img src={offer.storeLogo} alt="" className="w-6 h-6 rounded" />
                              )}
                              <span className="font-medium">{offer.storeName}</span>
                              {offerIndex === 0 && (
                                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                                  MENOR PREÇO
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${offerIndex === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {formatPrice(offer.price)}
                            </span>
                            {offer.originalPrice && offer.originalPrice > offer.price && (
                              <span className="text-gray-400 line-through text-sm ml-2">
                                {formatPrice(offer.originalPrice)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {offer.discount ? (
                              <span className="text-orange-600 font-medium">-{offer.discount}%</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {offer.inStock ? (
                              <span className="text-green-600">✓ Em estoque</span>
                            ) : (
                              <span className="text-red-500">✗ Indisponível</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {offer.affiliateLink ? (
                              <a
                                href={offer.affiliateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-500 hover:text-orange-700 font-medium"
                              >
                                Ver oferta →
                              </a>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
