// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateTask } from '@/lib/cosmic'

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
    const body = await request.json() as {
      task_status?: string
      notes?: string
      priority?: string
      due_date?: string | null
      title?: string
    }

    // Build the update payload
    const metadata: Record<string, unknown> = {}
    let topLevelTitle: string | undefined

    if (body.task_status !== undefined) metadata.task_status = body.task_status
    if (body.notes !== undefined) metadata.notes = body.notes
    if (body.priority !== undefined) metadata.priority = body.priority
    if (body.due_date !== undefined) metadata.due_date = body.due_date
    if (body.title !== undefined) {
      metadata.title = body.title
      topLevelTitle = body.title
    }

    if (Object.keys(metadata).length === 0 && !topLevelTitle) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updates: { title?: string; metadata?: Record<string, unknown> } = {}
    if (Object.keys(metadata).length > 0) updates.metadata = metadata
    if (topLevelTitle) updates.title = topLevelTitle

    await updateTask(id, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
