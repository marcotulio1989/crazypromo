import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Cron job to update product prices
 * 
 * This endpoint should be called by Vercel Cron or an external scheduler
 * to periodically update product prices and recalculate deal scores.
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-prices",
 *     "schedule": "0 0 star/6 star star star"
 *   }]
 * }
 * (Replace star with asterisk in the schedule above)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron job (Vercel sets this header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production') {
      if (!cronSecret) {
        return NextResponse.json(
          { error: 'CRON_SECRET not configured' },
          { status: 500 }
        )
      }
      
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('Starting price update cron job...')

    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        currentPrice: true
      }
    })

    console.log(`Found ${products.length} active products to update`)

    // In a real implementation, you would:
    // 1. Scrape current prices from stores
    // 2. Create price history records
    // 3. Update product prices
    // 4. Recalculate deal scores for active promotions
    
    // For now, just log that the cron job ran successfully
    const timestamp = new Date().toISOString()
    
    return NextResponse.json({
      success: true,
      message: 'Price update cron job completed',
      timestamp,
      productsChecked: products.length
    })
  } catch (error) {
    console.error('Error in price update cron job:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
