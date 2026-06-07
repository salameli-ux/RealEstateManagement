import { createContext, useContext, useEffect, useState } from 'react'
import { fetchCurrentUser, login as apiLogin } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
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

  const logout = () => {
    window.localStorage.removeItem('authToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
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
