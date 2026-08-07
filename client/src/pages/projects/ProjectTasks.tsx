import { useMemo, useState } from 'react'
import { ListChecks, Plus, Search } from 'lucide-react'
import { useProjectContext } from '@/hooks/useProjectContext'
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from '@/hooks/useTasks'
import { useMembers } from '@/hooks/useMembers'
import { can } from '@/lib/permissions'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskFormModal } from '@/components/tasks/TaskFormModal'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Select,
  SkeletonGrid,
} from '@/components/ui'
import { TASK_STATUS_LABEL } from '@/lib/constants'
import { TaskStatus } from '@/types'
import type { Task } from '@/types'
import type { TaskValues } from '@/lib/validation'
import { displayName } from '@/lib/format'

const COLUMNS: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]

export default function ProjectTasks() {
  const { projectId, role } = useProjectContext()
  const tasksQuery = useTasks(projectId)
  const { data: members } = useMembers(projectId)

  const createTask = useCreateTask(projectId)
  const deleteTask = useDeleteTask(projectId)
  const updateStatus = useUpdateTaskStatus(projectId)

  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')

  // Hook instance for the task currently being edited.
  const updateTask = useUpdateTask(projectId, editingTask?._id ?? '')

  const canManage = can.manageTasks(role)

  const filtered = useMemo(() => {
    const list = tasksQuery.data ?? []
    const term = search.trim().toLowerCase()

    return list.filter((task) => {
      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term)

      const matchesAssignee = !assigneeFilter || task.assignedTo?._id === assigneeFilter

      return matchesSearch && matchesAssignee
    })
  }, [tasksQuery.data, search, assigneeFilter])

  const grouped = useMemo(
    () =>
      COLUMNS.map((status) => ({
        status,
        tasks: filtered.filter((task) => task.status === status),
      })),
    [filtered],
  )

  const openCreate = () => {
    setEditingTask(undefined)
    setIsFormOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleSubmit = async (values: TaskValues & { attachments?: File[] }) => {
    if (editingTask) {
      await updateTask.mutateAsync(values)
    } else {
      await createTask.mutateAsync(values)
    }
  }

  const confirmDelete = async () => {
    if (!taskToDelete) return
    await deleteTask.mutateAsync(taskToDelete._id)
    setTaskToDelete(null)
  }

  const newTaskButton = canManage ? (
    <Button leftIcon={<Plus className="h-4 w-4" aria-hidden />} onClick={openCreate}>
      New task
    </Button>
  ) : null

  if (tasksQuery.isError) {
    return (
      <ErrorState
        error={tasksQuery.error}
        onRetry={() => void tasksQuery.refetch()}
        title="Could not load tasks"
      />
    )
  }

  if (tasksQuery.isLoading) return <SkeletonGrid count={6} />

  const hasTasks = (tasksQuery.data?.length ?? 0) > 0

  return (
    <>
      {hasTasks && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="min-w-[12rem] flex-1 sm:max-w-xs">
            <Input
              type="search"
              placeholder="Search tasks…"
              aria-label="Search tasks"
              leftIcon={<Search className="h-4 w-4" aria-hidden />}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Select
            aria-label="Filter by assignee"
            placeholder="All assignees"
            className="w-auto min-w-[10rem]"
            options={(members ?? []).map((member) => ({
              value: member.user._id,
              label: displayName(member.user),
            }))}
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
          />

          <div className="ml-auto">{newTaskButton}</div>
        </div>
      )}

      {!hasTasks ? (
        <EmptyState
          icon={<ListChecks className="h-5 w-5" aria-hidden />}
          title="No tasks yet"
          description={
            canManage
              ? 'Break the work down into tasks so the team knows what to pick up next.'
              : 'Nothing has been assigned in this project yet.'
          }
          action={newTaskButton}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" aria-hidden />}
          title="No matching tasks"
          description="Try a different search term or clear the assignee filter."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('')
                setAssigneeFilter('')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {grouped.map(({ status, tasks }) => (
            <section key={status} className="space-y-3">
              <header className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-fg">{TASK_STATUS_LABEL[status]}</h2>
                <span className="rounded-full bg-elevated px-2 py-0.5 text-xs font-medium text-muted">
                  {tasks.length}
                </span>
              </header>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-subtle">
                    Nothing here
                  </p>
                ) : (
                  tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      projectId={projectId}
                      canManage={canManage}
                      onStatusChange={(nextStatus) =>
                        updateStatus.mutate({ taskId: task._id, status: nextStatus })
                      }
                      onEdit={() => openEdit(task)}
                      onDelete={() => setTaskToDelete(task)}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        projectId={projectId}
        task={editingTask}
        isSubmitting={createTask.isPending || updateTask.isPending}
      />

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete task"
        message={`“${taskToDelete?.title}” and its subtasks will be permanently removed. This cannot be undone.`}
        isLoading={deleteTask.isPending}
      />
    </>
  )
}
