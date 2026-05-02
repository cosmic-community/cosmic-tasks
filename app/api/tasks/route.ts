import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTasks } from '@/lib/cosmic'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth_token')?.value === 'authenticated'

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tasks = await getTasks()
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}