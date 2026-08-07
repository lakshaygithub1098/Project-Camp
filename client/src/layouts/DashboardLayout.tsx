import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Sidebar } from '@/components/common/Sidebar'
import { UserMenu } from '@/components/common/UserMenu'
import { ThemeToggleButton } from '@/components/common/ThemeToggle'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { VerifyEmailBanner } from '@/components/common/VerifyEmailBanner'
import { Button } from '@/components/ui'

/** Sidebar + topbar shell for every authenticated page. */
export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-full bg-bg">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>

          <div className="flex-1" />

          <ThemeToggleButton />
          <UserMenu />
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <VerifyEmailBanner />
          {/* Keyed by path so a crash on one page clears when the user navigates. */}
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
