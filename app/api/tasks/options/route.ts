import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTeamMembers, getContacts, getCompanies } from '@/lib/cosmic'

export async function GET() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth_token')?.value === 'authenticated'

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [teamMembers, contacts, companies] = await Promise.all([
      getTeamMembers(),
      getContacts(),
      getCompanies(),
    ])

    return NextResponse.json({ teamMembers, contacts, companies })
  } catch (error) {
    console.error('Error fetching options:', error)
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 })
  }
}
