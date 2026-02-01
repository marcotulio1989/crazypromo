// @ts-nocheck
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crazypromo'
const pool = new pg.Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@crazypromo.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@crazypromo.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Usuário admin criado:', admin.email)

  // Criar categorias
  const categorias = [
    { name: 'Eletrônicos', slug: 'eletronicos', icon: '📱' },
    { name: 'Informática', slug: 'informatica', icon: '💻' },
    { name: 'Games', slug: 'games', icon: '🎮' },
    { name: 'Eletrodomésticos', slug: 'eletrodomesticos', icon: '🏠' },
    { name: 'Moda', slug: 'moda', icon: '👕' },
    { name: 'Beleza', slug: 'beleza', icon: '💄' },
    { name: 'Esportes', slug: 'esportes', icon: '⚽' },
    { name: 'Livros', slug: 'livros', icon: '📚' },
  ]

  for (const cat of categorias) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    })
  }
  console.log('✅ Categorias criadas')

  // Criar lojas de exemplo
  const lojas = [
    {
      name: 'Amazon',
      slug: 'amazon',
      website: 'https://www.amazon.com.br',
      affiliateConfig: { type: 'query_param', paramName: 'tag' },
      affiliateId: 'crazypromo-20', // Substitua pelo seu ID real
      commission: 4.0
    },
    {
      name: 'Magazine Luiza',
      slug: 'magazineluiza',
      website: 'https://www.magazineluiza.com.br',
      affiliateConfig: { type: 'query_param', paramName: 'partner_id' },
      affiliateId: '', // Configure seu ID
      commission: 5.0
    },
    {
      name: 'Americanas',
      slug: 'americanas',
      website: 'https://www.americanas.com.br',
      affiliateConfig: { type: 'query_param', paramName: 'chave' },
      affiliateId: '', // Configure seu ID
      commission: 4.5
    },
    {
      name: 'Casas Bahia',
      slug: 'casasbahia',
      website: 'https://www.casasbahia.com.br',
      affiliateConfig: { type: 'query_param', paramName: 'partner_id' },
      affiliateId: '', // Configure seu ID
      commission: 5.0
    },
    {
      name: 'Kabum',
      slug: 'kabum',
      website: 'https://www.kabum.com.br',
      affiliateConfig: { type: 'query_param', paramName: 'tag' },
      affiliateId: '', // Configure seu ID
      commission: 3.5
    },
    {
      name: 'AliExpress',
      slug: 'aliexpress',
      website: 'https://www.aliexpress.com',
      affiliateConfig: { 
        type: 'custom', 
        customTemplate: 'https://s.click.aliexpress.com/e/{affiliateId}?dp={url}' 
      },
      affiliateId: '', // Configure seu ID
      commission: 8.0
    },
  ]

  for (const loja of lojas) {
    await prisma.store.upsert({
      where: { slug: loja.slug },
      update: {},
      create: loja
    })
  }
  console.log('✅ Lojas criadas')

  // Criar alguns produtos de exemplo
  const amazonStore = await prisma.store.findUnique({ where: { slug: 'amazon' } })
  const eletronicosCategory = await prisma.category.findUnique({ where: { slug: 'eletronicos' } })

  if (amazonStore && eletronicosCategory) {
    // Produto de exemplo 1
    const produto1 = await prisma.product.upsert({
      where: { slug: 'smartphone-samsung-galaxy-s24' },
      update: {},
      create: {
        name: 'Smartphone Samsung Galaxy S24 256GB',
        slug: 'smartphone-samsung-galaxy-s24',
        description: 'Smartphone Samsung Galaxy S24 com 256GB de armazenamento, tela AMOLED 6.2", câmera tripla 50MP.',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
        originalUrl: 'https://www.amazon.com.br/dp/exemplo123',
        affiliateUrl: 'https://www.amazon.com.br/dp/exemplo123?tag=crazypromo-20',
        currentPrice: 3499.00,
        originalPrice: 4999.00,
        lowestPrice: 3299.00,
        highestPrice: 4999.00,
        averagePrice: 3899.00,
        storeId: amazonStore.id,
        categoryId: eletronicosCategory.id
      }
    })

    // Criar histórico de preços simulado
    const hoje = new Date()
    for (let i = 30; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      // Simular variação de preço
      const basePrice = 3899
      const variation = Math.sin(i / 5) * 300 + Math.random() * 200 - 100
      const price = Math.max(3299, Math.min(4999, basePrice + variation))

      await prisma.priceHistory.create({
        data: {
          productId: produto1.id,
          price: Math.round(price * 100) / 100,
          source: 'seed',
          createdAt: data
        }
      })
    }

    // Criar promoção
    await prisma.promotion.upsert({
      where: { id: 'promo-samsung-s24' },
      update: {},
      create: {
        id: 'promo-samsung-s24',
        title: '🔥 30% OFF - Samsung Galaxy S24 256GB',
        description: 'Aproveite esta oferta incrível! Menor preço dos últimos 30 dias.',
        productId: produto1.id,
        promotionPrice: 3499.00,
        originalPrice: 4999.00,
        discountPercent: 30,
        isRealDeal: true,
        dealScore: 85,
        isFeatured: true,
        isActive: true
      }
    })

    console.log('✅ Produtos e promoções de exemplo criados')
  }

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
