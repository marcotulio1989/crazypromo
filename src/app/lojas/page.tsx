import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getStores() {
  try {
    return await prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  } catch {
    return []
  }
}

export default async function LojasPage() {
  const stores = await getStores()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Lojas Parceiras</h1>
        <Link href="/promocoes" className="text-orange-600 hover:text-orange-700 font-medium">
          Ver promoções →
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
          Nenhuma loja cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                {store.logo && (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-10 h-10 object-contain rounded"
                  />
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{store.name}</h2>
                  <p className="text-sm text-gray-500">{store.website}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {store.description || 'Loja parceira no CrazyPromo.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
