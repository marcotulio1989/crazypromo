import { prisma } from '@/lib/prisma'
import { 
  Tag, 
  Package, 
  Store, 
  MousePointer2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Eye
} from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const [
    totalPromotions,
    activePromotions,
    totalProducts,
    totalStores,
    totalClicks,
    recentClicks
  ] = await Promise.all([
    prisma.promotion.count(),
    prisma.promotion.count({ where: { isActive: true } }),
    prisma.product.count(),
    prisma.store.count({ where: { isActive: true } }),
    prisma.click.count(),
    prisma.click.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })
  ])

  return {
    totalPromotions,
    activePromotions,
    totalProducts,
    totalStores,
    totalClicks,
    recentClicks
  }
}

interface RecentPromotion {
  id: string
  title: string
  promotionPrice: number
  discountPercent: number
  product: {
    store: {
      name: string
    }
  }
}

interface TopProduct {
  id: string
  name: string
  store: {
    name: string
  }
  _count: {
    clicks: number
  }
}

async function getRecentPromotions(): Promise<RecentPromotion[]> {
  return prisma.promotion.findMany({
    include: {
      product: {
        include: { store: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  }) as unknown as RecentPromotion[]
}

async function getTopProducts(): Promise<TopProduct[]> {
  return prisma.product.findMany({
    include: {
      store: true,
      _count: { select: { clicks: true } }
    },
    orderBy: {
      clicks: { _count: 'desc' }
    },
    take: 5
  }) as unknown as TopProduct[]
}

export default async function AdminDashboard() {
  const [stats, recentPromotions, topProducts] = await Promise.all([
    getStats(),
    getRecentPromotions(),
    getTopProducts()
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <Link
          href="/admin/promocoes/nova"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Nova Promoção
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Promoções Ativas"
          value={stats.activePromotions}
          total={stats.totalPromotions}
          icon={Tag}
          color="orange"
        />
        <StatCard
          title="Produtos"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Lojas"
          value={stats.totalStores}
          icon={Store}
          color="green"
        />
        <StatCard
          title="Cliques (24h)"
          value={stats.recentClicks}
          total={stats.totalClicks}
          icon={MousePointer2}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Promotions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Promoções Recentes</h2>
            <Link href="/admin/promocoes" className="text-orange-500 hover:text-orange-600 text-sm">
              Ver todas →
            </Link>
          </div>
          
          {recentPromotions.length > 0 ? (
            <div className="space-y-4">
              {recentPromotions.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{promo.title}</p>
                    <p className="text-sm text-gray-500">{promo.product.store.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      R$ {promo.promotionPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-red-500">-{Math.round(promo.discountPercent)}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma promoção cadastrada</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Produtos Mais Clicados</h2>
            <Link href="/admin/produtos" className="text-orange-500 hover:text-orange-600 text-sm">
              Ver todos →
            </Link>
          </div>
          
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.store.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{product._count.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  total, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: number
  total?: number
  icon: React.ElementType
  color: 'orange' | 'blue' | 'green' | 'purple'
}) {
  const colors = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {total !== undefined && (
            <p className="text-sm text-gray-400 mt-1">de {total} total</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
