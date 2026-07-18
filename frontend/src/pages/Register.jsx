import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { api, session } from '../lib/api'
import { Logo } from '../components/brand'
import AuthMascot from '../components/auth/AuthMascot'
import { auth, roles } from '../data/uiCopy'

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
      setError(auth.passwordMinChars)
      return
    }

    setLoading(true)
    try {
      const res = await api.register(form)
      session.token = res.token
      session.user = res.user

      // Redirect based on role after registration
      if (res.user.role === 'buyer') {
        navigate('/app/buyer')
      } else if (res.user.role === 'seller') {
        navigate('/app/seller')
      } else {
        navigate('/app')
      }
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.')
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
            <h2>{auth.registerTitle}</h2>
            <p>{auth.registerSubtitle}</p>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="name">{auth.fullName}</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
                autoComplete="name"
              />
            </div>

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
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  autoComplete="new-password"
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

            <div className="form-group">
              <label htmlFor="role">{auth.registerAs}</label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="buyer">{roles.buyer}</option>
                <option value="seller">{roles.seller}</option>
              </select>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-auth" disabled={loading}>
              {loading ? 'Mendaftar...' : auth.registerButton}
            </button>

            <p className="auth-terms">
              {auth.termsText} <a href="#">{auth.termsOfService}</a> dan <a href="#">{auth.privacyPolicy}</a>.
            </p>
          </form>

          <div className="auth-footer">
            <span>{auth.alreadyHaveAccount}</span>
            <Link to="/auth/login">{auth.signInHere}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
