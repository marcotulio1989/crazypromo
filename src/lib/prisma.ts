import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Validate DATABASE_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required in production')
}

// Use localhost only in development
const databaseUrl = process.env.DATABASE_URL || 
  (process.env.NODE_ENV !== 'production' 
    ? 'postgresql://postgres:postgres@localhost:5432/crazypromo'
    : undefined)

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Configure connection pool for serverless environments
const pool = new pg.Pool({ 
  connectionString: databaseUrl,
  max: 10, // Maximum pool size (Vercel serverless functions limit)
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Connection timeout
})

const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
