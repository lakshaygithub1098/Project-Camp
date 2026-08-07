import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  ListChecks,
  NotebookPen,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Logo } from '@/components/common'
import { ThemeToggleButton } from '@/components/common/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME } from '@/lib/constants'

const FEATURES = [
  {
    Icon: FolderKanban,
    title: 'Projects that stay organised',
    description:
      'Group work into projects, see member counts at a glance, and open any project in a click.',
  },
  {
    Icon: ListChecks,
    title: 'Tasks with real structure',
    description:
      'Statuses, assignees, priorities, due dates, attachments and subtasks — without the clutter.',
  },
  {
    Icon: Users,
    title: 'Role-based access',
    description:
      'Admins, project admins and members each get exactly the permissions they need per project.',
  },
  {
    Icon: NotebookPen,
    title: 'Shared project notes',
    description: 'Keep decisions and context next to the work instead of scattered across chats.',
  },
]

const HIGHLIGHTS = [
  'JWT auth with automatic token refresh',
  'Email verification and password reset',
  'Light and dark themes',
  'Responsive from phone to desktop',
]

export default function Landing() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-full bg-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:text-fg"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg transition-colors hover:bg-brand-hover"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
            Project management, minus the noise
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-6xl">
            Where your team&apos;s work
            <span className="text-brand"> comes together</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
            {APP_NAME} keeps projects, tasks, subtasks, notes and people in one place — with
            role-based access so everyone sees exactly what they should.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-medium text-brand-fg shadow-sm transition-colors hover:bg-brand-hover sm:w-auto"
            >
              {isAuthenticated ? 'Open dashboard' : 'Create free account'}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>

            <Link
              to="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-surface px-6 text-sm font-medium text-fg transition-colors hover:bg-elevated sm:w-auto"
            >
              Sign in
            </Link>
          </div>

          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="inline-flex items-center gap-1.5 text-xs text-muted">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden />
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-surface/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                Everything a small team actually needs
              </h2>
              <p className="mt-3 text-sm text-muted sm:text-base">
                No endless configuration. Just the pieces that make collaborative work legible.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {FEATURES.map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-surface p-6 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-subtle text-brand"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-fg">{title}</h3>
                  <p className="mt-2 text-sm text-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
            <div
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-subtle text-brand"
              aria-hidden
            >
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              Ready when you are
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">
              Create an account, verify your email, and invite your first teammate in under five
              minutes.
            </p>

            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-medium text-brand-fg shadow-sm transition-colors hover:bg-brand-hover"
            >
              {isAuthenticated ? 'Open dashboard' : 'Get started free'}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-xs text-muted">
            Built with React, TypeScript and Tailwind CSS — a portfolio project.
          </p>
        </div>
      </footer>
    </div>
  )
}
