import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar categorias
export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true }
      },
      children: {
        where: { isActive: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(categories)
}

// POST - Criar categoria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, image, parentId } = body

    // Gerar slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        image,
        parentId
      }
    })

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
