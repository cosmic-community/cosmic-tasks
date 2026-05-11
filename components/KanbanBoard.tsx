'use client'

import { useState, useCallback } from 'react'
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
import type { Task, ColumnId, TeamMember } from '@/types'
import { COLUMNS } from '@/types'
import { getMetafieldValue } from '@/lib/cosmic'
import KanbanColumn from '@/components/KanbanColumn'
import TaskCard from '@/components/TaskCard'
import FilterBar from '@/components/FilterBar'
import TaskModal from '@/components/TaskModal'
import CreateTaskModal from '@/components/CreateTaskModal'
import type { NewTaskData } from '@/components/CreateTaskModal'

interface KanbanBoardProps {
  initialTasks: Task[]
  teamMembers: TeamMember[]
}

function getAssigneeId(assigned_to: Task['metadata']['assigned_to']): string {
  if (!assigned_to) return ''
  if (typeof assigned_to === 'object' && 'id' in assigned_to) {
    return assigned_to.id
  }
  if (typeof assigned_to === 'string') return assigned_to
  return ''
}

export default function KanbanBoard({ initialTasks, teamMembers }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string>('All')
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set())
  const [modalTask, setModalTask] = useState<Task | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const getTasksByColumn = useCallback(
    (columnId: ColumnId) => {
      return tasks.filter((task) => {
        const status = getMetafieldValue(task.metadata?.task_status)
        const statusMatch = status === columnId
        if (!statusMatch) return false
        if (selectedMemberId === 'All') return true
        const assigneeId = getAssigneeId(task.metadata?.assigned_to)
        return assigneeId === selectedMemberId
      })
    },
    [tasks, selectedMemberId]
  )

  // Handle task updates from modal
  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        return {
          ...t,
          ...(updates.title ? { title: updates.title } : {}),
          metadata: {
            ...t.metadata,
            ...(updates.metadata || {}),
          },
        }
      })
    )
    setModalTask((prev) => {
      if (!prev || prev.id !== taskId) return prev
      return {
        ...prev,
        ...(updates.title ? { title: updates.title } : {}),
        metadata: {
          ...prev.metadata,
          ...(updates.metadata || {}),
        },
      }
    })
  }, [])

  // Handle task deletion
  const handleTaskDelete = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setModalTask(null)
  }, [])

  // Handle creating a new task
  const handleCreateTask = useCallback(async (data: NewTaskData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
        console.error('Failed to create task:', err.error)
        return
      }

      // Refresh the full task list so we get properly resolved relationships
      const tasksRes = await fetch('/api/tasks')
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json() as { tasks: Task[] }
        setTasks(tasksData.tasks)
      }

      setShowCreateModal(false)
    } catch (err) {
      console.error('Error creating task:', err)
    }
  }, [])

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
        if (COLUMNS.some((c) => c.id === status)) targetColumn = status
      }
    }
    if (!targetColumn) return

    const currentStatus = getMetafieldValue(draggedTask.metadata?.task_status)
    if (currentStatus === targetColumn) return

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
    <>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <FilterBar
          teamMembers={teamMembers}
          selectedMemberId={selectedMemberId}
          onSelectMember={setSelectedMemberId}
          taskCount={totalVisible}
          onCreateTask={() => setShowCreateModal(true)}
        />

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
                onOpenModal={setModalTask}
                onCreateTask={() => setShowCreateModal(true)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>

        {totalVisible === 0 && (
          <div className="text-center py-16 text-slate-500 animate-fade-in">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium">No tasks found</p>
            <p className="text-sm mt-1">
              {selectedMemberId !== 'All'
                ? `No tasks assigned to ${teamMembers.find((m) => m.id === selectedMemberId)?.firstName ?? 'this person'}`
                : 'No tasks in Cosmic CMS yet'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-brand-accent text-white hover:bg-brand-accent/80 transition-colors"
            >
              + Create your first task
            </button>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskModal
        task={modalTask}
        onClose={() => setModalTask(null)}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTask}
        teamMembers={teamMembers}
      />
    </>
  )
}
