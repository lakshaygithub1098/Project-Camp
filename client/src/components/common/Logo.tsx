import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/constants'

/** Wordmark used in the sidebar, auth pages, and the landing header. */
export function Logo({
  className,
  showText = true,
  to = '/',
}: {
  className?: string
  showText?: boolean
  to?: string
}) {
  return (
    <Link
      to={to}
      className={cn('inline-flex items-center gap-2.5 font-semibold text-fg', className)}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-fg"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
          <path
            d="M6 18V6.8a.8.8 0 0 1 .8-.8h4.4a3.1 3.1 0 0 1 0 6.2H8.4"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16.5" cy="16.5" r="1.9" fill="currentColor" stroke="none" />
        </svg>
      </span>
      {showText && <span className="text-[15px] tracking-tight">{APP_NAME}</span>}
    </Link>
  )
}
