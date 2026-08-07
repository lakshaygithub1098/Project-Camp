import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'
import { normalizeApiError } from '@/lib/api-error'
import { Button } from './Button'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  title?: string
}

/** Standard failure panel for a query that could not load. */
export function ErrorState({ error, onRetry, title }: ErrorStateProps) {
  const { message, isNetworkError, status } = normalizeApiError(error)
  const Icon = isNetworkError ? WifiOff : AlertCircle

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-danger/30 bg-danger/5 px-6 py-12 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger"
        aria-hidden
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-sm font-semibold text-fg">
        {title ?? (isNetworkError ? 'Cannot reach the server' : 'Something went wrong')}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-muted">{message}</p>

      {status === 404 && (
        <p className="mt-2 max-w-md text-xs text-subtle">
          This endpoint may not be available on the server yet.
        </p>
      )}

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" aria-hidden />}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
