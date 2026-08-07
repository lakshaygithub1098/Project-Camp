import { format, formatDistanceToNowStrict, isPast, isToday, isTomorrow, parseISO } from 'date-fns'

function toDate(value: string | Date): Date | null {
  const date = typeof value === 'string' ? parseISO(value) : value
  return Number.isNaN(date.getTime()) ? null : date
}

/** "12 Mar 2025" */
export function formatDate(value?: string | Date | null): string {
  if (!value) return '—'
  const date = toDate(value)
  return date ? format(date, 'd MMM yyyy') : '—'
}

/** "12 Mar 2025, 14:30" */
export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—'
  const date = toDate(value)
  return date ? format(date, "d MMM yyyy, HH:mm") : '—'
}

/** "3 days ago" */
export function formatRelative(value?: string | Date | null): string {
  if (!value) return '—'
  const date = toDate(value)
  if (!date) return '—'
  return `${formatDistanceToNowStrict(date)} ago`
}

/** Human due-date label: "Today", "Tomorrow", "Overdue", or a date. */
export function formatDueDate(value?: string | Date | null): {
  label: string
  tone: 'danger' | 'warning' | 'muted'
} {
  if (!value) return { label: 'No due date', tone: 'muted' }
  const date = toDate(value)
  if (!date) return { label: 'No due date', tone: 'muted' }

  if (isToday(date)) return { label: 'Due today', tone: 'warning' }
  if (isTomorrow(date)) return { label: 'Due tomorrow', tone: 'warning' }
  if (isPast(date)) return { label: `Overdue — ${formatDate(date)}`, tone: 'danger' }
  return { label: `Due ${formatDate(date)}`, tone: 'muted' }
}

/** Format a date for an `<input type="date">` value. */
export function toDateInputValue(value?: string | Date | null): string {
  if (!value) return ''
  const date = toDate(value)
  return date ? format(date, 'yyyy-MM-dd') : ''
}

/** True when a due date has passed. Status is checked by the caller. */
export function isOverdue(value?: string | Date | null): boolean {
  if (!value) return false
  const date = toDate(value)
  return date ? isPast(date) && !isToday(date) : false
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes < 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / Math.pow(1024, exponent)
  return `${size.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

/** Display name with sensible fallbacks across the app. */
export function displayName(user?: {
  fullName?: string
  username?: string
  email?: string
} | null): string {
  if (!user) return 'Unassigned'
  return user.fullName?.trim() || user.username || user.email || 'Unknown user'
}

/** Up to two initials for avatar fallbacks. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
