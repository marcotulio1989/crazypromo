'use client'

import { useState, useEffect } from 'react'

interface Store {
  id: string
  name: string
  logo: string | null
  feedUrl: string | null
  feedType: string | null
  lastFeedSync: string | null
  _count?: {
    products: number
  }
}

interface ImportResult {
  success: boolean
  imported: number
  errors: number
  message: string
}

export default function FeedsPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, ImportResult>>({})
  
  // Modal de configuração
  const [showConfig, setShowConfig] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [feedUrl, setFeedUrl] = useState('')
  const [feedType, setFeedType] = useState('lomadee')
  const [sourceId, setSourceId] = useState('')

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores')
      const data = await res.json()
      setStores(data.stores || [])
    } catch (error) {
      console.error('Erro ao carregar lojas:', error)
    } finally {
      setLoading(false)
    }
  }

  const openConfig = (store: Store) => {
    setSelectedStore(store)
    setFeedUrl(store.feedUrl || '')
    setFeedType(store.feedType || 'lomadee')
    setShowConfig(true)
  }

  const saveConfig = async () => {
    if (!selectedStore) return

    try {
      const res = await fetch(`/api/stores/${selectedStore.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedUrl,
          feedType
        })
      })

      if (res.ok) {
        await fetchStores()
        setShowConfig(false)
        alert('Configuração salva!')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configuração')
    }
  }

  const importFeed = async (store: Store) => {
    if (!store.feedUrl) {
      alert('Configure a URL do feed primeiro!')
      return
    }

    setImporting(store.id)
    setResults(prev => ({ ...prev, [store.id]: { success: false, imported: 0, errors: 0, message: 'Importando...' } }))

    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          feedUrl: store.feedUrl,
          feedType: store.feedType,
          sourceId
        })
      })

      const data = await res.json()
      setResults(prev => ({ ...prev, [store.id]: data }))
      await fetchStores()
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [store.id]: { success: false, imported: 0, errors: 0, message: 'Erro na importação' } 
      }))
    } finally {
      setImporting(null)
    }
  }

  const importAllFeeds = async () => {
    const storesWithFeed = stores.filter(s => s.feedUrl)
    for (const store of storesWithFeed) {
      await importFeed(store)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📥 Importação de Feeds</h1>
          <p className="text-gray-600">Importe produtos automaticamente de redes de afiliados</p>
        </div>
        <button
          onClick={importAllFeeds}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          🔄 Sincronizar Todos
        </button>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">📖 Como configurar feeds:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Lomadee:</strong> Use a URL da API de ofertas (ex: https://api.lomadee.com/v3/...)</li>
          <li>• <strong>Awin:</strong> Use a URL do feed XML de produtos do publisher</li>
          <li>• <strong>CSV:</strong> URL de arquivo CSV com mapeamento de campos</li>
          <li>• Produtos com mesmo EAN serão agrupados automaticamente para comparação</li>
        </ul>
      </div>

      {/* Tabela de Lojas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feed URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produtos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Sync
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stores.map((store) => (
              <tr key={store.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {store.logo && (
                      <img src={store.logo} alt={store.name} className="h-8 w-8 rounded-full mr-3" />
                    )}
                    <span className="font-medium text-gray-900">{store.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500 truncate max-w-xs block">
                    {store.feedUrl || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {store.feedType ? (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      store.feedType === 'lomadee' ? 'bg-green-100 text-green-800' :
                      store.feedType === 'awin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {store.feedType.toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {store._count?.products || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {store.lastFeedSync 
                    ? new Date(store.lastFeedSync).toLocaleString('pt-BR')
                    : '—'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => openConfig(store)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ⚙️ Configurar
                  </button>
                  <button
                    onClick={() => importFeed(store)}
                    disabled={importing === store.id || !store.feedUrl}
                    className={`${
                      store.feedUrl 
                        ? 'text-green-600 hover:text-green-800' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {importing === store.id ? '⏳ Importando...' : '📥 Importar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resultados da importação */}
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Resultados da Importação</h3>
          <div className="space-y-2">
            {Object.entries(results).map(([storeId, result]) => {
              const store = stores.find(s => s.id === storeId)
              return (
                <div 
                  key={storeId}
                  className={`p-3 rounded-lg ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <span className="font-medium">{store?.name}:</span>{' '}
                  <span>{result.message}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de Configuração */}
      {showConfig && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              Configurar Feed: {selectedStore.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Feed
                </label>
                <select
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="lomadee">Lomadee (JSON)</option>
                  <option value="awin">Awin (XML)</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Feed
                </label>
                <input
                  type="url"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  placeholder="https://api.lomadee.com/v3/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {feedType === 'lomadee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source ID (Lomadee)
                  </label>
                  <input
                    type="text"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    placeholder="ID da fonte no Lomadee"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <strong>💡 Dicas:</strong>
                <ul className="mt-1 text-yellow-800">
                  <li>• Lomadee: API de ofertas retorna JSON com produtos</li>
                  <li>• Awin: Gere o feed XML no painel do publisher</li>
                  <li>• Certifique-se que o feed inclui EAN/código de barras</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={saveConfig}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
