'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types'
import { PRIORITY_CONFIG, getAssigneeName, getAssigneeInitials } from '@/types'
import { getMetafieldValue } from '@/lib/cosmic'

interface TaskCardProps {
  task: Task
  isOverlay?: boolean
  isUpdating?: boolean
  onOpenModal?: (task: Task) => void
}

const CMS_BASE = 'https://app.cosmicjs.com/cosmic-crm-production/objects'

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function isOverdue(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  try {
    return new Date(dateStr) < new Date()
  } catch {
    return false
  }
}

export default function TaskCard({ task, isOverlay, isUpdating, onOpenModal }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isOverlay })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityRaw = getMetafieldValue(task.metadata?.priority)
  const priorityKey = priorityRaw.toLowerCase()
  const priorityInfo = PRIORITY_CONFIG[priorityRaw] || PRIORITY_CONFIG[priorityKey]

  const assignee = getAssigneeName(task.metadata?.assigned_to)
  const dueDate = task.metadata?.due_date
  const notes = task.metadata?.notes
  const overdue = isOverdue(dueDate)
  const formattedDate = formatDate(dueDate)

  const initials = getAssigneeInitials(task.metadata?.assigned_to)
  const assigneeColor = assignee === 'Tony' ? 'bg-violet-500' : assignee === 'Jeff' ? 'bg-cyan-500' : 'bg-slate-600'

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-24 rounded-xl border-2 border-dashed border-brand-accent/40 bg-brand-accent/5"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpenModal?.(task)}
      className={`
        group relative bg-brand-card border border-brand-border rounded-xl p-4
        cursor-pointer
        transition-all duration-200
        hover:border-brand-accent/50 hover:shadow-card-hover
        ${isOverlay ? 'shadow-card-hover rotate-2 opacity-95 cursor-grabbing' : 'shadow-card'}
        ${isUpdating ? 'opacity-60 pointer-events-none' : ''}
        animate-fade-in
      `}
    >
      {/* Updating indicator */}
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-brand-bg/40 z-10">
          <svg className="animate-spin w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Header: Title + CMS Link */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold text-white leading-snug flex-1">
          {task.title}
        </h3>
        <a
          href={`${CMS_BASE}/${task.id}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-md hover:bg-brand-accent/20 text-slate-500 hover:text-brand-accent transition-all"
          title="Open in Cosmic CMS"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Notes */}
      {notes && (
        <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">
          {notes}
        </p>
      )}

      {/* Footer: Priority + Due Date + Assignee */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2 flex-wrap">
          {priorityInfo && (
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}>
              {priorityInfo.label}
            </span>
          )}
          {formattedDate && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              overdue
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
            }`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {overdue ? '!' : ''}{formattedDate}
            </span>
          )}
        </div>
        {assignee && (
          <div
            className={`w-6 h-6 rounded-full ${assigneeColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
            title={assignee}
          >
            {initials}
          </div>
        )}
      </div>
    </div>
  )
}
