import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Mail } from 'lucide-react'
import { Modal, Button, Input, Select } from '@/components/ui'
import { inviteMemberSchema, type InviteMemberValues } from '@/lib/validation'
import { ROLE_OPTIONS } from '@/lib/constants'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: InviteMemberValues) => Promise<unknown>
  isSubmitting?: boolean
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: InviteMemberModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '', role: 'member' },
  })

  useEffect(() => {
    if (isOpen) reset({ email: '', role: 'member' })
  }, [isOpen, reset])

  const submit = handleSubmit(async (values) => {
    await onSubmit(values)
    onClose()
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a member"
      description="They need an existing ProjectCamp account to be added."
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} isLoading={isSubmitting}>
            Add member
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
          label="Email address"
          type="email"
          placeholder="teammate@example.com"
          leftIcon={<Mail className="h-4 w-4" aria-hidden />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              label="Role"
              options={ROLE_OPTIONS}
              error={errors.role?.message}
              {...field}
            />
          )}
        />

        <p className="rounded-lg bg-elevated px-3 py-2.5 text-xs text-muted">
          <span className="font-medium text-fg">Admin</span> manages the project, members and notes.{' '}
          <span className="font-medium text-fg">Project admin</span> manages tasks.{' '}
          <span className="font-medium text-fg">Member</span> views work and completes subtasks.
        </p>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  )
}
