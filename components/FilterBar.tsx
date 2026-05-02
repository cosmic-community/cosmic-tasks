'use client'

import { ASSIGNEES } from '@/types'

interface FilterBarProps {
  selectedAssignee: string
  onSelectAssignee: (assignee: string) => void
  taskCount: number
}

const ASSIGNEE_COLORS: Record<string, { active: string; inactive: string }> = {
  Tony: {
    active: 'bg-violet-500 text-white border-violet-500',
    inactive: 'text-violet-400 border-violet-500/40 hover:border-violet-400',
  },
  Jeff: {
    active: 'bg-cyan-500 text-white border-cyan-500',
    inactive: 'text-cyan-400 border-cyan-500/40 hover:border-cyan-400',
  },
}

export default function FilterBar({ selectedAssignee, onSelectAssignee, taskCount }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Filter by:
      </span>

      {/* All button */}
      <button
        onClick={() => onSelectAssignee('All')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
          selectedAssignee === 'All'
            ? 'bg-brand-accent text-white border-brand-accent'
            : 'text-slate-400 border-brand-border hover:border-brand-accent/60 bg-brand-card'
        }`}
      >
        All
      </button>

      {/* Assignee buttons */}
      {ASSIGNEES.map((assignee) => {
        const colors = ASSIGNEE_COLORS[assignee]
        const isActive = selectedAssignee === assignee
        return (
          <button
            key={assignee}
            onClick={() => onSelectAssignee(assignee)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all bg-brand-card ${
              isActive ? colors?.active ?? '' : colors?.inactive ?? ''
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                assignee === 'Tony' ? 'bg-violet-500' : 'bg-cyan-500'
              }`}
            >
              {assignee.slice(0, 1)}
            </div>
            {assignee}
          </button>
        )
      })}

      <span className="ml-auto text-xs text-slate-500">
        {taskCount} task{taskCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}