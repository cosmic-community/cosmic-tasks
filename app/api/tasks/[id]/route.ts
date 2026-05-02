// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateTaskStatus } from '@/lib/cosmic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth_token')?.value === 'authenticated'

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json() as { task_status: string }
    const { task_status } = body

    if (!task_status) {
      return NextResponse.json({ error: 'task_status is required' }, { status: 400 })
    }

    await updateTaskStatus(id, task_status)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}