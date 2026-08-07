import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, rows = 4, ...props },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-fg">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg',
          'placeholder:text-subtle transition-colors',
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className,
        )}
        {...props}
      />

      {error ? (
        <p id={`${textareaId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
