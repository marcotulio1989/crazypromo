'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface OpenTab {
  id: string
  url: string
  storeName: string
  openedAt: Date
}

interface OpenTabsContextType {
  openTabs: OpenTab[]
  addTab: (url: string, storeName: string) => void
  removeTab: (id: string) => void
  clearAllTabs: () => void
}

const OpenTabsContext = createContext<OpenTabsContextType | null>(null)

export function OpenTabsProvider({ children }: { children: ReactNode }) {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])

  const addTab = useCallback((url: string, storeName: string) => {
    const newTab: OpenTab = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      storeName,
      openedAt: new Date()
    }
    setOpenTabs(prev => [...prev, newTab])
  }, [])

  const removeTab = useCallback((id: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== id))
  }, [])

  const clearAllTabs = useCallback(() => {
    setOpenTabs([])
  }, [])

  return (
    <OpenTabsContext.Provider value={{ openTabs, addTab, removeTab, clearAllTabs }}>
      {children}
    </OpenTabsContext.Provider>
  )
}

export function useOpenTabs() {
  const context = useContext(OpenTabsContext)
  if (!context) {
    throw new Error('useOpenTabs must be used within an OpenTabsProvider')
  }
  return context
}
