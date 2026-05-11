import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { searchObjects } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth_token')?.value === 'authenticated'

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const query = searchParams.get('q') || ''

  if (!type || !['contacts', 'companies'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  try {
    const results = await searchObjects(type, query, 20)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching options:', error)
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 })
  }
}
