import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BadgeCheck, MailWarning, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services'
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/validation'
import { normalizeApiError } from '@/lib/api-error'
import { PageHeader } from '@/components/common'
import { Avatar, Badge, Button, Card, CardBody, CardHeader, PasswordInput } from '@/components/ui'
import { displayName, formatDate } from '@/lib/format'

export default function Profile() {
  const { user, refresh } = useAuth()
  const [isResending, setIsResending] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  })

  if (!user) return null

  const name = displayName(user)

  const onChangePassword = async (values: ChangePasswordValues) => {
    try {
      await authService.changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword })
      toast.success('Password changed successfully')
      reset()
    } catch (error) {
      const { message, status } = normalizeApiError(error)

      // 400 here means the current password did not match.
      if (status === 400) {
        setError('oldPassword', { message: 'That does not match your current password' })
        return
      }

      toast.error(message)
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await authService.resendEmailVerification()
      toast.success('Verification email sent')
    } catch (error) {
      toast.error(normalizeApiError(error).message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <PageHeader title="Profile" description="Your account details and password." />

      <div className="grid max-w-4xl gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="flex flex-col items-center text-center">
            <Avatar name={name} src={user.avatar?.url} size="lg" />

            <h2 className="mt-4 text-base font-semibold text-fg">{name}</h2>
            <p className="mt-0.5 text-sm text-muted">@{user.username}</p>

            <div className="mt-3">
              {user.isEmailVerified ? (
                <Badge tone="success">
                  <BadgeCheck className="h-3 w-3" aria-hidden />
                  Verified
                </Badge>
              ) : (
                <Badge tone="warning">
                  <MailWarning className="h-3 w-3" aria-hidden />
                  Unverified
                </Badge>
              )}
            </div>

            <p className="mt-4 text-xs text-subtle">Joined {formatDate(user.createdAt)}</p>
          </CardBody>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title="Account details"
              description="Editing these requires a backend profile endpoint, which does not exist yet."
            />
            <CardBody>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-fg">
                    {user.fullName || <span className="text-subtle">Not set</span>}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                    Username
                  </dt>
                  <dd className="mt-1 text-sm text-fg">@{user.username}</dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">Email</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-3 text-sm text-fg">
                    {user.email}
                    {!user.isEmailVerified && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResendVerification}
                        isLoading={isResending}
                      >
                        Resend verification
                      </Button>
                    )}
                  </dd>
                </div>
              </dl>

              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => void refresh()}
              >
                Refresh from server
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Change password
                </span>
              }
              description="You'll stay signed in on this device."
            />

            <CardBody>
              <form
                onSubmit={handleSubmit(onChangePassword)}
                className="max-w-md space-y-4"
                noValidate
              >
                <PasswordInput
                  label="Current password"
                  autoComplete="current-password"
                  error={errors.oldPassword?.message}
                  {...register('oldPassword')}
                />

                <PasswordInput
                  label="New password"
                  autoComplete="new-password"
                  hint="At least 8 characters"
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />

                <PasswordInput
                  label="Confirm new password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button type="submit" isLoading={isSubmitting}>
                  Update password
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  )
}
