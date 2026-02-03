import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const revalidate = 300

async function getCategory(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } }
      }
    })
  } catch {
    return null
  }
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug)

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
          Categoria não encontrada.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 mt-2">{category.description}</p>
          )}
        </div>
        <Link href="/promocoes" className="text-orange-600 hover:text-orange-700 font-medium">
          Ver promoções →
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 text-gray-600">
        {category._count.products} produtos associados. Em breve vamos listar as promoções aqui.
      </div>
    </div>
  )
}
