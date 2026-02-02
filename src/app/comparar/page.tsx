import { getBestPrices } from '@/lib/feed-importer'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const revalidate = 300 // Revalidar a cada 5 minutos

async function getCompareData() {
  try {
    const bestPrices = await getBestPrices(100)
    return bestPrices
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    return []
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

export default async function ComparePage() {
  const bestPrices = await getCompareData()

  // Calcular estatísticas
  const totalSavings = bestPrices.reduce((acc, p) => {
    const prices = p.prices.map(pr => pr.price)
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    return acc + (maxPrice - minPrice)
  }, 0)

  const uniqueStores = new Set(bestPrices.flatMap(p => p.prices.map(pr => pr.store)))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⚖️ Comparador de Preços
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compare o preço do mesmo produto em diferentes lojas e encontre a melhor oferta!
            Economize dinheiro escolhendo sempre o menor preço.
          </p>
        </div>

        {/* Estatísticas */}
        {bestPrices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-4xl font-bold text-orange-500">{bestPrices.length}</p>
              <p className="text-gray-600">Produtos Comparados</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-4xl font-bold text-green-500">
                {formatPrice(totalSavings)}
              </p>
              <p className="text-gray-600">Economia Total Possível</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-4xl font-bold text-blue-500">
                {uniqueStores.size}
              </p>
              <p className="text-gray-600">Lojas Monitoradas</p>
            </div>
          </div>
        )}

        {/* Lista de Produtos */}
        {bestPrices.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Nenhum produto para comparar ainda
            </h2>
            <p className="text-gray-600 mb-6">
              Estamos trabalhando para trazer as melhores ofertas para você!
            </p>
            <Link
              href="/promocoes"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Ver Promoções Disponíveis
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bestPrices.map((product, index) => {
              const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price)
              const lowestPrice = sortedPrices[0]?.price || 0
              const highestPrice = sortedPrices[sortedPrices.length - 1]?.price || 0
              const savings = highestPrice - lowestPrice

              return (
                <div key={product.ean || index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          {product.ean && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full">
                              EAN: {product.ean}
                            </span>
                          )}
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            {product.prices.length} {product.prices.length === 1 ? 'loja' : 'lojas'}
                          </span>
                        </div>
                      </div>

                      {/* Preços */}
                      <div className="text-center md:text-right">
                        <div className="flex items-center gap-4">
                          {savings > 0 && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                              <p className="text-sm">Você economiza</p>
                              <p className="font-bold">{formatPrice(savings)}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-500">Melhor preço</p>
                            <p className="text-3xl font-bold text-green-600">
                              {formatPrice(lowestPrice)}
                            </p>
                            {highestPrice > lowestPrice && (
                              <p className="text-sm text-gray-400 line-through">
                                até {formatPrice(highestPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ofertas */}
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedPrices.map((offer, offerIndex) => (
                        <div 
                          key={`${offer.store}-${offerIndex}`}
                          className={`bg-white rounded-lg p-4 border-2 ${
                            offerIndex === 0 ? 'border-green-500' : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800">{offer.store}</span>
                            {offerIndex === 0 && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                MELHOR
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className={`text-xl font-bold ${offerIndex === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {formatPrice(offer.price)}
                            </p>
                            {offer.url && (
                              <a
                                href={offer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                  offerIndex === 0 
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                              >
                                IR À LOJA
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
