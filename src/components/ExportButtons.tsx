'use client'

import { Download } from 'lucide-react'

interface ExportButtonsProps {
  resource: 'products' | 'promotions' | 'stores' | 'categories'
}

export default function ExportButtons({ resource }: ExportButtonsProps) {
  const handleExport = (format: 'json' | 'csv') => {
    const url = `/api/export?resource=${resource}&format=${format}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleExport('json')}
        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        title="Baixar JSON"
      >
        <Download className="w-4 h-4" />
        JSON
      </button>
      <button
        onClick={() => handleExport('csv')}
        className="flex items-center gap-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        title="Baixar CSV"
      >
        <Download className="w-4 h-4" />
        CSV
      </button>
    </div>
  )
}
