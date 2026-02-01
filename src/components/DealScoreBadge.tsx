import { Shield, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface DealScoreBadgeProps {
  score: number | null
  isRealDeal: boolean
  priceManipulationDetected?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function DealScoreBadge({ 
  score, 
  isRealDeal,
  priceManipulationDetected = false,
  size = 'md',
  showLabel = true
}: DealScoreBadgeProps) {
  const getScoreConfig = () => {
    if (priceManipulationDetected) {
      return {
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: AlertTriangle,
        label: 'Preço manipulado',
        description: 'Detectamos manipulação de preço recente'
      }
    }

    if (!score) {
      return {
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        icon: Shield,
        label: 'Sem dados',
        description: 'Histórico insuficiente para análise'
      }
    }

    if (score >= 80) {
      return {
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: CheckCircle,
        label: 'Excelente!',
        description: 'Promoção real com ótimo desconto'
      }
    }

    if (score >= 60) {
      return {
        color: 'bg-lime-100 text-lime-700 border-lime-300',
        icon: TrendingDown,
        label: 'Bom negócio',
        description: 'Desconto real verificado'
      }
    }

    if (score >= 40) {
      return {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: Shield,
        label: 'Razoável',
        description: 'Desconto modesto'
      }
    }

    if (score >= 20) {
      return {
        color: 'bg-orange-100 text-orange-700 border-orange-300',
        icon: AlertTriangle,
        label: 'Duvidoso',
        description: 'Verifique o histórico de preços'
      }
    }

    return {
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: XCircle,
      label: 'Evite!',
      description: 'Preço acima da média histórica'
    }
  }

  const config = getScoreConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1.5 rounded-full border ${config.color} ${sizeClasses[size]}`}>
        <Icon className={iconSizes[size]} />
        {showLabel && (
          <>
            <span className="font-medium">{config.label}</span>
            {score !== null && (
              <span className="font-bold ml-1">{score}/100</span>
            )}
          </>
        )}
      </div>
      {showLabel && size !== 'sm' && (
        <span className="text-xs text-gray-500 ml-1">{config.description}</span>
      )}
    </div>
  )
}
