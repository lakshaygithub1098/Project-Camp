import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Breadcrumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  breadcrumbs?: Breadcrumb[]
}

export function PageHeader({ title, description, action, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3 text-subtle" aria-hidden />}
                {crumb.to ? (
                  <Link to={crumb.to} className="transition-colors hover:text-fg">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-fg">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{title}</h1>
          {description && <p className="max-w-2xl text-sm text-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
