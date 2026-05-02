'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Column } from '@/types'
import TaskCard from '@/components/TaskCard'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  updatingTaskIds: Set<string>
}

export default function KanbanColumn({ column, tasks, updatingTaskIds }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const columnBgClass = isOver ? 'drag-over' : ''

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
          <h2 className={`font-semibold text-sm uppercase tracking-wider ${column.color}`}>
            {column.label}
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-brand-card border border-brand-border rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] rounded-xl border border-brand-border bg-brand-surface/50 p-3 transition-all ${columnBgClass}`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isUpdating={updatingTaskIds.has(task.id)}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-24 text-slate-600 text-sm">
            <span className="text-lg mb-1">+</span>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}