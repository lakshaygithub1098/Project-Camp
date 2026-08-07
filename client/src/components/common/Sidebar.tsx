import { NavLink } from 'react-router-dom'
import { FolderKanban, LayoutDashboard, NotebookPen, Settings, Users, X } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', Icon: FolderKanban },
  { to: '/members', label: 'Members', Icon: Users },
  { to: '/notes', label: 'Notes', Icon: NotebookPen },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

interface SidebarProps {
  /** Mobile drawer state; the sidebar is always visible from lg up. */
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface',
          'transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Logo to="/dashboard" />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-subtle text-brand'
                    : 'text-muted hover:bg-elevated hover:text-fg',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <p className="px-3 text-xs text-subtle">
            Roles are per project — your permissions can differ between them.
          </p>
        </div>
      </aside>
    </>
  )
}
