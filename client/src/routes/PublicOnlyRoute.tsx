import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui'

/**
 * For login/register and similar. A signed-in user landing here is sent to the
 * dashboard instead of being shown a second login form.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
