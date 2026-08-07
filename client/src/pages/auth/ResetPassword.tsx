import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/services'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation'
import { normalizeApiError } from '@/lib/api-error'
import { Button, PasswordInput } from '@/components/ui'

export default function ResetPassword() {
  const { resetToken } = useParams<{ resetToken: string }>()
  const navigate = useNavigate()
  const [isDone, setIsDone] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!resetToken) return
    setFormError(null)

    try {
      await authService.resetPassword(resetToken, values.newPassword)
      setIsDone(true)
      toast.success('Password updated. You can sign in now.')
      window.setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch (error) {
      setFormError(normalizeApiError(error).message)
    }
  }

  if (isDone) {
    return (
      <div className="space-y-6 text-center">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success"
          aria-hidden
        >
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Password updated</h1>
          <p className="text-sm text-muted">Redirecting you to the sign in page…</p>
        </div>

        <Button fullWidth onClick={() => navigate('/login', { replace: true })}>
          Sign in now
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Set a new password</h1>
        <p className="text-sm text-muted">Choose a password you haven&apos;t used before.</p>
      </header>

      {formError && (
        <div role="alert" className="space-y-2 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-3">
          <p className="text-sm text-danger">{formError}</p>
          <Link to="/forgot-password" className="inline-block text-xs font-medium text-danger underline">
            Request a new reset link
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </div>
  )
}
