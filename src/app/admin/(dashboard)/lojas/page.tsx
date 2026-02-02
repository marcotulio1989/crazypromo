'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, ExternalLink, Settings, Download, FileJson, FileSpreadsheet } from 'lucide-react'

interface AffiliateConfig {
  type: string
  paramName?: string
  customTemplate?: string
}

interface Store {
  id: string
  name: string
  slug: string
  logo: string | null
  website: string
  affiliateId: string | null
  affiliateUrl: string | null
  affiliateConfig: AffiliateConfig | null
  commission: number | null
  isActive: boolean
  _count: {
    products: number
  }
}

export default function AdminLojas() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores?onlyActive=false')
      const data = await res.json()
      setStores(data)
    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return
    
    try {
      await fetch(`/api/stores/${id}`, { method: 'DELETE' })
      fetchStores()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir loja')
    }
  }

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Lojas & Afiliados</h1>
        <button
          onClick={() => { setEditingStore(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Loja
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lojas..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div key={store.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{store.name}</h3>
                  <a 
                    href={store.website} 
                    target="_blank" 
                    className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1"
                  >
                    {store.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  store.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {store.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Produtos:</span>
                  <span className="font-medium">{store._count.products}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Afiliado:</span>
                  <span className="font-medium font-mono text-xs">
                    {store.affiliateId || <span className="text-red-500">⚠️ Não configurado</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-medium text-xs">
                    {store.affiliateConfig?.type === 'custom' ? '🔗 Template' : '📎 Query param'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Comissão:</span>
                  <span className="font-medium">
                    {store.commission ? `${store.commission}%` : '-'}
                  </span>
                </div>
              </div>

              {/* Botões de Download */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <a
                  href={`/api/stores/${store.id}/export?format=json`}
                  download
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  title="Baixar JSON com todos os dados"
                >
                  <FileJson className="w-4 h-4" />
                  JSON
                </a>
                <a
                  href={`/api/stores/${store.id}/export?format=csv`}
                  download
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                  title="Baixar CSV para Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV
                </a>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => { setEditingStore(store); setShowModal(true) }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configurar
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <StoreModal
          store={editingStore}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchStores() }}
        />
      )}
    </div>
  )
}

function StoreModal({ 
  store, 
  onClose, 
  onSave 
}: { 
  store: Store | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: store?.name || '',
    website: store?.website || '',
    logo: store?.logo || '',
    affiliateId: store?.affiliateId || '',
    affiliateUrl: store?.affiliateUrl || '',
    commission: store?.commission?.toString() || '',
    affiliateType: store?.affiliateConfig?.type || 'query_param',
    affiliateParamName: store?.affiliateConfig?.paramName || 'tag',
    customTemplate: store?.affiliateConfig?.customTemplate || '',
    isActive: store?.isActive ?? true
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const affiliateConfig = {
        type: formData.affiliateType,
        paramName: formData.affiliateParamName,
        customTemplate: formData.customTemplate
      }

      const url = store ? `/api/stores/${store.id}` : '/api/stores'
      const method = store ? 'PATCH' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          website: formData.website,
          logo: formData.logo || null,
          affiliateId: formData.affiliateId || null,
          affiliateUrl: formData.affiliateUrl || null,
          affiliateConfig,
          commission: formData.commission ? parseFloat(formData.commission) : null,
          isActive: formData.isActive
        })
      })

      onSave()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar loja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {store ? 'Editar Loja' : 'Nova Loja'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Loja *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website *
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://www.exemplo.com.br"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo (URL)
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            🔗 Configuração de Links de Afiliados
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            Configure como os links de produtos serão transformados em links de afiliados
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seu ID de Afiliado *
            </label>
            <input
              type="text"
              value={formData.affiliateId}
              onChange={(e) => setFormData({ ...formData, affiliateId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
              placeholder="ex: crazypromo-20 (Amazon), 12345 (Lomadee)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este é o ID que você recebeu ao se cadastrar no programa de afiliados
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Base de Afiliados (opcional)
            </label>
            <input
              type="url"
              value={formData.affiliateUrl}
              onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
              placeholder="ex: https://redir.lomadee.com/v2/deeplink"
            />
            <p className="text-xs text-gray-500 mt-1">
              Para redes como Lomadee ou Awin, coloque a URL base do redirecionamento
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Link de Afiliado
            </label>
            <select
              value={formData.affiliateType}
              onChange={(e) => setFormData({ ...formData, affiliateType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="query_param">Parâmetro de Query (ex: Amazon, Kabum)</option>
              <option value="custom">Template Customizado (ex: Lomadee, Awin)</option>
            </select>
          </div>

          {formData.affiliateType === 'query_param' && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Parâmetro
                </label>
                <input
                  type="text"
                  value={formData.affiliateParamName}
                  onChange={(e) => setFormData({ ...formData, affiliateParamName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                  placeholder="tag"
                />
              </div>
              <div className="bg-white p-3 rounded border text-sm">
                <span className="text-gray-500">Preview do link:</span>
                <code className="block mt-1 text-orange-600 break-all">
                  https://loja.com/produto?{formData.affiliateParamName || 'tag'}={formData.affiliateId || 'SEU_ID'}
                </code>
              </div>
            </div>
          )}

          {formData.affiliateType === 'custom' && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template do Link
                </label>
                <textarea
                  value={formData.customTemplate}
                  onChange={(e) => setFormData({ ...formData, customTemplate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                  rows={3}
                  placeholder="https://redir.lomadee.com/v2/deeplink?sourceId={affiliateId}&url={url}"
                />
              </div>
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Variáveis disponíveis:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code className="bg-gray-200 px-1 rounded">{'{url}'}</code> - URL original do produto (codificada)</li>
                  <li><code className="bg-gray-200 px-1 rounded">{'{affiliateId}'}</code> - Seu ID de afiliado</li>
                  <li><code className="bg-gray-200 px-1 rounded">{'{merchantId}'}</code> - ID do merchant (para Awin)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                <p className="font-medium text-blue-800 mb-1">📋 Templates comuns:</p>
                <ul className="space-y-1 text-blue-700">
                  <li><strong>Lomadee:</strong> https://redir.lomadee.com/v2/deeplink?sourceId={'{affiliateId}'}&url={'{url}'}</li>
                  <li><strong>Awin:</strong> https://www.awin1.com/cread.php?awinmid={'{merchantId}'}&awinaffid={'{affiliateId}'}&p={'{url}'}</li>
                </ul>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comissão (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.commission}
              onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="5.0"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Loja ativa
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
