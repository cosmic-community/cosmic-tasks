import { createBucketClient } from '@cosmicjs/sdk'
import type { Task, TeamMember } from '@/types'

export type { TeamMember }

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

/**
 * Safely extract a value from a select-dropdown metafield.
 * Legacy select-dropdown fields return {key, value} objects.
 * This helper normalises them to a plain string.
 */
export function getMetafieldValue(field: unknown): string {
  if (field === null || field === undefined) return ''
  if (typeof field === 'string') return field
  if (typeof field === 'number' || typeof field === 'boolean') return String(field)
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return String((field as { value: unknown }).value)
  }
  if (typeof field === 'object' && field !== null && 'key' in field) {
    return String((field as { key: unknown }).key)
  }
  return ''
}

function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}

export async function getTasks(): Promise<Task[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'tasks' })
      .props(['id', 'slug', 'title', 'metadata', 'created_at', 'modified_at'])
      .depth(1)
    return response.objects as Task[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) return []
    throw error
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'team-members' })
      .props(['id', 'slug', 'title'])
      .depth(0)
    return (response.objects as Array<{ id: string; slug: string; title: string }>).map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      // Fallback to full title if split returns undefined (noUncheckedIndexedAccess)
      firstName: m.title.trim().split(' ')[0] ?? m.title.trim(),
    }))
  } catch (error) {
    if (hasStatus(error) && error.status === 404) return []
    throw error
  }
}

export interface SelectOption {
  id: string
  slug: string
  title: string
}

export async function getContacts(): Promise<SelectOption[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'contacts' })
      .props(['id', 'slug', 'title'])
      .depth(0)
      .sort('-created_at')
      .limit(100)
    return response.objects as SelectOption[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) return []
    throw error
  }
}

export async function getCompanies(): Promise<SelectOption[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'companies' })
      .props(['id', 'slug', 'title'])
      .depth(0)
      .sort('-created_at')
      .limit(100)
    return response.objects as SelectOption[]
  } catch (error) {
    if (hasStatus(error) && error.status === 404) return []
    throw error
  }
}

export async function updateTaskStatus(taskId: string, newStatus: string): Promise<void> {
  await cosmic.objects.updateOne(taskId, {
    metadata: { task_status: newStatus },
  })
}

export interface TaskUpdatePayload {
  title?: string
  metadata?: {
    task_status?: string
    notes?: string
    priority?: string
    due_date?: string | null
    title?: string
  }
}

export async function updateTask(taskId: string, updates: TaskUpdatePayload): Promise<void> {
  await cosmic.objects.updateOne(taskId, updates)
}

export interface CreateTaskPayload {
  title: string
  metadata: {
    title: string
    task_status: string
    priority?: string
    due_date?: string
    notes?: string
    assigned_to?: string
    contact?: string
    company?: string
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await cosmic.objects.insertOne({
    type: 'tasks',
    title: payload.title,
    metadata: payload.metadata,
  })
  return response.object as Task
}
