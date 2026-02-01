import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PromotionCard from '@/components/PromotionCard'
import { Flame, TrendingUp, Shield, Zap } from 'lucide-react'

async function getFeaturedPromotions() {
  try {
    return await prisma.promotion.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      include: {
        product: {
          include: {
            store: true,
            category: true
          }
        }
      },
      orderBy: { dealScore: 'desc' },
      take: 4
    })
  } catch {
    return []
  }
}

async function getLatestPromotions() {
  try {
    return await prisma.promotion.findMany({
      where: {
        isActive: true
      },
      include: {
        product: {
          include: {
            store: true,
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    })
  } catch {
    return []
  }
}

async function getBestDeals() {
  try {
    return await prisma.promotion.findMany({
      where: {
        isActive: true,
        isRealDeal: true,
        dealScore: { gte: 70 }
      },
      include: {
        product: {
          include: {
            store: true,
            category: true
          }
        }
      },
      orderBy: { dealScore: 'desc' },
      take: 4
    })
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        _count: { select: { products: true } }
      },
      take: 8
    })
  } catch {
    return []
  }
}

export default async function Home() {
  const [featured, latest, bestDeals, categories] = await Promise.all([
    getFeaturedPromotions(),
    getLatestPromotions(),
    getBestDeals(),
    getCategories()
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🔥 Promoções de <span className="text-yellow-300">Verdade!</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Nosso sistema inteligente analisa o histórico de preços para garantir 
              que você está fazendo um <strong>bom negócio de verdade</strong>.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-sm">Histórico de Preços</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-300" />
                <p className="text-sm">Promoções Verificadas</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Zap className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                <p className="text-sm">Alertas em Tempo Real</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Flame className="w-8 h-8 mx-auto mb-2 text-orange-300" />
                <p className="text-sm">Deal Score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques */}
      {featured.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                ⭐ Destaques
              </h2>
              <Link href="/melhores" className="text-orange-600 hover:text-orange-700 font-medium">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((promo) => (
                <PromotionCard key={promo.id} promotion={promo as unknown as Parameters<typeof PromotionCard>[0]['promotion']} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Melhores Ofertas (Deal Score Alto) */}
      {bestDeals.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                🏆 Melhores Ofertas Verificadas
              </h2>
              <Link href="/melhores" className="text-orange-600 hover:text-orange-700 font-medium">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestDeals.map((promo) => (
                <PromotionCard key={promo.id} promotion={promo as unknown as Parameters<typeof PromotionCard>[0]['promotion']} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promoções Recentes */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🆕 Promoções Recentes
            </h2>
            <Link href="/promocoes" className="text-orange-600 hover:text-orange-700 font-medium">
              Ver todas →
            </Link>
          </div>
          
          {latest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latest.map((promo) => (
                <PromotionCard key={promo.id} promotion={promo as unknown as Parameters<typeof PromotionCard>[0]['promotion']} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Flame className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhuma promoção disponível
              </h3>
              <p className="text-gray-500">
                As promoções aparecerão aqui assim que forem cadastradas.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categorias */}
      {categories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">📂 Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-center"
                >
                  <span className="text-3xl mb-2 block">{category.icon || '📦'}</span>
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category._count.products} produtos</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como funciona o CrazyPromo?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitoramos Preços</h3>
              <p className="text-gray-400">
                Nosso sistema coleta e armazena o histórico de preços dos produtos 
                de diversas lojas parceiras.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Analisamos Promoções</h3>
              <p className="text-gray-400">
                Comparamos o preço atual com a média histórica para identificar 
                promoções reais e detectar manipulações.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Você Economiza</h3>
              <p className="text-gray-400">
                Mostramos apenas as melhores ofertas verificadas com nosso 
                Deal Score, garantindo que você faça um bom negócio.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
