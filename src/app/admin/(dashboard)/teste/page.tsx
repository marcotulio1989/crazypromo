'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, PlayCircle, RefreshCcw } from 'lucide-react'

interface StoreOption {
  id: string
  name: string
  affiliateConfig?: Record<string, string> | null
}

interface LomadeeEndpoint {
  id: string
  label: string
  path: string
  description: string
  defaultParams: Record<string, string>
}

const LOMADEE_ENDPOINTS: LomadeeEndpoint[] = [
  {
    id: 'brands',
    label: 'Lojas / Brands',
    path: '/affiliate/brands',
    description: 'Lista marcas/lojas da Lomadee.',
    defaultParams: { page: '1', limit: '10' }
  },
  {
    id: 'categories',
    label: 'Categorias',
    path: '/affiliate/categories',
    description: 'Lista categorias disponíveis.',
    defaultParams: { page: '1', limit: '10' }
  },
  {
    id: 'products',
    label: 'Produtos',
    path: '/affiliate/products',
    description: 'Lista produtos/ofertas com filtros.',
    defaultParams: { page: '1', limit: '10' }
  },
  {
    id: 'campaigns',
    label: 'Campanhas',
    path: '/affiliate/campaigns',
    description: 'Campanhas e cupons (quando disponíveis).',
    defaultParams: { page: '1', limit: '10' }
  }
]

export default function AdminTesteLomadee() {
  const [isAdminUser, setIsAdminUser] = useState(true)
  const [stores, setStores] = useState<StoreOption[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState('')
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.lomadee.com.br')
  const [apiKey, setApiKey] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [running, setRunning] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [params, setParams] = useState<Record<string, string>>(
    Object.fromEntries(
      LOMADEE_ENDPOINTS.map(endpoint => [
        endpoint.id,
        Object.entries(endpoint.defaultParams)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      ])
    )
  )

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch('/api/stores?onlyActive=false&includeSensitive=true')
        const data = await res.json()
        if (res.status === 401) {
          setIsAdminUser(false)
          return
        }
        setStores(Array.isArray(data) ? data : data.stores || [])
      } catch (error) {
        console.error('Erro ao carregar lojas:', error)
      }
    }

    fetchStores()
  }, [])

  const selectedStore = useMemo(
    () => stores.find(store => store.id === selectedStoreId),
    [stores, selectedStoreId]
  )

  useEffect(() => {
    if (!selectedStore?.affiliateConfig) return
    const config = selectedStore.affiliateConfig
    setApiBaseUrl(config.lomadeeBaseUrl || 'https://api.lomadee.com.br')
    setApiKey(config.lomadeeApiKey || '')
    setSourceId(config.lomadeeSourceId || '')
  }, [selectedStore])

  const updateParams = (id: string, value: string) => {
    setParams(prev => ({ ...prev, [id]: value }))
  }

  const runEndpoint = async (endpoint: LomadeeEndpoint) => {
    setRunning(endpoint.id)
    setErrors(prev => ({ ...prev, [endpoint.id]: '' }))

    try {
      if (!isAdminUser) {
        setErrors(prev => ({ ...prev, [endpoint.id]: 'Acesso restrito a administradores.' }))
        return
      }

      const res = await fetch('/api/lomadee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: apiBaseUrl,
          apiKey,
          sourceId,
          path: endpoint.path,
          query: params[endpoint.id]
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors(prev => ({ ...prev, [endpoint.id]: data?.error || 'Erro ao chamar API' }))
      }

      setResponses(prev => ({ ...prev, [endpoint.id]: data?.data ?? data }))
    } catch {
      setErrors(prev => ({ ...prev, [endpoint.id]: 'Falha de conexão com a API' }))
    } finally {
      setRunning(null)
    }
  }

  const runAll = async () => {
    for (const endpoint of LOMADEE_ENDPOINTS) {
      await runEndpoint(endpoint)
    }
  }

  const clearResponses = () => {
    setResponses({})
    setErrors({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teste Lomadee</h1>
          <p className="text-gray-600 mt-1">
            Configure sua chave e dispare as APIs individualmente para validar respostas.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearResponses}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <RefreshCcw className="w-4 h-4" />
            Limpar
          </button>
          <button
            onClick={runAll}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <PlayCircle className="w-4 h-4" />
            Testar Todas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuração Lomadee</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usar configuração da loja</label>
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Selecionar loja...</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
            <input
              type="url"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://api.lomadee.com.br"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key (x-api-key)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
              placeholder="Cole sua chave aqui"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source ID (opcional)</label>
            <input
              type="text"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
              placeholder="sourceId (se exigido)"
            />
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
            Configure a chave via Lojas &amp; Afiliados para reutilizar aqui rapidamente.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {LOMADEE_ENDPOINTS.map((endpoint) => (
          <div key={endpoint.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{endpoint.label}</h3>
                <p className="text-sm text-gray-500">{endpoint.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Endpoint: {endpoint.path}
                </p>
              </div>
              <button
                onClick={() => runEndpoint(endpoint)}
                disabled={running === endpoint.id}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {running === endpoint.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                Disparar API
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Parâmetros (query string)</label>
              <input
                type="text"
                value={params[endpoint.id] || ''}
                onChange={(e) => updateParams(endpoint.id, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                placeholder="page=1&limit=10"
              />
            </div>

            {errors[endpoint.id] && (
              <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {errors[endpoint.id]}
              </div>
            )}

            {responses[endpoint.id] && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                  {JSON.stringify(responses[endpoint.id], null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
