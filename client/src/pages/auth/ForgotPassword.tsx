import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import { authService } from '@/services'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validation'
import { normalizeApiError } from '@/lib/api-error'
import { Button, Input } from '@/components/ui'

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    setFormError(null)

    try {
      await authService.forgotPassword(values.email)
      setSentTo(values.email)
    } catch (error) {
      const { status, message } = normalizeApiError(error)

      // The backend 404s for unknown emails. Showing the same confirmation
      // either way avoids leaking which addresses have accounts.
      if (status === 404) {
        setSentTo(values.email)
        return
      }

      setFormError(message)
    }
  }

  if (sentTo) {
    return (
      <div className="space-y-6 text-center">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success"
          aria-hidden
        >
          <MailCheck className="h-5 w-5" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Check your inbox</h1>
          <p className="text-sm text-muted">
            If an account exists for <span className="font-medium text-fg">{sentTo}</span>, we sent a
            password reset link. It expires in 20 minutes.
          </p>
        </div>

        <Button variant="secondary" fullWidth onClick={() => setSentTo(null)}>
          Use a different email
        </Button>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Forgot your password?</h1>
        <p className="text-sm text-muted">
          Enter the email on your account and we&apos;ll send you a reset link.
        </p>
      </header>

      {formError && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-3">
          <p className="text-sm text-danger">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" aria-hidden />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
