import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui'

/**
 * Gate for authenticated areas. Waits for the initial session check so a
 * signed-in user reloading a deep link is not bounced to the login page.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) return <PageLoader label="Checking your session" />

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
