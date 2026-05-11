'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Column } from '@/types'
import TaskCard from '@/components/TaskCard'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  updatingTaskIds: Set<string>
  onOpenModal: (task: Task) => void
  onCreateTask: () => void
}

export default function KanbanColumn({ column, tasks, updatingTaskIds, onOpenModal, onCreateTask }: KanbanColumnProps) {
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-brand-card border border-brand-border rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
          <button
            onClick={onCreateTask}
            className="p-1 rounded-md text-slate-500 hover:text-brand-accent hover:bg-brand-accent/10 transition-all"
            title="Add task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
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
                onOpenModal={onOpenModal}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <button
            onClick={onCreateTask}
            className="flex flex-col items-center justify-center h-24 w-full text-slate-600 text-sm rounded-lg hover:bg-white/5 hover:text-slate-400 transition-colors"
          >
            <span className="text-lg mb-1">+</span>
            Add a task
          </button>
        )}
      </div>
    </div>
  )
}
