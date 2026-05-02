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

export interface TeamMember {
  id: string
  slug: string
  title: string
  firstName: string
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

// Extracts the full name from assigned_to (before truncation to first name)
function getAssigneeFullName(assigned_to: TaskMetadata['assigned_to']): string {
  if (!assigned_to) return ''

  if (typeof assigned_to === 'object' && 'title' in assigned_to) {
    return (assigned_to.title ?? '').trim()
  }

  if (typeof assigned_to === 'string') {
    return assigned_to.trim()
  }

  return ''
}

// Resolves assigned_to to a display name from various shapes:
// - Resolved object from depth(1): { title, id, slug }
// - Plain string (could be an ID or a name)
// - null/undefined
export function getAssigneeName(assigned_to: TaskMetadata['assigned_to']): string {
  const fullName = getAssigneeFullName(assigned_to)
  if (!fullName) return ''
  // Return first word of the full name (e.g. 'Tony Spiro' -> 'Tony')
  return fullName.split(' ')[0] ?? fullName
}

// Returns the initials derived from the full assigned_to name.
// e.g. 'Tony Spiro' -> 'TS', 'Jeff Hovinga' -> 'JH'
export function getAssigneeInitials(assigned_to: TaskMetadata['assigned_to']): string {
  const fullName = getAssigneeFullName(assigned_to)
  if (!fullName) return '??'
  const parts = fullName.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  // Take the first letter of each word (up to 2)
  return parts
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
