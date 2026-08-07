import { request } from '@/lib/http'
import { endpoints } from './endpoints'
import type { User } from '@/types'

export interface RegisterPayload {
  email: string
  username: string
  password: string
  fullName?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResult {
  user: User
  accessToken: string
  refreshToken: string
}

export const authService = {
  register(payload: RegisterPayload) {
    return request<{ user: User }>({
      method: 'POST',
      url: endpoints.auth.register,
      data: payload,
    })
  },

  login(payload: LoginPayload) {
    return request<LoginResult>({
      method: 'POST',
      url: endpoints.auth.login,
      data: payload,
    })
  },

  logout() {
    return request<Record<string, never>>({ method: 'POST', url: endpoints.auth.logout })
  },

  /** POST, not GET — see endpoints.auth.currentUser. */
  getCurrentUser() {
    return request<User>({ method: 'POST', url: endpoints.auth.currentUser })
  },

  changePassword(payload: { oldPassword: string; newPassword: string }) {
    return request<Record<string, never>>({
      method: 'POST',
      url: endpoints.auth.changePassword,
      data: payload,
    })
  },

  verifyEmail(verificationToken: string) {
    return request<{ isEmailVerified: boolean }>({
      method: 'GET',
      url: endpoints.auth.verifyEmail(verificationToken),
    })
  },

  resendEmailVerification() {
    return request<Record<string, never>>({
      method: 'POST',
      url: endpoints.auth.resendEmailVerification,
    })
  },

  forgotPassword(email: string) {
    return request<Record<string, never>>({
      method: 'POST',
      url: endpoints.auth.forgotPassword,
      data: { email },
    })
  },

  resetPassword(resetToken: string, newPassword: string) {
    return request<Record<string, never>>({
      method: 'POST',
      url: endpoints.auth.resetPassword(resetToken),
      data: { newPassword },
    })
  },

  /**
   * No backend route exists for this yet. Kept here so the Profile form has a
   * real seam to call; it will 404 until the endpoint is added.
   */
  updateProfile(payload: { fullName?: string; email?: string }) {
    return request<User>({
      method: 'PATCH',
      url: endpoints.auth.updateProfile,
      data: payload,
    })
  },
}
