import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterValues } from '@/lib/validation'
import { normalizeApiError } from '@/lib/api-error'
import { Button, Input, PasswordInput } from '@/components/ui'

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', username: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null)

    try {
      await registerUser({
        email: values.email,
        username: values.username,
        password: values.password,
        fullName: values.fullName || undefined,
      })

      toast.success('Account created. Check your inbox to verify your email.')
      // Registration does not sign the user in, so send them to login.
      navigate('/login', { replace: true })
    } catch (error) {
      const { message, fieldErrors } = normalizeApiError(error)

      let matched = false
      for (const [field, fieldMessage] of Object.entries(fieldErrors)) {
        if (
          field === 'email' ||
          field === 'username' ||
          field === 'password' ||
          field === 'fullName'
        ) {
          setError(field, { message: fieldMessage })
          matched = true
        }
      }

      if (!matched) setFormError(message)
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Create your account</h1>
        <p className="text-sm text-muted">Start organising your projects in a couple of minutes.</p>
      </header>

      {formError && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-3">
          <p className="text-sm text-danger">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          hint="Optional"
          leftIcon={<User className="h-4 w-4" aria-hidden />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Username"
          autoComplete="username"
          placeholder="adalovelace"
          hint="Lowercase letters, numbers, dots, hyphens or underscores"
          leftIcon={<AtSign className="h-4 w-4" aria-hidden />}
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" aria-hidden />}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand transition-opacity hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  )
}
