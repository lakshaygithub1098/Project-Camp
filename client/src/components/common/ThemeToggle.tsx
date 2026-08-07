import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemePreference } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

/** Segmented light/dark/system control used on the Settings page. */
export function ThemeToggle({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn('inline-flex rounded-lg border border-border bg-elevated p-0.5', className)}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = preference === value

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setPreference(value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              isActive ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg',
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        )
      })}
    </div>
  )
}

/** Compact single-button variant for the top bar. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg',
        className,
      )}
    >
      {resolved === 'dark' ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  )
}
