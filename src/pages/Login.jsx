import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <span>🏢</span>
          <div>
            <h1>RealEstate Pulse</h1>
            <p>Secure access to your property portfolio and analytics.</p>
          </div>
        </div>

        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to continue managing properties, tenants and reports.</p>

          <div className="form-grid">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="demo-info">
            Demo account: admin@example.com / 123456
          </p>
        </div>
      </div>
    </div>
  )
}
