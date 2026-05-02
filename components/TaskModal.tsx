'use client'

import { useEffect, useRef } from 'react'
import type { Task } from '@/types'
import { PRIORITY_CONFIG, getAssigneeName } from '@/types'
import { getMetafieldValue } from '@/lib/cosmic'

interface TaskModalProps {
  task: Task | null
  onClose: () => void
}

const CMS_BASE = 'https://app.cosmicjs.com/cosmic-crm-production/objects'

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!task) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [task, onClose])

  if (!task) return null

  const priorityRaw = getMetafieldValue(task.metadata?.priority)
  const priorityKey = priorityRaw.toLowerCase()
  const priorityInfo = PRIORITY_CONFIG[priorityRaw] || PRIORITY_CONFIG[priorityKey]

  const statusRaw = getMetafieldValue(task.metadata?.task_status)
  const assignee = getAssigneeName(task.metadata?.assigned_to)
  const dueDate = task.metadata?.due_date
  const notes = task.metadata?.notes
  const overdue = isOverdue(dueDate)
  const formattedDate = formatDate(dueDate)

  const contact = task.metadata?.contact
  const company = task.metadata?.company

  const assigneeColor =
    assignee === 'Tony'
      ? 'bg-violet-500'
      : assignee === 'Jeff'
      ? 'bg-cyan-500'
      : 'bg-slate-600'
  const initials = assignee ? assignee.slice(0, 2).toUpperCase() : '??'

  const statusColors: Record<string, string> = {
    'To Do': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    'In Progress': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    'Done': 'bg-green-500/20 text-green-400 border-green-500/40',
  }
  const statusStyle = statusColors[statusRaw] ?? 'bg-slate-700/50 text-slate-400 border-slate-600/50'

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className="relative w-full max-w-lg bg-brand-card border border-brand-border rounded-2xl shadow-2xl animate-fade-in"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-accent/20 transition-all z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Title */}
          <h2 className="text-lg font-bold text-white leading-snug pr-8 mb-4">
            {task.title}
          </h2>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-5">
            {/* Status */}
            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle}`}>
              {statusRaw}
            </span>

            {/* Priority */}
            {priorityInfo && (
              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}>
                {priorityInfo.label}
              </span>
            )}

            {/* Due date */}
            {formattedDate && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
                overdue
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
              }`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {overdue ? 'Overdue: ' : ''}{formattedDate}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-brand-border mb-5" />

          {/* Details grid */}
          <div className="space-y-4">
            {/* Assignee */}
            {assignee && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 uppercase tracking-wider w-24 shrink-0">Assigned to</span>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${assigneeColor} flex items-center justify-center text-white text-xs font-bold`}>
                    {initials}
                  </div>
                  <span className="text-sm text-white font-medium">{assignee}</span>
                </div>
              </div>
            )}

            {/* Contact */}
            {contact && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 uppercase tracking-wider w-24 shrink-0">Contact</span>
                <a
                  href={`${CMS_BASE}/${contact.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-accent hover:underline font-medium"
                >
                  {contact.title}
                </a>
              </div>
            )}

            {/* Company */}
            {company && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 uppercase tracking-wider w-24 shrink-0">Company</span>
                <a
                  href={`${CMS_BASE}/${company.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-accent hover:underline font-medium"
                >
                  {company.title}
                </a>
              </div>
            )}

            {/* Notes */}
            {notes && (
              <div className="flex items-start gap-3">
                <span className="text-xs text-slate-500 uppercase tracking-wider w-24 shrink-0 pt-0.5">Notes</span>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">{notes}</p>
              </div>
            )}

            {/* Created / Modified */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 uppercase tracking-wider w-24 shrink-0">Created</span>
              <span className="text-sm text-slate-400">{formatDate(task.created_at)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-brand-border mt-5 mb-4" />

          {/* CMS link */}
          <a
            href={`${CMS_BASE}/${task.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-brand-accent transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in Cosmic CMS
          </a>
        </div>
      </div>
    </div>
  )
}
