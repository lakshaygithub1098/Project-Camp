import axios from 'axios'
import type { ApiErrorBody, NormalizedApiError } from '@/types'

/**
 * Turn anything thrown by Axios into a predictable shape.
 *
 * Worth noting: the backend has no global error handler mounted, so thrown
 * ApiErrors currently arrive as Express's default HTML error page rather than
 * JSON. The HTML branch below keeps the UI showing a sane message when that
 * happens instead of leaking markup into a toast.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return {
        status: 0,
        message:
          error.code === 'ECONNABORTED'
            ? 'The request timed out. Please try again.'
            : 'Cannot reach the server. Check your connection and try again.',
        fieldErrors: {},
        isNetworkError: true,
      }
    }

    const { status, data } = error.response
    const isJsonBody = data && typeof data === 'object'

    return {
      status,
      message: isJsonBody
        ? (data.message || fallbackMessage(status))
        : fallbackMessage(status),
      fieldErrors: isJsonBody ? flattenFieldErrors(data.errors) : {},
      isNetworkError: false,
    }
  }

  if (error instanceof Error) {
    return { status: 0, message: error.message, fieldErrors: {}, isNetworkError: false }
  }

  return {
    status: 0,
    message: 'Something went wrong. Please try again.',
    fieldErrors: {},
    isNetworkError: false,
  }
}

/**
 * The validator middleware returns `errors: [{ email: "Email is invalid" }]`.
 * Collapse that array of single-key objects into one map.
 */
function flattenFieldErrors(errors: ApiErrorBody['errors']): Record<string, string> {
  if (!Array.isArray(errors)) return {}

  return errors.reduce<Record<string, string>>((acc, entry) => {
    if (entry && typeof entry === 'object') {
      for (const [field, message] of Object.entries(entry)) {
        if (typeof message === 'string') acc[field] = message
      }
    }
    return acc
  }, {})
}

function fallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return 'That request was not valid. Please review the form and try again.'
    case 401:
      return 'Your session has expired. Please sign in again.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return 'We could not find what you were looking for.'
    case 409:
      return 'That already exists.'
    case 413:
      return 'The file you selected is too large.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    default:
      return status >= 500
        ? 'The server ran into a problem. Please try again shortly.'
        : 'Something went wrong. Please try again.'
  }
}

/** True when a resource is genuinely absent or the endpoint is not mounted. */
export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404
}
