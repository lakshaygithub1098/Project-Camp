import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Paperclip, X } from 'lucide-react'
import { Modal, Button, Input, Textarea, Select } from '@/components/ui'
import { taskSchema, type TaskValues } from '@/lib/validation'
import { useMembers } from '@/hooks/useMembers'
import { displayName, formatBytes } from '@/lib/format'
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, MAX_ATTACHMENTS } from '@/lib/constants'
import type { Task } from '@/types'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: TaskValues & { attachments?: File[] }) => Promise<unknown>
  projectId: string
  task?: Task
  isSubmitting?: boolean
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  task,
  isSubmitting = false,
}: TaskFormModalProps) {
  const isEditing = Boolean(task)
  const { data: members } = useMembers(projectId)
  const [files, setFiles] = useState<File[]>([])

  const assigneeOptions = useMemo(
    () =>
      (members ?? []).map((member) => ({
        value: member.user._id,
        label: displayName(member.user),
      })),
    [members],
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    },
  })

  useEffect(() => {
    if (!isOpen) return

    setFiles([])
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      assignedTo: task?.assignedTo?._id ?? '',
      status: task?.status ?? 'todo',
      priority: task?.priority ?? 'medium',
      // <input type="date"> needs a bare YYYY-MM-DD value.
      dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    })
  }, [isOpen, task, reset])

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    setFiles((current) => [...current, ...selected].slice(0, MAX_ATTACHMENTS))
    // Reset so selecting the same file twice still fires a change event.
    event.target.value = ''
  }

  const submit = handleSubmit(async (values) => {
    await onSubmit({ ...values, attachments: files })
    onClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit task' : 'New task'}
      size="lg"
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} isLoading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Title"
          placeholder="Design the new onboarding flow"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Add any detail that helps whoever picks this up."
          hint="Optional"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <Select
                label="Assignee"
                placeholder="Unassigned"
                options={assigneeOptions}
                error={errors.assignedTo?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                options={TASK_STATUS_OPTIONS}
                error={errors.status?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                label="Priority"
                options={TASK_PRIORITY_OPTIONS}
                error={errors.priority?.message}
                {...field}
              />
            )}
          />

          <Input
            label="Due date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>

        {/* Attachments are only sent on create — the backend reads req.files there. */}
        {!isEditing && (
          <div className="space-y-2">
            <span className="block text-sm font-medium text-fg">Attachments</span>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted transition-colors hover:border-brand hover:text-fg">
              <Paperclip className="h-4 w-4" aria-hidden />
              Choose files
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={handleFilesSelected}
                disabled={files.length >= MAX_ATTACHMENTS}
              />
            </label>

            {files.length > 0 && (
              <ul className="space-y-1.5">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded-lg bg-elevated px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate text-fg">{file.name}</span>
                    <span className="shrink-0 text-xs text-subtle">{formatBytes(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                      className="rounded p-0.5 text-muted transition-colors hover:text-danger"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs text-subtle">Up to {MAX_ATTACHMENTS} files.</p>
          </div>
        )}

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  )
}
