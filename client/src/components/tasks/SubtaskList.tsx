import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import type { Subtask } from '@/types'

interface SubtaskListProps {
  subtasks: Subtask[]
  canManage: boolean
  canToggle: boolean
  onToggle: (subtaskId: string, isCompleted: boolean) => void
  onCreate: (title: string) => Promise<unknown>
  onDelete: (subtaskId: string) => void
  isCreating?: boolean
}

export function SubtaskList({
  subtasks,
  canManage,
  canToggle,
  onToggle,
  onCreate,
  onDelete,
  isCreating = false,
}: SubtaskListProps) {
  const [title, setTitle] = useState('')

  const completed = subtasks.filter((subtask) => subtask.isCompleted).length

  const handleAdd = async () => {
    const trimmed = title.trim()
    if (!trimmed) return

    await onCreate(trimmed)
    setTitle('')
  }

  return (
    <div className="space-y-4">
      {subtasks.length > 0 && (
        <ProgressBar
          value={completed}
          total={subtasks.length}
          label={`${completed} of ${subtasks.length} done`}
        />
      )}

      {subtasks.length === 0 ? (
        <p className="text-sm text-muted">No subtasks yet.</p>
      ) : (
        <ul className="space-y-1">
          {subtasks.map((subtask) => (
            <li
              key={subtask._id}
              className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-elevated"
            >
              <input
                type="checkbox"
                checked={subtask.isCompleted}
                disabled={!canToggle}
                onChange={(event) => onToggle(subtask._id, event.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-border text-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-50"
                aria-label={subtask.title}
              />

              <span
                className={
                  subtask.isCompleted
                    ? 'min-w-0 flex-1 text-sm text-subtle line-through'
                    : 'min-w-0 flex-1 text-sm text-fg'
                }
              >
                {subtask.title}
              </span>

              {canManage && (
                <button
                  type="button"
                  onClick={() => onDelete(subtask._id)}
                  className="shrink-0 rounded p-1 text-muted opacity-0 transition-opacity hover:text-danger focus:opacity-100 group-hover:opacity-100"
                  aria-label={`Delete subtask ${subtask.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void handleAdd()
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Add a subtask…"
            aria-label="New subtask title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="secondary"
            isLoading={isCreating}
            disabled={!title.trim()}
            leftIcon={<Plus className="h-4 w-4" aria-hidden />}
          >
            Add
          </Button>
        </form>
      )}
    </div>
  )
}
