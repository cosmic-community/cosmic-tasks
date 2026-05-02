export interface TaskMetadata {
  title?: string
  contact?: CosmicContact | null
  company?: CosmicCompany | null
  priority?: { key: string; value: string } | string
  task_status?: { key: string; value: string } | string
  due_date?: string
  notes?: string
  assigned_to?: { title: string; id: string; slug: string } | string | null
}

export interface Task {
  id: string
  slug: string
  title: string
  metadata: TaskMetadata
  created_at: string
  modified_at: string
}

export interface CosmicContact {
  id: string
  title: string
  slug: string
}

export interface CosmicCompany {
  id: string
  title: string
  slug: string
}

export type ColumnId = 'To Do' | 'In Progress' | 'Done'

export interface Column {
  id: ColumnId
  label: string
  color: string
  dotColor: string
}

export const COLUMNS: Column[] = [
  { id: 'To Do', label: 'To Do', color: 'text-indigo-400', dotColor: 'bg-indigo-400' },
  { id: 'In Progress', label: 'In Progress', color: 'text-amber-400', dotColor: 'bg-amber-400' },
  { id: 'Done', label: 'Done', color: 'text-green-400', dotColor: 'bg-green-400' },
]

export const ASSIGNEES = ['Tony', 'Jeff'] as const
export type Assignee = typeof ASSIGNEES[number]

// Maps Cosmic team-member object IDs to display names
export const TEAM_MEMBER_ID_TO_NAME: Record<string, string> = {
  '69cd5f472815af68cf40dd6a': 'Tony',
  '69cd5f4c2815af68cf40dd70': 'Jeff',
}

export const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: 'Urgent', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  Urgent: { label: 'Urgent', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },
  high: { label: 'High', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  High: { label: 'High', bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  medium: { label: 'Medium', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  Medium: { label: 'Medium', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  low: { label: 'Low', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40' },
  Low: { label: 'Low', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40' },
}

// Resolves assigned_to to a display name.
// Handles: raw object ID string, resolved {title} object, or plain name string.
export function getAssigneeName(assigned_to: TaskMetadata['assigned_to']): string {
  if (!assigned_to) return ''

  // Resolved object from depth(1)
  if (typeof assigned_to === 'object' && 'title' in assigned_to) {
    return assigned_to.title.trim()
  }

  if (typeof assigned_to === 'string') {
    const trimmed = assigned_to.trim()
    if (!trimmed) return ''

    // Check if it's a known team member ID
    if (TEAM_MEMBER_ID_TO_NAME[trimmed]) {
      return TEAM_MEMBER_ID_TO_NAME[trimmed]
    }

    // Fall back to treating it as a plain name string
    return trimmed
  }

  return ''
}
