'use client'

interface Assignee {
  name: string
  color: string
  bgColor: string
}

interface FilterBarProps {
  assignees: Assignee[]
  selectedAssignee: string
  onSelectAssignee: (assignee: string) => void
  taskCount: number
}

const PALETTE = [
  { color: 'text-violet-400', border: 'border-violet-500/40', activeBg: 'bg-violet-500', hoverBorder: 'hover:border-violet-400', avatar: 'bg-violet-500' },
  { color: 'text-cyan-400', border: 'border-cyan-500/40', activeBg: 'bg-cyan-500', hoverBorder: 'hover:border-cyan-400', avatar: 'bg-cyan-500' },
  { color: 'text-emerald-400', border: 'border-emerald-500/40', activeBg: 'bg-emerald-500', hoverBorder: 'hover:border-emerald-400', avatar: 'bg-emerald-500' },
  { color: 'text-amber-400', border: 'border-amber-500/40', activeBg: 'bg-amber-500', hoverBorder: 'hover:border-amber-400', avatar: 'bg-amber-500' },
  { color: 'text-pink-400', border: 'border-pink-500/40', activeBg: 'bg-pink-500', hoverBorder: 'hover:border-pink-400', avatar: 'bg-pink-500' },
] as const

export function getAssigneeColor(name: string, index: number) {
  return PALETTE[index % PALETTE.length]
}

export default function FilterBar({ assignees, selectedAssignee, onSelectAssignee, taskCount }: FilterBarProps) {
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

      {/* Dynamic assignee buttons */}
      {assignees.map((assignee, index) => {
        const palette = PALETTE[index % PALETTE.length]
        const isActive = selectedAssignee === assignee.name
        return (
          <button
            key={assignee.name}
            onClick={() => onSelectAssignee(assignee.name)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all bg-brand-card ${
              isActive
                ? `${palette.activeBg} text-white border-transparent`
                : `${palette.color} ${palette.border} ${palette.hoverBorder}`
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${palette.avatar}`}
            >
              {assignee.name.slice(0, 1).toUpperCase()}
            </div>
            {assignee.name}
          </button>
        )
      })}

      <span className="ml-auto text-xs text-slate-500">
        {taskCount} task{taskCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
