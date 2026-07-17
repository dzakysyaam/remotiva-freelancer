import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api, session } from '../lib/api'
import { Logo } from '../components/brand'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'fery@remotiva.id', password: 'password' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.login(form)
      session.token = res.token
      session.user = res.user
      navigate('/app')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Left side - Visual Panel with Account Asset */}
      <div className="auth-left">
        <div className="auth-brand">
          <Logo variant="inverse" size="md" />
        </div>
        <div className="auth-left-content">
          <h1>Welcome back to Remotiva</h1>
          <p>Sign in to access thousands of talented freelancers and find the perfect match for your project.</p>
        </div>
        {/* Visual illustration using account asset */}
        <div className="auth-visual">
          <img
            src="/assets/account.jpg"
            alt="Account management"
            className="auth-image"
          />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Sign in</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/auth/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
