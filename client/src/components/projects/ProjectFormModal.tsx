import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, Button, Input, Textarea } from '@/components/ui'
import { projectSchema, type ProjectValues } from '@/lib/validation'
import type { Project } from '@/types'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ProjectValues) => Promise<unknown>
  /** Present when editing; absent when creating. */
  project?: Project
  isSubmitting?: boolean
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  project,
  isSubmitting = false,
}: ProjectFormModalProps) {
  const isEditing = Boolean(project)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '', description: '' },
  })

  // Repopulate whenever the dialog opens so stale values never leak between
  // a create and an edit.
  useEffect(() => {
    if (!isOpen) return
    reset({ name: project?.name ?? '', description: project?.description ?? '' })
  }, [isOpen, project, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
    onClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit project' : 'Create project'}
      description={
        isEditing
          ? 'Update the name or description of this project.'
          : 'Projects group your tasks, notes and teammates.'
      }
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} isLoading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create project'}
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
          label="Project name"
          placeholder="Website redesign"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Description"
          placeholder="What is this project about?"
          hint="Optional"
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Enables Enter-to-submit without a visible duplicate button. */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  )
}
