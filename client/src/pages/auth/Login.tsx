import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginValues } from '@/lib/validation'
import { normalizeApiError } from '@/lib/api-error'
import { Button, Input, PasswordInput } from '@/components/ui'
import { displayName } from '@/lib/format'

interface LocationState {
  from?: { pathname: string }
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    setFormError(null)

    try {
      const user = await login(values)
      toast.success(`Welcome back, ${displayName(user)}`)

      // Return the user to the page that bounced them here, if any.
      const from = (location.state as LocationState | null)?.from?.pathname
      navigate(from ?? '/dashboard', { replace: true })
    } catch (error) {
      const { message, fieldErrors } = normalizeApiError(error)

      // Surface per-field messages from the backend validator where possible.
      const hasFieldErrors = Object.keys(fieldErrors).length > 0
      for (const [field, fieldMessage] of Object.entries(fieldErrors)) {
        if (field === 'email' || field === 'password') {
          setError(field, { message: fieldMessage })
        }
      }

      if (!hasFieldErrors) setFormError(message)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Sign in</h1>
        <p className="text-sm text-muted">Welcome back. Enter your details to continue.</p>
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

        <div className="space-y-1.5">
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand transition-opacity hover:opacity-80"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-brand transition-opacity hover:opacity-80">
          Create one
        </Link>
      </p>
    </div>
  )
}
