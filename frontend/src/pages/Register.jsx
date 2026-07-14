import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api, session } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await api.register(form)
      session.token = res.token
      session.user = res.user
      navigate('/app')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-brand">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="white"/>
            <path d="M8 16L14 22L24 10" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Remotiva
        </div>
        <div className="auth-left-content">
          <h1>Join thousands of professionals on Remotiva</h1>
          <p>Create your account today and start working with talented freelancers or showcase your skills to clients worldwide.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2>Create an account</h2>
          <p>Fill in your details to get started</p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>I want to</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="buyer">Find services and hire freelancers</option>
                <option value="seller">Offer my services as a freelancer</option>
              </select>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '16px', textAlign: 'center' }}>
              By creating an account, you agree to our <a href="#" style={{ color: 'var(--primary)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)' }}>Privacy Policy</a>.
            </p>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/auth/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}