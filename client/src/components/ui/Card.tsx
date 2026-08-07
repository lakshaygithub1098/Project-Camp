import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover elevation, for cards that act as links. */
  interactive?: boolean
}

export function Card({ interactive, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface shadow-card',
        interactive && 'transition-shadow hover:border-border-strong hover:shadow-card-hover',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-border p-5', className)}>
      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-sm font-semibold text-fg">{title}</h3>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-border p-4', className)}
      {...props}
    />
  )
}
