import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

/**
 * Retrying a 401/403/404 just burns time before showing the same error, so
 * retries are limited to transient failures.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status && status >= 400 && status < 500) return false
  }

  return true
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
