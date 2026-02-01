import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateStoreAffiliateLinks } from '@/lib/affiliate-link-generator'

// GET - Obter loja específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      },
      products: {
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          promotions: {
            where: { isActive: true },
            orderBy: { dealScore: 'desc' },
            take: 1
          }
        }
      }
    }
  })

  if (!store) {
    return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
  }

  return NextResponse.json(store)
}

// PATCH - Atualizar loja
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const store = await prisma.store.update({
      where: { id },
      data: body
    })

    // Se mudou configuração de afiliados, atualizar links dos produtos
    if (body.affiliateId || body.affiliateConfig) {
      await updateStoreAffiliateLinks(id)
    }

    return NextResponse.json(store)

  } catch (error) {
    console.error('Erro ao atualizar loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Remover loja
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar se há produtos associados
    const productCount = await prisma.product.count({
      where: { storeId: id }
    })

    if (productCount > 0) {
      return NextResponse.json({ 
        error: 'Não é possível excluir loja com produtos associados' 
      }, { status: 400 })
    }

    await prisma.store.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar loja:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
