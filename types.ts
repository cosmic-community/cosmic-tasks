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

export const ASSIGNEES = ['Tony', 'Jeff'] as const
export type Assignee = typeof ASSIGNEES[number]

// Maps Cosmic team-member object IDs to display names
export const TEAM_MEMBER_ID_TO_NAME: Record<string, string> = {
  '69cd5f472815af68cf40dd6a': 'Tony',
  '69cd5f4c2815af68cf40dd70': 'Jeff',
}

// Maps full names (as stored in CMS object titles) to display names
export const TEAM_MEMBER_TITLE_TO_NAME: Record<string, string> = {
  'Tony Spiro': 'Tony',
  'Jeff Hovinga': 'Jeff',
  'tony spiro': 'Tony',
  'jeff hovinga': 'Jeff',
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

// Resolves assigned_to to a short display name ('Tony' or 'Jeff').
// Handles: raw object ID string, resolved {title, id} object, or plain name string.
export function getAssigneeName(assigned_to: TaskMetadata['assigned_to']): string {
  if (!assigned_to) return ''

  // Resolved object from depth(1) — e.g. { title: 'Tony Spiro', id: '...' }
  if (typeof assigned_to === 'object' && 'title' in assigned_to) {
    const title = assigned_to.title.trim()
    if (TEAM_MEMBER_TITLE_TO_NAME[title]) return TEAM_MEMBER_TITLE_TO_NAME[title]
    if ('id' in assigned_to && TEAM_MEMBER_ID_TO_NAME[(assigned_to as { id: string }).id]) {
      return TEAM_MEMBER_ID_TO_NAME[(assigned_to as { id: string }).id]
    }
    return title.split(' ')[0]
  }

  if (typeof assigned_to === 'string') {
    const trimmed = assigned_to.trim()
    if (!trimmed) return ''
    if (TEAM_MEMBER_ID_TO_NAME[trimmed]) return TEAM_MEMBER_ID_TO_NAME[trimmed]
    if (TEAM_MEMBER_TITLE_TO_NAME[trimmed]) return TEAM_MEMBER_TITLE_TO_NAME[trimmed]
    return trimmed.split(' ')[0]
  }

  return ''
}
