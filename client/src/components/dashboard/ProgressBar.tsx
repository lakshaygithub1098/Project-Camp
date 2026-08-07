import { cn } from '@/lib/cn'

/** Thin progress bar used for completion percentages. */
export function ProgressBar({
  value,
  total,
  className,
  label,
}: {
  value: number
  total: number
  className?: string
  label?: string
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">{label}</span>
          <span className="font-medium text-fg">{percent}%</span>
        </div>
      )}

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-elevated"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
