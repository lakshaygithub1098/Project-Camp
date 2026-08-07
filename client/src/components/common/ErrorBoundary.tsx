import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui'

interface Props {
  children: ReactNode
  /** Remount key: changing this resets the boundary, e.g. on navigation. */
  resetKey?: string
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Catches render-time crashes so one broken panel does not blank the whole app.
 * Data-fetching failures are handled by ErrorState instead — this is for
 * genuine exceptions.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Left as console output: wiring a reporting service is a deployment
    // decision, and swallowing it silently would make debugging harder.
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  private handleReset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <h2 className="text-base font-semibold text-fg">This section failed to load</h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          An unexpected error occurred while rendering. You can retry, or reload the page if the
          problem persists.
        </p>

        <pre className="scrollbar-thin mt-4 max-w-full overflow-x-auto rounded-lg bg-elevated px-3 py-2 text-left text-xs text-muted">
          {this.state.error.message}
        </pre>

        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={this.handleReset}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden />}
          >
            Try again
          </Button>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </div>
    )
  }
}
