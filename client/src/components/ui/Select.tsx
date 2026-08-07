import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-fg">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9',
            'text-sm text-fg transition-colors',
            'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-danger focus:border-danger focus:ring-danger/30',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
          aria-hidden
        />
      </div>

      {error && (
        <p id={`${selectId}-error`} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  )
})
