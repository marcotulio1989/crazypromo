'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, X, Store, ChevronUp, ChevronDown } from 'lucide-react'

export interface OpenTab {
  id: string
  url: string
  storeName: string
  openedAt: Date
}

interface OpenTabsIndicatorProps {
  tabs: OpenTab[]
  onRemoveTab: (id: string) => void
  onClearAll: () => void
}

export default function OpenTabsIndicator({ tabs, onRemoveTab, onClearAll }: OpenTabsIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (tabs.length > 0) {
      setIsVisible(true)
    } else {
      // Delay hiding to allow animation
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [tabs.length])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
        tabs.length === 0 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-sm">
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            <span className="font-semibold">
              {tabs.length} {tabs.length === 1 ? 'loja aberta' : 'lojas abertas'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {tabs.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClearAll()
                }}
                className="text-white/70 hover:text-white text-xs underline"
              >
                Limpar
              </button>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Lista de tabs */}
        {isExpanded && tabs.length > 0 && (
          <div className="max-h-48 overflow-y-auto">
            {tabs.map((tab) => (
              <div 
                key={tab.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {tab.storeName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Aberta em nova aba
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={tab.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Abrir novamente"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onRemoveTab(tab.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dica */}
        {isExpanded && tabs.length > 0 && (
          <div className="px-4 py-2 bg-blue-50 text-xs text-blue-700">
            💡 As lojas foram abertas em novas abas. Continue navegando aqui!
          </div>
        )}
      </div>
    </div>
  )
}
