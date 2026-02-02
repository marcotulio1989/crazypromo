'use client'

import { ReactNode } from 'react'
import { useSplitView } from './SplitViewContext'
import SplitViewPanel from './SplitViewPanel'

interface SplitViewLayoutProps {
  children: ReactNode
}

export default function SplitViewLayout({ children }: SplitViewLayoutProps) {
  const { selectedPromotion, isPanelOpen, closePanel, popupWindow, popupBlocked, retryPopup } = useSplitView()

  return (
    <div className="flex min-h-screen">
      {/* Área principal do conteúdo - 70% quando painel aberto */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out overflow-auto ${
          isPanelOpen ? 'lg:mr-[30%]' : ''
        }`}
        style={{ 
          marginRight: isPanelOpen ? 'max(30%, 380px)' : '0',
        }}
      >
        {children}
      </div>

      {/* Painel lateral (30%) - A POPUP VEM EXATAMENTE AQUI */}
      <div 
        className={`fixed right-0 top-0 h-screen transition-all duration-300 ease-in-out z-50 ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          width: isPanelOpen ? 'max(30%, 380px)' : '380px',
        }}
      >
        <SplitViewPanel 
          promotion={selectedPromotion} 
          onClose={closePanel}
          popupWindow={popupWindow}
          popupBlocked={popupBlocked}
          onRetryPopup={retryPopup}
        />
      </div>

      {/* Overlay para fechar em telas menores */}
      {isPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={closePanel}
        />
      )}
    </div>
  )
}
