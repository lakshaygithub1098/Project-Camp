import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authService, type LoginPayload, type RegisterPayload } from '@/services'
import { tokenStorage } from '@/lib/token-storage'
import { UNAUTHORIZED_EVENT } from '@/lib/http'
import { normalizeApiError } from '@/lib/api-error'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  /** True until the initial session check settles, so guards can wait. */
  isInitializing: boolean
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<User>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  /** Refetch the current user, e.g. after a profile update. */
  refresh: () => Promise<void>
  setUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const queryClient = useQueryClient()

  // Guards against a "session expired" toast firing on every parallel 401.
  const hasWarnedRef = useRef(false)

  const clearSession = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const loadCurrentUser = useCallback(async () => {
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      setUser(null)
      return
    }

    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      hasWarnedRef.current = false
    } catch {
      // The http interceptor already tried to refresh; reaching here means the
      // session is genuinely gone.
      clearSession()
    }
  }, [clearSession])

  // Restore the session on first mount.
  useEffect(() => {
    let cancelled = false

    void (async () => {
      await loadCurrentUser()
      if (!cancelled) setIsInitializing(false)
    })()

    return () => {
      cancelled = true
    }
  }, [loadCurrentUser])

  // The Axios interceptor emits this when a refresh attempt fails.
  useEffect(() => {
    const onUnauthorized = () => {
      if (!hasWarnedRef.current) {
        hasWarnedRef.current = true
        toast.error('Your session has expired. Please sign in again.')
      }
      clearSession()
    }

    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [clearSession])

  // Keep tabs in sync: signing out in one tab signs out the others.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key.startsWith('projectcamp.')) {
        void loadCurrentUser()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [loadCurrentUser])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authService.login(payload)
      tokenStorage.set(result.accessToken, result.refreshToken)
      setUser(result.user)
      hasWarnedRef.current = false
      return result.user
    },
    [],
  )

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      // A failed logout call should not strand the user in a signed-in UI —
      // clearing local state below is what actually ends the session here.
      const { isNetworkError } = normalizeApiError(error)
      if (isNetworkError) toast.error('Signed out locally — the server was unreachable.')
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refresh: loadCurrentUser,
      setUser,
    }),
    [user, isInitializing, login, register, logout, loadCurrentUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
