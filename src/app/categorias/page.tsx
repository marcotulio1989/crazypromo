import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  } catch {
    return []
  }
}

export default async function CategoriasPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Categorias</h1>
        <Link href="/promocoes" className="text-orange-600 hover:text-orange-700 font-medium">
          Ver promoções →
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
          Nenhuma categoria cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{category.icon || '📦'}</div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{category.name}</h2>
                  {category.description && (
                    <p className="text-sm text-gray-500">{category.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
