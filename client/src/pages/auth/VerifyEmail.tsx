import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { authService } from '@/services'
import { normalizeApiError } from '@/lib/api-error'
import { PageLoader } from '@/components/ui'

type Status = 'verifying' | 'success' | 'error'

export default function VerifyEmail() {
  const { verificationToken } = useParams<{ verificationToken: string }>()
  const [status, setStatus] = useState<Status>('verifying')
  const [message, setMessage] = useState('')
  // React 18 StrictMode double-invokes effects in dev; verify only once.
  const hasRun = useRef(false)

  useEffect(() => {
    if (!verificationToken || hasRun.current) return
    hasRun.current = true

    authService
      .verifyEmail(verificationToken)
      .then(() => setStatus('success'))
      .catch((error) => {
        setMessage(normalizeApiError(error).message)
        setStatus('error')
      })
  }, [verificationToken])

  if (status === 'verifying') return <PageLoader label="Verifying your email" />

  const isSuccess = status === 'success'

  return (
    <div className="space-y-6 text-center">
      <div
        className={
          isSuccess
            ? 'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success'
            : 'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger'
        }
        aria-hidden
      >
        {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {isSuccess ? 'Email verified' : 'Verification failed'}
        </h1>
        <p className="text-sm text-muted">
          {isSuccess
            ? 'Your email address is confirmed. You can sign in and start using ProjectCamp.'
            : message || 'This link is invalid or has expired. Links are valid for 20 minutes.'}
        </p>
      </div>

      <div className="space-y-3">
        <Link
          to="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand px-5 text-sm font-medium text-brand-fg shadow-sm transition-colors hover:bg-brand-hover"
        >
          Go to sign in
        </Link>

        {!isSuccess && (
          <p className="text-xs text-muted">
            Signed in already? Request a fresh link from your dashboard banner.
          </p>
        )}
      </div>
    </div>
  )
}
