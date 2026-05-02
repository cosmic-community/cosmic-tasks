import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTeamMembers } from '@/lib/cosmic'

export async function GET() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth_token')?.value === 'authenticated'

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const members = await getTeamMembers()
    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}
