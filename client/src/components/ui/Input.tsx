import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  /** Rendered inside the field on the right, e.g. a password reveal toggle. */
  rightSlot?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightSlot, className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-fg">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
            aria-hidden
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg',
            'placeholder:text-subtle transition-colors',
            'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
            'disabled:cursor-not-allowed disabled:opacity-60',
            leftIcon && 'pl-9',
            rightSlot && 'pr-10',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className,
          )}
          {...props}
        />

        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
