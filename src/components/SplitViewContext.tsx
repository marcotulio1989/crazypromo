'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

interface Promotion {
  id: string
  title: string
  promotionPrice: number
  originalPrice: number
  discountPercent: number
  isRealDeal: boolean
  dealScore: number | null
  createdAt: string
  product: {
    id: string
    name: string
    image: string | null
    slug: string
    affiliateUrl: string | null
    originalUrl: string
    lowestPrice: number | null
    averagePrice: number | null
    store: {
      name: string
      logo: string | null
    }
    category: {
      name: string
    } | null
  }
}

interface SplitViewContextType {
  selectedPromotion: Promotion | null
  isPanelOpen: boolean
  popupWindow: Window | null
  popupBlocked: boolean
  openPanelOnly: (promotion: Promotion) => void
  openPanelWithPopup: (promotion: Promotion) => void
  closePanel: () => void
  retryPopup: () => void
}

const SplitViewContext = createContext<SplitViewContextType | undefined>(undefined)

export function useSplitView() {
  const context = useContext(SplitViewContext)
  if (!context) {
    throw new Error('useSplitView must be used within a SplitViewProvider')
  }
  return context
}

interface SplitViewProviderProps {
  children: ReactNode
}

export function SplitViewProvider({ children }: SplitViewProviderProps) {
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [popupWindow, setPopupWindow] = useState<Window | null>(null)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  // Monitora quando a popup é fechada (apenas atualiza estado, NÃO fecha o painel)
  useEffect(() => {
    if (!popupWindow) return

    const checkPopupClosed = setInterval(() => {
      if (popupWindow.closed) {
        setPopupWindow(null)
      }
    }, 500)

    return () => clearInterval(checkPopupClosed)
  }, [popupWindow])

  // Calcula posição e abre popup posicionada no espaço de 30%
  const openPopupAtPosition = useCallback((url: string) => {
    const screenWidth = window.screen.availWidth
    const screenHeight = window.screen.availHeight
    
    // 30% da tela para a popup (lado direito)
    const popupWidth = Math.floor(screenWidth * 0.30)
    const popupHeight = screenHeight
    
    // Posição X = 70% da tela
    const popupX = Math.floor(screenWidth * 0.70)
    const popupY = 0

    const popup = window.open(
      url,
      'storePopup',
      `width=${popupWidth},height=${popupHeight},left=${popupX},top=${popupY},resizable=yes,scrollbars=yes,status=yes,menubar=no,toolbar=no,location=yes`
    )

    if (popup) {
      setPopupWindow(popup)
      setPopupBlocked(false)
      popup.focus()
    } else {
      setPopupBlocked(true)
    }
  }, [])

  // Abre apenas o painel com detalhes (sem popup)
  const openPanelOnly = useCallback(async (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setIsPanelOpen(true)
    
    // Apenas pré-carrega a URL para uso posterior
    try {
      const response = await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: promotion.product.id,
          promotionId: promotion.id 
        })
      })
      
      const data = await response.json()
      const url = data.redirectUrl || promotion.product.affiliateUrl || promotion.product.originalUrl
      setRedirectUrl(url)
    } catch {
      const url = promotion.product.affiliateUrl || promotion.product.originalUrl
      setRedirectUrl(url)
    }
  }, [])

  // Abre o painel E a popup da loja
  const openPanelWithPopup = useCallback(async (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setIsPanelOpen(true)
    setPopupBlocked(false)

    try {
      const response = await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: promotion.product.id,
          promotionId: promotion.id 
        })
      })
      
      const data = await response.json()
      const url = data.redirectUrl || promotion.product.affiliateUrl || promotion.product.originalUrl
      setRedirectUrl(url)
      
      setTimeout(() => {
        openPopupAtPosition(url)
      }, 300)
    } catch {
      const url = promotion.product.affiliateUrl || promotion.product.originalUrl
      setRedirectUrl(url)
      setTimeout(() => {
        openPopupAtPosition(url)
      }, 300)
    }
  }, [openPopupAtPosition])

  const closePanel = useCallback(() => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close()
    }
    
    setIsPanelOpen(false)
    setPopupWindow(null)
    setPopupBlocked(false)
    
    setTimeout(() => {
      setSelectedPromotion(null)
      setRedirectUrl(null)
    }, 300)
  }, [popupWindow])

  const retryPopup = useCallback(() => {
    if (redirectUrl) {
      openPopupAtPosition(redirectUrl)
    }
  }, [redirectUrl, openPopupAtPosition])

  return (
    <SplitViewContext.Provider 
      value={{ 
        selectedPromotion, 
        isPanelOpen, 
        popupWindow,
        popupBlocked,
        openPanelOnly,
        openPanelWithPopup, 
        closePanel,
        retryPopup
      }}
    >
      {children}
    </SplitViewContext.Provider>
  )
}
