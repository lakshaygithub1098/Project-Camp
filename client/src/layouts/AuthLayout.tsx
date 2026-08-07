import { Link, Outlet } from 'react-router-dom'
import { Logo } from '@/components/common/Logo'
import { ThemeToggleButton } from '@/components/common/ThemeToggle'
import { APP_NAME } from '@/lib/constants'

/**
 * Two-column shell for the auth pages: form on the left, marketing panel on the
 * right. The panel is hidden below lg so the form gets the full width on phones.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-full">
      <div className="flex w-full flex-col px-6 py-8 lg:w-1/2 lg:px-16">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggleButton />
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </main>

        <footer className="text-xs text-subtle">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME} ·{' '}
            <Link to="/" className="transition-colors hover:text-fg">
              Back to home
            </Link>
          </p>
        </footer>
      </div>

      <aside
        className="relative hidden w-1/2 overflow-hidden bg-brand lg:block"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-brand-hover" />

        {/* Decorative grid, kept subtle so the copy stays readable. */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.12]">
          <defs>
            <pattern id="auth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0v32" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>

        <div className="relative flex h-full flex-col justify-center px-16 text-brand-fg">
          <blockquote className="max-w-md">
            <p className="text-2xl font-semibold leading-snug tracking-tight">
              Plan the work, track the progress, keep everyone in the loop.
            </p>
            <p className="mt-4 text-sm opacity-80">
              Projects, tasks, subtasks and notes — organised by role, so everyone sees exactly what
              they need to.
            </p>
          </blockquote>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/20 pt-6">
            {[
              ['Role-based', 'access control'],
              ['Subtasks', 'and attachments'],
              ['Shared', 'project notes'],
            ].map(([title, caption]) => (
              <div key={title}>
                <dt className="text-sm font-semibold">{title}</dt>
                <dd className="mt-0.5 text-xs opacity-75">{caption}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  )
}
