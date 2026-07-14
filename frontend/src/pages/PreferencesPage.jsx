import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, Bell, Shield, Check, ChevronLeft } from 'lucide-react'
import { api } from '../lib/api'

const languages = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'en', label: 'English' }
]

const currencies = [
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'USD', label: 'USD - US Dollar' }
]

export default function PreferencesPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    notifications: true,
    privacy: 'standard',
    language: 'id',
    currency: 'IDR'
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.profile()
      .then(res => {
        if (res?.preferences) {
          setForm(prev => ({ ...prev, ...res.preferences }))
        }
      })
      .catch(console.error)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.updatePreferences(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/app/profile" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ChevronLeft size={18} />
        Back to Profile
      </Link>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Preferences</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Customize your Remotiva experience</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-section" style={{ marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Globe size={20} style={{ color: 'var(--primary)' }} />
            Language & Region
          </h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {currencies.map(cur => (
                  <option key={cur.value} value={cur.value}>{cur.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="profile-section" style={{ marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={20} style={{ color: 'var(--primary)' }} />
            Notifications
          </h2>
          <div className="toggle-row" style={{ padding: '16px 0' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Email Notifications</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive updates about your orders and messages</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
              <input
                type="checkbox"
                checked={form.notifications}
                onChange={(e) => setForm({ ...form, notifications: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                inset: 0,
                background: form.notifications ? 'var(--primary)' : 'var(--border)',
                borderRadius: '28px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '22px',
                  width: '22px',
                  left: form.notifications ? '26px' : '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s'
                }} />
              </span>
            </label>
          </div>
        </div>

        <div className="profile-section" style={{ marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={20} style={{ color: 'var(--primary)' }} />
            Privacy
          </h2>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Privacy Level</label>
            <select
              value={form.privacy}
              onChange={(e) => setForm({ ...form, privacy: e.target.value })}
            >
              <option value="standard">Standard</option>
              <option value="high">High Privacy</option>
              <option value="public">Public Profile</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600 }}>
              <Check size={18} />
              Preferences saved!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}