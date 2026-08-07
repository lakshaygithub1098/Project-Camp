import { useState } from 'react'
import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

type Size = 'xs' | 'sm' | 'md' | 'lg'

const SIZES: Record<Size, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
}

interface AvatarProps {
  name: string
  src?: string
  size?: Size
  className?: string
}

/**
 * The backend seeds every user with a placehold.co URL, which fails offline.
 * On error we fall back to initials rather than showing a broken image.
 */
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'border border-border bg-brand-subtle font-medium text-brand select-none',
        SIZES[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
      {!showImage && <span className="sr-only">{name}</span>}
    </span>
  )
}

/** Overlapping avatar row with a "+N" overflow chip. */
export function AvatarGroup({
  people,
  max = 4,
  size = 'sm',
}: {
  people: { name: string; src?: string }[]
  max?: number
  size?: Size
}) {
  const visible = people.slice(0, max)
  const overflow = people.length - visible.length

  return (
    <div className="flex items-center">
      {visible.map((person, index) => (
        <Avatar
          key={`${person.name}-${index}`}
          name={person.name}
          src={person.src}
          size={size}
          className={cn('ring-2 ring-surface', index > 0 && '-ml-2')}
        />
      ))}

      {overflow > 0 && (
        <span
          className={cn(
            '-ml-2 inline-flex items-center justify-center rounded-full',
            'border border-border bg-elevated font-medium text-muted ring-2 ring-surface',
            SIZES[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  )
}
