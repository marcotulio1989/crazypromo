'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PriceHistoryChartProps {
  data: Array<{
    id: string
    price: number
    createdAt: string
  }>
  currentPrice: number
  averagePrice?: number | null
  lowestPrice?: number | null
}

export default function PriceHistoryChart({ 
  data, 
  currentPrice, 
  averagePrice, 
  lowestPrice 
}: PriceHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
        Histórico de preços insuficiente para exibir gráfico
      </div>
    )
  }

  const chartData = data
    .map(item => ({
      date: format(new Date(item.createdAt), 'dd/MM', { locale: ptBR }),
      fullDate: format(new Date(item.createdAt), "dd 'de' MMM", { locale: ptBR }),
      price: item.price
    }))
    .reverse()

  const minPrice = Math.min(...data.map(d => d.price)) * 0.95
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.05

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-lg font-bold text-green-600">
            R$ {payload[0].value.toFixed(2).replace('.', ',')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h3 className="font-semibold text-gray-800 mb-4">📊 Histórico de Preços</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(value) => `R$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Linha do preço médio */}
            {averagePrice && (
              <ReferenceLine 
                y={averagePrice} 
                stroke="#f59e0b" 
                strokeDasharray="5 5"
                label={{ value: 'Média', position: 'right', fill: '#f59e0b', fontSize: 10 }}
              />
            )}
            
            {/* Linha do menor preço */}
            {lowestPrice && (
              <ReferenceLine 
                y={lowestPrice} 
                stroke="#10b981" 
                strokeDasharray="5 5"
                label={{ value: 'Menor', position: 'right', fill: '#10b981', fontSize: 10 }}
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500"></div>
          <span className="text-gray-600">Preço</span>
        </div>
        {averagePrice && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-500 border-dashed"></div>
            <span className="text-gray-600">Média: R$ {averagePrice.toFixed(2).replace('.', ',')}</span>
          </div>
        )}
        {lowestPrice && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500 border-dashed"></div>
            <span className="text-gray-600">Menor: R$ {lowestPrice.toFixed(2).replace('.', ',')}</span>
          </div>
        )}
      </div>

      {/* Preço atual */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Preço atual:</span>
          <span className="text-xl font-bold text-green-600">
            R$ {currentPrice.toFixed(2).replace('.', ',')}
          </span>
        </div>
        {averagePrice && (
          <div className="text-sm text-gray-500 mt-1">
            {currentPrice < averagePrice ? (
              <span className="text-green-600">
                ✓ {((averagePrice - currentPrice) / averagePrice * 100).toFixed(1)}% abaixo da média
              </span>
            ) : (
              <span className="text-red-500">
                ⚠ {((currentPrice - averagePrice) / averagePrice * 100).toFixed(1)}% acima da média
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
