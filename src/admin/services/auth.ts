import type { AdminUser } from '../types'

const tokenKey = 'mits-admin-token'
const userKey = 'mits-admin-user'

export function getToken() {
  return sessionStorage.getItem(tokenKey)
}

export function getUser(): AdminUser | null {
  const stored = sessionStorage.getItem(userKey)
  if (!stored) return null

  try {
    return JSON.parse(stored) as AdminUser
  } catch {
    clearAuth()
    return null
  }
}

export function setAuth(token: string, user: AdminUser) {
  sessionStorage.setItem(tokenKey, token)
  sessionStorage.setItem(userKey, JSON.stringify(user))
}

export function clearAuth() {
  sessionStorage.removeItem(tokenKey)
  sessionStorage.removeItem(userKey)
}
