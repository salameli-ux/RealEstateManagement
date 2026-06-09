const SESSION_KEY = 'authSession'

export function readSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSession(session) {
  if (typeof window === 'undefined') return
  if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else window.localStorage.removeItem(SESSION_KEY)
}
