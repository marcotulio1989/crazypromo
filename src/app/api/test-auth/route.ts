import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@crazypromo.com' }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found', dbConnected: true })
    }

    // Testar senha
    const isValid = await bcrypt.compare('admin123', user.password || '')

    return NextResponse.json({
      dbConnected: true,
      userFound: true,
      email: user.email,
      role: user.role,
      passwordValid: isValid,
      passwordHash: user.password?.substring(0, 10) + '...'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'DB Error', 
      message: String(error),
      dbUrl: process.env.DATABASE_URL?.substring(0, 30) + '...'
    }, { status: 500 })
  }
}
