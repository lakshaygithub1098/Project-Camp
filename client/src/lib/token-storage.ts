import { STORAGE_KEYS } from './constants'

/**
 * Token storage.
 *
 * The backend sets httpOnly cookies *and* returns tokens in the JSON body. We
 * keep the tokens here and send them as `Authorization: Bearer`, because the
 * cookies are flagged `secure: true` and are therefore dropped by browsers on
 * plain http://localhost during development.
 *
 * localStorage is readable by any script on the origin, so this trades some XSS
 * hardening for a dev setup that works. Moving to cookie-only auth means
 * making the backend's cookie `secure` flag environment-aware.
 */
export const tokenStorage = {
  getAccessToken(): string | null {
    return safeGet(STORAGE_KEYS.accessToken)
  },

  getRefreshToken(): string | null {
    return safeGet(STORAGE_KEYS.refreshToken)
  },

  set(accessToken: string, refreshToken?: string) {
    safeSet(STORAGE_KEYS.accessToken, accessToken)
    if (refreshToken) safeSet(STORAGE_KEYS.refreshToken, refreshToken)
  },

  clear() {
    safeRemove(STORAGE_KEYS.accessToken)
    safeRemove(STORAGE_KEYS.refreshToken)
  },
}

// Storage access throws in private-browsing modes and when quota is exceeded,
// so every call is guarded.
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
