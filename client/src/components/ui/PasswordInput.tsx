import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, type InputProps } from './Input'

/** Password field with a reveal toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightSlot'>>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="rounded p-1.5 text-subtle transition-colors hover:text-fg"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        }
        {...props}
      />
    )
  },
)
