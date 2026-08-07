import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-brand"
        aria-hidden
      >
        <Compass className="h-6 w-6" />
      </div>

      <p className="mt-6 text-sm font-medium text-brand">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
        >
          Go back
        </Button>

        <Link
          to="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
