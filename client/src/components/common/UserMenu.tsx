import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui'
import { displayName } from '@/lib/format'
import { cn } from '@/lib/cn'

/** Avatar button that opens an account menu. */
export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!isOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  if (!user) return null

  const name = displayName(user)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await logout()
    // logout() clears state; navigate so the guard does not flash a redirect.
    navigate('/login', { replace: true })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-elevated"
      >
        <Avatar name={name} src={user.avatar?.url} size="sm" />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-fg sm:block">
          {name}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-subtle transition-transform', isOpen && 'rotate-180')}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 animate-scale-in overflow-hidden rounded-xl border border-border bg-surface shadow-pop"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium text-fg">{name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            {!user.isEmailVerified && (
              <p className="mt-1.5 text-xs text-warning">Email not verified</p>
            )}
          </div>

          <div className="p-1.5">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
            >
              <UserIcon className="h-4 w-4" aria-hidden />
              Your profile
            </Link>
            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
            >
              <Settings className="h-4 w-4" aria-hidden />
              Settings
            </Link>
          </div>

          <div className="border-t border-border p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
