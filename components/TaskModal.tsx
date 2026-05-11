'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Task } from '@/types'
import { PRIORITY_CONFIG, getAssigneeName, getAssigneeInitials } from '@/types'
import { getMetafieldValue } from '@/lib/cosmic'

interface TaskModalProps {
  task: Task | null
  onClose: () => void
  onUpdate?: (taskId: string, updates: Partial<Task>) => void
  onDelete?: (taskId: string) => void
}

const CMS_BASE = 'https://app.cosmicjs.com/cosmic-crm-production/objects'

const PRIORITY_OPTIONS = [
  { key: 'urgent', label: 'Urgent' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
]

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

function formatDateInput(dateStr: string | undefined): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0] ?? ''
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

export default function TaskModal({ task, onClose, onUpdate, onDelete }: TaskModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  // Editable state
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [title, setTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [priority, setPriority] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Track original values to detect changes
  const originalValues = useRef({ title: '', notes: '', priority: '', dueDate: '' })

  // Initialize state when task changes
  useEffect(() => {
    if (!task) return
    const t = task.title || ''
    const n = task.metadata?.notes || ''
    const p = getMetafieldValue(task.metadata?.priority).toLowerCase()
    const d = formatDateInput(task.metadata?.due_date)
    setTitle(t)
    setNotes(n)
    setPriority(p)
    setDueDate(d)
    setEditingNotes(false)
    setEditingTitle(false)
    setSaved(false)
    setHasChanges(false)
    setShowDeleteConfirm(false)
    setDeleting(false)
    originalValues.current = { title: t, notes: n, priority: p, dueDate: d }
  }, [task])

  // Track changes
  useEffect(() => {
    const orig = originalValues.current
    const changed =
      title !== orig.title ||
      notes !== orig.notes ||
      priority !== orig.priority ||
      dueDate !== orig.dueDate
    setHasChanges(changed)
  }, [title, notes, priority, dueDate])

  // Auto-resize notes textarea
  useEffect(() => {
    if (editingNotes && notesRef.current) {
      const el = notesRef.current
      el.style.height = 'auto'
      el.style.height = Math.max(el.scrollHeight, 120) + 'px'
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
    }
  }, [editingNotes])

  const saveChanges = useCallback(async () => {
    if (!task || !hasChanges) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {}
      const orig = originalValues.current
      if (title !== orig.title) body.title = title
      if (notes !== orig.notes) body.notes = notes
      if (priority !== orig.priority) body.priority = priority
      if (dueDate !== orig.dueDate) body.due_date = dueDate || null

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        originalValues.current = { title, notes, priority, dueDate }
        setHasChanges(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)

        if (onUpdate) {
          onUpdate(task.id, {
            title,
            metadata: {
              ...task.metadata,
              notes,
              priority: { key: priority, value: PRIORITY_OPTIONS.find(p => p.key === priority)?.label || priority },
              due_date: dueDate || undefined,
              title,
            },
          })
        }
      } else {
        console.error('Failed to save task')
      }
    } catch (err) {
      console.error('Error saving task:', err)
    } finally {
      setSaving(false)
    }
  }, [task, title, notes, priority, dueDate, hasChanges, onUpdate])

  const handleDelete = useCallback(async () => {
    if (!task || !onDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onDelete(task.id)
        onClose()
      } else {
        console.error('Failed to delete task')
        setDeleting(false)
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }, [task, onDelete, onClose])

  const handleClose = useCallback(async () => {
    if (hasChanges) {
      await saveChanges()
    }
    onClose()
  }, [hasChanges, saveChanges, onClose])

  useEffect(() => {
    if (!task) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false)
          return
        }
        if (editingNotes) {
          setEditingNotes(false)
          return
        }
        if (editingTitle) {
          setEditingTitle(false)
          return
        }
        handleClose()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveChanges()
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [task, editingNotes, editingTitle, showDeleteConfirm, handleClose, saveChanges])

  if (!task) return null

  const statusRaw = getMetafieldValue(task.metadata?.task_status)
  const assignee = getAssigneeName(task.metadata?.assigned_to)
  const overdue = isOverdue(dueDate)

  const contact = task.metadata?.contact
  const company = task.metadata?.company

  const assigneeColor =
    assignee === 'Tony'
      ? 'bg-violet-500'
      : assignee === 'Jeff'
      ? 'bg-cyan-500'
      : 'bg-slate-600'
  const initials = getAssigneeInitials(task.metadata?.assigned_to)

  const statusColors: Record<string, string> = {
    'To Do': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    'In Progress': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    'Done': 'bg-green-500/20 text-green-400 border-green-500/40',
  }
  const statusStyle = statusColors[statusRaw] ?? 'bg-slate-700/50 text-slate-400 border-slate-600/50'
  const currentPriorityInfo = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG[priority.toLowerCase()]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose()
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-brand-card border border-brand-border rounded-2xl shadow-2xl animate-fade-in"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Delete confirmation overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 mx-6 max-w-sm w-full shadow-2xl animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delete Task</h3>
                  <p className="text-xs text-slate-400">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-5">
                Are you sure you want to delete <span className="font-medium text-white">&ldquo;{task.title}&rdquo;</span>?
              </p>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top bar: save indicator + close */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-4 pb-2 bg-brand-card rounded-t-2xl">
          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            )}
            {saved && !saving && (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            {hasChanges && !saving && !saved && (
              <span className="text-xs text-amber-400">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasChanges && (
              <button
                onClick={saveChanges}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-accent text-white hover:bg-brand-accent/80 transition-colors"
              >
                Save
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-accent/20 transition-all"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Editable Title */}
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingTitle(false)
              }}
              autoFocus
              className="w-full text-lg font-bold text-white bg-transparent border-b-2 border-brand-accent/50 outline-none pb-1 mb-4"
            />
          ) : (
            <h2
              className="text-lg font-bold text-white leading-snug pr-8 mb-4 cursor-text hover:bg-white/5 rounded-lg px-1 -mx-1 py-0.5 transition-colors"
              onClick={() => setEditingTitle(true)}
              title="Click to edit title"
            >
              {title}
            </h2>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-5">
            {/* Status */}
            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle}`}>
              {statusRaw}
            </span>

            {/* Priority selector */}
            <div className="relative group/priority">
              <button
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                  currentPriorityInfo
                    ? `${currentPriorityInfo.bg} ${currentPriorityInfo.text} ${currentPriorityInfo.border}`
                    : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                }`}
              >
                {currentPriorityInfo?.label || 'Priority'}
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 bg-brand-card border border-brand-border rounded-lg shadow-xl py-1 min-w-[120px] opacity-0 invisible group-hover/priority:opacity-100 group-hover/priority:visible transition-all z-20">
                {PRIORITY_OPTIONS.map((opt) => {
                  const info = PRIORITY_CONFIG[opt.key]
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setPriority(opt.key)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 transition-colors flex items-center gap-2 ${
                        priority === opt.key ? 'text-white font-medium' : 'text-slate-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${info?.bg || 'bg-slate-600'}`} />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Due date */}
            <label className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
              overdue && dueDate
                ? 'bg-red-500/15 text-red-400 border-red-500/30'
                : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:border-slate-500'
            }`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dueDate ? (
                <>{overdue ? 'Overdue: ' : ''}{formatDate(dueDate)}</>
              ) : (
                'Set date'
              )}
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="sr-only"
              />
            </label>
            {dueDate && (
              <button
                onClick={() => setDueDate('')}
                className="inline-flex items-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
                title="Clear due date"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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

            {/* Notes - Notion-style editable */}
            <div className="flex items-start gap-3">
              <span className="text-xs text-slate-500 uppercase tracking-wider w-24 shrink-0 pt-1">Notes</span>
              <div className="flex-1 min-w-0">
                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      ref={notesRef}
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value)
                        const el = e.target
                        el.style.height = 'auto'
                        el.style.height = Math.max(el.scrollHeight, 120) + 'px'
                      }}
                      placeholder="Write your notes here... (Markdown supported)"
                      className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-4 py-3 text-sm text-slate-200 leading-relaxed placeholder:text-slate-600 outline-none focus:border-brand-accent/50 transition-colors resize-none font-mono"
                      style={{ minHeight: '120px' }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Markdown supported · Esc to preview</span>
                      <button
                        onClick={() => setEditingNotes(false)}
                        className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded transition-colors"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingNotes(true)}
                    className="group/notes cursor-text rounded-lg px-1 -mx-1 py-1 hover:bg-white/5 transition-colors min-h-[40px]"
                    title="Click to edit notes"
                  >
                    {notes ? (
                      <div className="text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:text-white prose-headings:mt-3 prose-headings:mb-1.5 prose-strong:text-white prose-a:text-brand-accent prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-code:text-amber-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                        <ReactMarkdown>{notes}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600 italic">Click to add notes...</p>
                    )}
                    <div className="opacity-0 group-hover/notes:opacity-100 transition-opacity mt-1">
                      <span className="text-xs text-slate-600">Click to edit</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Created / Modified */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 uppercase tracking-wider w-24 shrink-0">Created</span>
              <span className="text-sm text-slate-400">{formatDate(task.created_at)}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-brand-border mt-5 mb-4" />

          {/* Bottom bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              {onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
            <span className="text-xs text-slate-600">⌘S to save</span>
          </div>
        </div>
      </div>
    </div>
  )
}
