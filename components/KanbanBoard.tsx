'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import type { Task, ColumnId } from '@/types'
import { COLUMNS } from '@/types'
import { getAssigneeName } from '@/types'
import { getMetafieldValue } from '@/lib/cosmic'
import KanbanColumn from '@/components/KanbanColumn'
import TaskCard from '@/components/TaskCard'
import FilterBar from '@/components/FilterBar'

interface KanbanBoardProps {
  initialTasks: Task[]
}

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<string>('All')
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // Derive unique assignees dynamically from actual task data
  const assignees = useMemo(() => {
    const seen = new Set<string>()
    const list: { name: string; color: string; bgColor: string }[] = []
    for (const task of tasks) {
      const name = getAssigneeName(task.metadata?.assigned_to)
      if (name && !seen.has(name)) {
        seen.add(name)
        list.push({ name, color: '', bgColor: '' })
      }
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [tasks])

  const getTasksByColumn = useCallback(
    (columnId: ColumnId) => {
      return tasks.filter((task) => {
        const status = getMetafieldValue(task.metadata?.task_status)
        const statusMatch = status === columnId
        const assigneeName = getAssigneeName(task.metadata?.assigned_to)
        const assigneeMatch =
          selectedAssignee === 'All' || assigneeName === selectedAssignee
        return statusMatch && assigneeMatch
      })
    },
    [tasks, selectedAssignee]
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return
    const isOverColumn = COLUMNS.some((col) => col.id === overId)
    if (isOverColumn) return
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return
    const draggedTask = tasks.find((t) => t.id === activeId)
    if (!draggedTask) return

    let targetColumn: ColumnId | null = null
    const columnMatch = COLUMNS.find((col) => col.id === overId)
    if (columnMatch) {
      targetColumn = columnMatch.id
    } else {
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask) {
        const status = getMetafieldValue(overTask.metadata?.task_status) as ColumnId
        if (COLUMNS.some((c) => c.id === status)) {
          targetColumn = status
        }
      }
    }

    if (!targetColumn) return
    const currentStatus = getMetafieldValue(draggedTask.metadata?.task_status)
    if (currentStatus === targetColumn) return

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, metadata: { ...t.metadata, task_status: targetColumn as string } }
          : t
      )
    )

    setUpdatingTaskIds((prev) => new Set(prev).add(activeId))
    try {
      const res = await fetch(`/api/tasks/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_status: targetColumn }),
      })
      if (!res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeId
              ? { ...t, metadata: { ...t.metadata, task_status: currentStatus } }
              : t
          )
        )
        console.error('Failed to update task status')
      }
    } catch (err) {
      console.error('Error updating task:', err)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId
            ? { ...t, metadata: { ...t.metadata, task_status: currentStatus } }
            : t
        )
      )
    } finally {
      setUpdatingTaskIds((prev) => {
        const next = new Set(prev)
        next.delete(activeId)
        return next
      })
    }
  }

  const totalVisible = COLUMNS.reduce(
    (acc, col) => acc + getTasksByColumn(col.id).length,
    0
  )

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Filter Bar - fully dynamic assignees */}
      <FilterBar
        assignees={assignees}
        selectedAssignee={selectedAssignee}
        onSelectAssignee={setSelectedAssignee}
        taskCount={totalVisible}
      />

      {/* Kanban Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByColumn(column.id)}
              updatingTaskIds={updatingTaskIds}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {totalVisible === 0 && (
        <div className="text-center py-16 text-slate-500 animate-fade-in">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium">No tasks found</p>
          <p className="text-sm mt-1">
            {selectedAssignee !== 'All'
              ? `No tasks assigned to ${selectedAssignee}`
              : 'No tasks in Cosmic CMS yet'}
          </p>
        </div>
      )}
    </div>
  )
}
