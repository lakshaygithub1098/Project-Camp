import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/**
 * Thin wrappers over semantic table elements. The horizontal scroll container
 * keeps wide tables usable on small screens without breaking the layout.
 */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('scrollbar-thin overflow-x-auto rounded-xl border border-border', className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-elevated">
      <tr className="border-b border-border text-left">{children}</tr>
    </thead>
  )
}

export function TH({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border bg-surface">{children}</tbody>
}

export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn('transition-colors hover:bg-elevated/60', className)}>{children}</tr>
}

export function TD({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 align-middle text-fg', className)} {...props}>
      {children}
    </td>
  )
}
