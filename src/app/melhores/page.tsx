import { prisma } from '@/lib/prisma'
import PromotionGrid from '@/components/PromotionGrid'
import Link from 'next/link'

export const revalidate = 300

async function getBestDeals(): Promise<Parameters<typeof PromotionGrid>[0]['promotions']> {
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
      take: 20
    }) as Parameters<typeof PromotionGrid>[0]['promotions']
  } catch {
    return []
  }
}

export default async function MelhoresPage() {
  const bestDeals = await getBestDeals()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🔥 Melhores Ofertas</h1>
        <Link href="/promocoes" className="text-orange-600 hover:text-orange-700 font-medium">
          Ver todas →
        </Link>
      </div>

      {bestDeals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
          Nenhuma oferta de destaque encontrada.
        </div>
      ) : (
        <PromotionGrid promotions={bestDeals} />
      )}
    </div>
  )
}
