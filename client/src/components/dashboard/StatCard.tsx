import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/components/ui'

type Tone = 'brand' | 'success' | 'warning' | 'info'

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-subtle text-brand',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
}

interface StatCardProps {
  label: string
  value: number | string
  Icon: LucideIcon
  tone?: Tone
  hint?: string
  isLoading?: boolean
}

export function StatCard({
  label,
  value,
  Icon,
  tone = 'brand',
  hint,
  isLoading = false,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted">{label}</p>

          {isLoading ? (
            <Skeleton className="mt-1.5 h-7 w-16" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight text-fg">{value}</p>
          )}

          {hint && !isLoading && <p className="text-xs text-subtle">{hint}</p>}
        </div>

        <span
          className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TONES[tone])}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}
