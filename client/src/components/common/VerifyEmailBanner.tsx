import { useState } from 'react'
import { MailWarning, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services'
import { normalizeApiError } from '@/lib/api-error'
import { Button } from '@/components/ui'

/**
 * Nudges unverified users to confirm their email. Dismissible for the session
 * only — it returns on reload, since verification still matters.
 */
export function VerifyEmailBanner() {
  const { user } = useAuth()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isSending, setIsSending] = useState(false)

  if (!user || user.isEmailVerified || isDismissed) return null

  const handleResend = async () => {
    setIsSending(true)
    try {
      await authService.resendEmailVerification()
      toast.success('Verification email sent. Check your inbox.')
    } catch (error) {
      toast.error(normalizeApiError(error).message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
      <MailWarning className="h-4 w-4 shrink-0 text-warning" aria-hidden />

      <p className="flex-1 text-sm text-fg">
        Your email address is not verified yet. Verify it to secure your account.
      </p>

      <Button variant="secondary" size="sm" onClick={handleResend} isLoading={isSending}>
        Resend email
      </Button>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="rounded p-1 text-muted transition-colors hover:text-fg"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
