import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

type Size = 'sm' | 'md' | 'lg'

const SIZES: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  size?: Size
  children: ReactNode
  footer?: ReactNode
  /** Set false to force an explicit action, e.g. during a submit. */
  closeOnOverlayClick?: boolean
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnOverlayClick = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Keep focus inside the dialog: Escape closes, Tab cycles.
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null)

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    // Prevent the page behind the overlay from scrolling.
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown, true)

    // Focus the first field so keyboard users land inside the dialog.
    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      target?.focus()
    }, 0)

    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKeyDown, true)
      window.clearTimeout(focusTimer)
      previouslyFocused.current?.focus?.()
    }
  }, [isOpen, onKeyDown])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col animate-scale-in',
          'rounded-t-2xl border border-border bg-surface shadow-pop sm:rounded-2xl',
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0 space-y-1">
            <h2 id="modal-title" className="text-base font-semibold text-fg">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-muted">
                {description}
              </p>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border p-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
