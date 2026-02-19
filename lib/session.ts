// helpers بسيطة للـ cookies عشان الجلسة تفضل محفوظة

const COOKIE_NAME = 'ramadan_user'
const DAYS = 30

export function saveSession(user: { id: string; name: string }) {
  const expires = new Date(Date.now() + DAYS * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(user))}; expires=${expires}; path=/; SameSite=Lax`
}

export function getSession(): { id: string; name: string } | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')))
  } catch {
    return null
  }
}

export function clearSession() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
