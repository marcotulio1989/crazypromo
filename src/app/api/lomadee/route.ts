import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { baseUrl, apiKey, sourceId, path, query } = body

    if (!baseUrl || !path || !apiKey) {
      return NextResponse.json({ error: 'Base URL, path e API key são obrigatórios.' }, { status: 400 })
    }

    const normalizedBase = String(baseUrl).replace(/\/$/, '')
    const normalizedPath = String(path).startsWith('/') ? path : `/${path}`
    const queryString = query ? `?${String(query).replace(/^\?/, '')}` : ''
    const url = `${normalizedBase}${normalizedPath}${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        ...(sourceId ? { 'x-source-id': sourceId, sourceId } : {})
      }
    })

    const text = await response.text()
    const contentType = response.headers.get('content-type') || ''
    let data: unknown = text
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Erro ao consultar API Lomadee.',
          status: response.status,
          data
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      data
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erro ao consultar API Lomadee.',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
