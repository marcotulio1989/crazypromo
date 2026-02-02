'use client'

import { ReactNode } from 'react'
import { OpenTabsProvider, useOpenTabs } from '@/contexts/OpenTabsContext'
import { SplitViewProvider } from '@/components/SplitViewContext'
import OpenTabsIndicator from '@/components/OpenTabsIndicator'
import SplitViewLayout from '@/components/SplitViewLayout'

function OpenTabsIndicatorGlobal() {
  const { openTabs, removeTab, clearAllTabs } = useOpenTabs()
  
  return (
    <OpenTabsIndicator
      tabs={openTabs}
      onRemoveTab={removeTab}
      onClearAll={clearAllTabs}
    />
  )
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <OpenTabsProvider>
      <SplitViewProvider>
        <SplitViewLayout>
          {children}
        </SplitViewLayout>
        <OpenTabsIndicatorGlobal />
      </SplitViewProvider>
    </OpenTabsProvider>
  )
}
