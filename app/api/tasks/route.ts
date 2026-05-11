import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getTasks, createTask } from '@/lib/cosmic'

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

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth_token')?.value === 'authenticated'

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      title: string
      priority?: string
      due_date?: string
      notes?: string
      assigned_to?: string
      contact?: string
      company?: string
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const metadata: Record<string, unknown> = {
      title: body.title.trim(),
      task_status: 'To Do',
    }

    if (body.priority) metadata.priority = body.priority
    if (body.due_date) metadata.due_date = body.due_date
    if (body.notes) metadata.notes = body.notes
    if (body.assigned_to) metadata.assigned_to = body.assigned_to
    if (body.contact) metadata.contact = body.contact
    if (body.company) metadata.company = body.company

    const task = await createTask({
      title: body.title.trim(),
      metadata: metadata as CreateTaskPayload['metadata'],
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// Re-export the type for the POST handler
import type { CreateTaskPayload } from '@/lib/cosmic'
