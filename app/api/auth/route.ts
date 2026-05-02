import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const action = formData.get('action') as string | null

  // Handle logout
  if (action === 'logout') {
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('auth_token', '', {
      expires: new Date(0),
      path: '/',
    })
    return response
  }

  // Handle login
  const password = formData.get('password') as string | null
  const APP_PASSWORD = process.env.APP_PASSWORD

  if (!APP_PASSWORD) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  if (!password || password !== APP_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('auth_token', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}