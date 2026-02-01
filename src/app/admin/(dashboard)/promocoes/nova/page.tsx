'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import DealScoreBadge from '@/components/DealScoreBadge'

interface Product {
  id: string
  name: string
  currentPrice: number
  averagePrice: number | null
  store: { name: string }
}

interface Analysis {
  isRealDeal: boolean
  dealScore: number
  discountFromAverage: number
  priceManipulationDetected: boolean
  recommendation: string
  analysis: string
}

export default function NovaPromocao() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    description: '',
    promotionPrice: '',
    originalPrice: '',
    isFeatured: false
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const res = await fetch('/api/products?limit=100')
    const data = await res.json()
    setProducts(data.products)
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setFormData({
        ...formData,
        productId,
        promotionPrice: product.currentPrice.toString()
      })
      setAnalysis(null)
    }
  }

  const analyzePromotion = async () => {
    if (!formData.productId || !formData.promotionPrice || !formData.originalPrice) {
      alert('Preencha o produto e os preços primeiro')
      return
    }

    setAnalyzing(true)
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formData.productId,
          promotionPrice: parseFloat(formData.promotionPrice),
          originalPrice: parseFloat(formData.originalPrice),
          title: formData.title || 'Análise',
          dryRun: true // Apenas análise, não criar
        })
      })

      const data = await res.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Erro na análise:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const product = products.find(p => p.id === formData.productId)
      const discount = ((parseFloat(formData.originalPrice) - parseFloat(formData.promotionPrice)) / parseFloat(formData.originalPrice) * 100).toFixed(0)

      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formData.productId,
          title: formData.title || `${discount}% OFF - ${product?.name}`,
          description: formData.description,
          promotionPrice: parseFloat(formData.promotionPrice),
          originalPrice: parseFloat(formData.originalPrice),
          isFeatured: formData.isFeatured
        })
      })

      if (res.ok) {
        router.push('/admin/promocoes')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao criar promoção')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar promoção')
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = products.find(p => p.id === formData.productId)

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/promocoes"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Nova Promoção</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.store.name} (R$ {product.currentPrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da Promoção
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: 30% OFF - Nome do Produto"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para gerar automaticamente
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Promocional (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.promotionPrice}
                  onChange={(e) => setFormData({ ...formData, promotionPrice: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Original (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {formData.promotionPrice && formData.originalPrice && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Desconto: <span className="font-bold text-red-600">
                    {((parseFloat(formData.originalPrice) - parseFloat(formData.promotionPrice)) / parseFloat(formData.originalPrice) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="isFeatured" className="text-sm text-gray-700">
                ⭐ Destacar na página inicial
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={analyzePromotion}
                disabled={analyzing || !formData.productId}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  '🔍 Analisar Promoção'
                )}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Criar Promoção
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Painel de Análise */}
        <div className="space-y-6">
          {selectedProduct && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Informações do Produto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Preço atual:</span>
                  <span className="font-medium">R$ {selectedProduct.currentPrice.toFixed(2)}</span>
                </div>
                {selectedProduct.averagePrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Média histórica:</span>
                    <span className="font-medium">R$ {selectedProduct.averagePrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {analysis && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">📊 Análise da Promoção</h3>
              
              <div className="mb-4">
                <DealScoreBadge 
                  score={analysis.dealScore} 
                  isRealDeal={analysis.isRealDeal}
                  priceManipulationDetected={analysis.priceManipulationDetected}
                  size="lg"
                />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  {analysis.isRealDeal ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span>
                    {analysis.isRealDeal 
                      ? 'Promoção verificada como real!' 
                      : 'Promoção precisa de revisão'
                    }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Desconto vs média:</span>
                  <span className={analysis.discountFromAverage > 0 ? 'text-green-600' : 'text-red-600'}>
                    {analysis.discountFromAverage > 0 ? '-' : '+'}{Math.abs(analysis.discountFromAverage)}%
                  </span>
                </div>

                {analysis.priceManipulationDetected && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs">
                    ⚠️ Possível manipulação de preço detectada!
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">{analysis.analysis}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
