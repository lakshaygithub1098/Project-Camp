/**
 * Every backend handler wraps its payload in an ApiResponse envelope, so all
 * successful responses share this shape.
 */
export interface ApiResponse<T> {
  statusCode: number
  data: T
  message: string
  success: boolean
}

/** Error envelope produced by the backend's ApiError class. */
export interface ApiErrorBody {
  statusCode: number
  message: string
  success: false
  errors?: ApiFieldError[]
  data?: null
}

/**
 * The validator middleware maps express-validator results into objects keyed by
 * field name, e.g. `{ email: "Email is invalid" }`.
 */
export type ApiFieldError = Record<string, string>

/** Normalized error the UI layer works with, regardless of failure mode. */
export interface NormalizedApiError {
  status: number
  message: string
  /** Flattened field -> message map, suitable for react-hook-form setError. */
  fieldErrors: Record<string, string>
  /** True when the request never reached the server (offline, CORS, DNS). */
  isNetworkError: boolean
}
