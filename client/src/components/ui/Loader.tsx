import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Loader({
  className,
  label = 'Loading',
}: {
  className?: string
  label?: string
}) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2', className)}>
      <Loader2 className="h-4 w-4 animate-spin text-muted" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  )
}

/** Centered loader for route-level and panel-level waits. */
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
        <p className="text-sm text-muted">{label}…</p>
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden />
}

/** Card-shaped placeholder used by the project and note grids. */
export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-surface">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
