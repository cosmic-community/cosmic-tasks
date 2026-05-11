'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { TeamMember } from '@/types'
import { PRIORITY_CONFIG } from '@/types'

interface SelectOption {
  id: string
  slug: string
  title: string
  firstName?: string
}

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  onCreate: (task: NewTaskData) => void
  teamMembers: TeamMember[]
}

export interface NewTaskData {
  title: string
  priority: string
  due_date: string
  notes: string
  assigned_to: string
  contact: string
  company: string
}

const PRIORITY_OPTIONS = [
  { key: '', label: 'None' },
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
  { key: 'urgent', label: 'Urgent' },
]

export default function CreateTaskModal({ open, onClose, onCreate, teamMembers }: CreateTaskModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [contact, setContact] = useState('')
  const [company, setCompany] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // Lazy-loaded options for contacts and companies
  const [contacts, setContacts] = useState<SelectOption[]>([])
  const [companies, setCompanies] = useState<SelectOption[]>([])
  const [optionsLoaded, setOptionsLoaded] = useState(false)

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setTitle('')
      setPriority('')
      setDueDate('')
      setNotes('')
      setAssignedTo('')
      setContact('')
      setCompany('')
      setError('')
      setCreating(false)
      // Focus title after animation frame
      requestAnimationFrame(() => titleRef.current?.focus())
    }
  }, [open])

  // Fetch contacts/companies on first open
  useEffect(() => {
    if (open && !optionsLoaded) {
      fetch('/api/tasks/options')
        .then((res) => res.json())
        .then((data: { contacts?: SelectOption[]; companies?: SelectOption[] }) => {
          setContacts(data.contacts ?? [])
          setCompanies(data.companies ?? [])
          setOptionsLoaded(true)
        })
        .catch(() => {
          // Silently fail; dropdowns will just be empty
          setOptionsLoaded(true)
        })
    }
  }, [open, optionsLoaded])

  // Keyboard handling
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  })

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError('Title is required')
      titleRef.current?.focus()
      return
    }
    setCreating(true)
    setError('')

    try {
      onCreate({
        title: title.trim(),
        priority,
        due_date: dueDate,
        notes,
        assigned_to: assignedTo,
        contact,
        company,
      })
    } catch {
      setError('Failed to create task')
      setCreating(false)
    }
  }, [title, priority, dueDate, notes, assignedTo, contact, company, onCreate])

  if (!open) return null

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
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-5 pb-3 bg-brand-card rounded-t-2xl border-b border-brand-border">
          <h2 className="text-base font-bold text-white">New Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-accent/20 transition-all"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Title *</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError('') }}
              placeholder="What needs to be done?"
              className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-accent/50 transition-colors"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>

          {/* Priority + Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-brand-accent/50 transition-colors appearance-none cursor-pointer"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key} className="bg-slate-800">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-brand-accent/50 transition-colors"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-brand-accent/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-800">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.slug} className="bg-slate-800">
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Contact + Company row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Contact</label>
              <select
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-brand-accent/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-800">None</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.slug} className="bg-slate-800">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-brand-accent/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-slate-800">None</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.slug} className="bg-slate-800">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any details... (Markdown supported)"
              rows={3}
              className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-accent/50 transition-colors resize-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-600">⌘ Enter to create</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating || !title.trim()}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-brand-accent text-white hover:bg-brand-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
