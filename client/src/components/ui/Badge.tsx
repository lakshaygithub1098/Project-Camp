import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL, ROLE_LABEL } from '@/lib/constants'
import { TaskPriority, TaskStatus, UserRole } from '@/types'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const TONES: Record<Tone, string> = {
  neutral: 'bg-elevated text-muted border-border',
  brand: 'bg-brand-subtle text-brand border-brand/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  /** Shows a small leading dot, useful for status. */
  withDot?: boolean
  children: ReactNode
}

export function Badge({ tone = 'neutral', withDot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5',
        'text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {withDot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}

const STATUS_TONE: Record<TaskStatus, Tone> = {
  [TaskStatus.TODO]: 'neutral',
  [TaskStatus.IN_PROGRESS]: 'info',
  [TaskStatus.DONE]: 'success',
}

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <Badge tone={STATUS_TONE[status]} withDot className={className}>
      {TASK_STATUS_LABEL[status]}
    </Badge>
  )
}

const PRIORITY_TONE: Record<TaskPriority, Tone> = {
  [TaskPriority.LOW]: 'neutral',
  [TaskPriority.MEDIUM]: 'warning',
  [TaskPriority.HIGH]: 'danger',
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority?: TaskPriority
  className?: string
}) {
  if (!priority) return null
  return (
    <Badge tone={PRIORITY_TONE[priority]} className={className}>
      {TASK_PRIORITY_LABEL[priority]}
    </Badge>
  )
}

const ROLE_TONE: Record<UserRole, Tone> = {
  [UserRole.ADMIN]: 'brand',
  [UserRole.PROJECT_ADMIN]: 'info',
  [UserRole.MEMBER]: 'neutral',
}

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return (
    <Badge tone={ROLE_TONE[role]} className={className}>
      {ROLE_LABEL[role]}
    </Badge>
  )
}
