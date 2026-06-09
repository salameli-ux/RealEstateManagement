import { createContext, useContext, useEffect, useState } from 'react'
import { fetchCurrentUser, login as apiLogin } from '../services/api'
import { readSession, writeSession } from './sessionStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(() => readSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = window.localStorage.getItem('authToken')
    if (!token) {
      setLoading(false)
      return
    }

    fetchCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => {
        window.localStorage.removeItem('authToken')
        setUser(null)
        writeSession(null)
        setSession(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    setError(null)
    const response = await apiLogin(email, password)
    window.localStorage.setItem('authToken', response.token)
    setUser(response.user)
    return response.user
  }

  const signInAs = async ({ role, entityId, displayName }) => {
    await login('admin@example.com', '123456')
    const nextSession = { role, entityId, displayName: displayName || '' }
    writeSession(nextSession)
    setSession(nextSession)
    return nextSession
  }

  const logout = () => {
    window.localStorage.removeItem('authToken')
    writeSession(null)
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, login, signInAs, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
