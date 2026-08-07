import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_BASE_URL } from './constants'
import { tokenStorage } from './token-storage'

/** Fired when the session cannot be recovered; AuthProvider listens for this. */
export const UNAUTHORIZED_EVENT = 'projectcamp:unauthorized'

/** Endpoints that must never trigger a token refresh on 401. */
const AUTH_FREE_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Sent so the backend's httpOnly cookies work too once it serves over https.
  withCredentials: true,
  timeout: 20_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// A single in-flight refresh shared by every request that 401s concurrently,
// so a page with six parallel queries refreshes once rather than six times.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken()

  // A bare axios call avoids re-entering this interceptor.
  const { data } = await axios.post(
    `${API_BASE_URL}/auth/refresh-token`,
    refreshToken ? { refreshToken } : {},
    { withCredentials: true, timeout: 20_000 },
  )

  const accessToken: string | undefined = data?.data?.accessToken
  const newRefreshToken: string | undefined = data?.data?.refreshToken
  if (!accessToken) throw new Error('Refresh response did not include an access token')

  tokenStorage.set(accessToken, newRefreshToken)
  return accessToken
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined

    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !AUTH_FREE_PATHS.some((path) => config.url?.includes(path))

    if (!shouldAttemptRefresh) return Promise.reject(error)

    config._retried = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const accessToken = await refreshPromise

      config.headers.Authorization = `Bearer ${accessToken}`
      return http(config)
    } catch {
      // Refresh failed: the session is unrecoverable.
      tokenStorage.clear()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
      return Promise.reject(error)
    }
  },
)

/** Unwrap the backend's `{ data }` envelope so services return payloads. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<{ data: T }>(config)
  return response.data?.data as T
}
