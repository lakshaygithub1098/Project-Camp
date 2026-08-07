import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'

export interface TabItem {
  label: string
  /** Route segment relative to the parent, e.g. "tasks". */
  to: string
  /** Optional count rendered as a pill, e.g. number of tasks. */
  count?: number
  /** True for the tab that should match the parent index route. */
  end?: boolean
}

/**
 * Route-driven tabs. Using links rather than local state means each tab is
 * bookmarkable and the browser back button behaves as users expect.
 */
export function Tabs({ items, className }: { items: TabItem[]; className?: string }) {
  return (
    <div className={cn('border-b border-border', className)}>
      <nav className="scrollbar-thin -mb-px flex gap-1 overflow-x-auto" aria-label="Sections">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:border-border-strong hover:text-fg',
              )
            }
          >
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span className="rounded-full bg-elevated px-1.5 py-0.5 text-xs font-medium text-muted">
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
