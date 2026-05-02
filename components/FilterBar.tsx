'use client'

import type { TeamMember } from '@/lib/cosmic'

// Generate a consistent color based on the member's name
function getMemberColor(firstName: string): { active: string; inactive: string; avatar: string } {
  const colors = [
    { active: 'bg-violet-500 text-white border-violet-500', inactive: 'text-violet-400 border-violet-500/40 hover:border-violet-400', avatar: 'bg-violet-500' },
    { active: 'bg-cyan-500 text-white border-cyan-500', inactive: 'text-cyan-400 border-cyan-500/40 hover:border-cyan-400', avatar: 'bg-cyan-500' },
    { active: 'bg-emerald-500 text-white border-emerald-500', inactive: 'text-emerald-400 border-emerald-500/40 hover:border-emerald-400', avatar: 'bg-emerald-500' },
    { active: 'bg-pink-500 text-white border-pink-500', inactive: 'text-pink-400 border-pink-500/40 hover:border-pink-400', avatar: 'bg-pink-500' },
    { active: 'bg-amber-500 text-white border-amber-500', inactive: 'text-amber-400 border-amber-500/40 hover:border-amber-400', avatar: 'bg-amber-500' },
  ]
  let hash = 0
  for (let i = 0; i < firstName.length; i++) hash += firstName.charCodeAt(i)
  return colors[hash % colors.length]
}

interface FilterBarProps {
  teamMembers: TeamMember[]
  selectedMemberId: string
  onSelectMember: (memberId: string) => void
  taskCount: number
}

export default function FilterBar({ teamMembers, selectedMemberId, onSelectMember, taskCount }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Filter by:
      </span>

      {/* All button */}
      <button
        onClick={() => onSelectMember('All')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
          selectedMemberId === 'All'
            ? 'bg-brand-accent text-white border-brand-accent'
            : 'text-slate-400 border-brand-border hover:border-brand-accent/60 bg-brand-card'
        }`}
      >
        All
      </button>

      {/* Dynamic team member buttons */}
      {teamMembers.map((member) => {
        const colors = getMemberColor(member.firstName)
        const isActive = selectedMemberId === member.id
        return (
          <button
            key={member.id}
            onClick={() => onSelectMember(member.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all bg-brand-card ${
              isActive ? colors.active : colors.inactive
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${colors.avatar}`}
            >
              {member.firstName.slice(0, 1)}
            </div>
            {member.firstName}
          </button>
        )
      })}

      <span className="ml-auto text-xs text-slate-500">
        {taskCount} task{taskCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
