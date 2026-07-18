import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api, session } from '../lib/api'
import { Logo } from '../components/brand'
import AuthMascot from '../components/auth/AuthMascot'
import { auth } from '../data/uiCopy'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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

      // Redirect based on role
      if (res.user.role === 'buyer') {
        navigate('/app/buyer')
      } else if (res.user.role === 'seller') {
        navigate('/app/seller')
      } else if (res.user.role === 'admin') {
        navigate('/app/admin')
      } else {
        navigate('/app')
      }
    } catch (err) {
      setError(err.message || 'Email atau kata sandi tidak sesuai')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-hero">
        <div className="auth-hero-bg">
          <div className="auth-bg-orb auth-bg-orb-1" />
          <div className="auth-bg-orb auth-bg-orb-2" />
        </div>
        <div className="auth-hero-inner">
          <div className="auth-hero-logo">
            <Logo size="xl" variant="inverse" />
          </div>
          <div className="auth-hero-content">
            <h1>Wujudkan karir freelance Anda bersama Remotiva</h1>
            <p>Temukan project, bangun reputasi, dan kelola pekerjaan Anda di satu tempat</p>
          </div>
          <AuthMascot />
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2>{auth.loginTitle}</h2>
            <p>{auth.loginSubtitle}</p>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">{auth.email}</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{auth.password}</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan kata sandi"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
              {loading ? auth.loading : auth.loginButton}
            </button>
          </form>

          <div className="auth-footer">
            <span>{auth.dontHaveAccount}</span>
            <Link to="/auth/register">{auth.createNow}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
