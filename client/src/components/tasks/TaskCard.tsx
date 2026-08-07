import { Link } from 'react-router-dom'
import { CalendarClock, ListChecks, Paperclip } from 'lucide-react'
import { Avatar, PriorityBadge, StatusBadge, Select } from '@/components/ui'
import { displayName, formatDate, isOverdue } from '@/lib/format'
import { TASK_STATUS_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import type { Task, TaskStatus } from '@/types'

interface TaskCardProps {
  task: Task
  projectId: string
  canManage: boolean
  onStatusChange: (status: TaskStatus) => void
  onEdit: () => void
  onDelete: () => void
}

export function TaskCard({
  task,
  projectId,
  canManage,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'done'

  return (
    <div className="group rounded-xl border border-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <Link
          to={`/projects/${projectId}/tasks/${task._id}`}
          className="min-w-0 flex-1 text-sm font-medium text-fg hover:text-brand"
        >
          <span className="line-clamp-2">{task.title}</span>
        </Link>

        {canManage && (
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={onEdit}
              className="rounded px-1.5 py-0.5 text-xs font-medium text-muted transition-colors hover:text-fg"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded px-1.5 py-0.5 text-xs font-medium text-muted transition-colors hover:text-danger"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-muted">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />

        {task.dueDate && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs',
              overdue ? 'font-medium text-danger' : 'text-muted',
            )}
          >
            <CalendarClock className="h-3 w-3" aria-hidden />
            {formatDate(task.dueDate)}
          </span>
        )}

        {task.attachments?.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Paperclip className="h-3 w-3" aria-hidden />
            {task.attachments.length}
          </span>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <ListChecks className="h-3 w-3" aria-hidden />
            {task.subtasks.filter((subtask) => subtask.isCompleted).length}/{task.subtasks.length}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        {task.assignedTo ? (
          <span className="inline-flex min-w-0 items-center gap-2">
            <Avatar
              name={displayName(task.assignedTo)}
              src={task.assignedTo.avatar?.url}
              size="xs"
            />
            <span className="truncate text-xs text-muted">{displayName(task.assignedTo)}</span>
          </span>
        ) : (
          <span className="text-xs text-subtle">Unassigned</span>
        )}

        {canManage ? (
          <Select
            aria-label={`Status for ${task.title}`}
            options={TASK_STATUS_OPTIONS}
            value={task.status}
            onChange={(event) => onStatusChange(event.target.value as TaskStatus)}
            className="h-7 w-auto py-0 pl-2 pr-7 text-xs"
          />
        ) : (
          <StatusBadge status={task.status} />
        )}
      </div>
    </div>
  )
}
