import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User, Settings, Heart, Briefcase, Star, Bell, Shield,
  LogOut, ChevronRight, Palette, Globe, Building, Sparkles
} from 'lucide-react'
import { api, session } from '../lib/api'
import { profile as profileCopy, formatRole, formatSavedCount } from '../data/uiCopy'
import { useLanguage } from '../i18n/LanguageContext'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  const user = session.user || { name: 'Tamu', email: '' }

  useEffect(() => {
    Promise.all([
      api.profile().catch(() => null),
      api.saved().catch(() => [])
    ])
      .then(([profileData, savedData]) => {
        if (profileData) setProfile(profileData)
        if (savedData) setSaved(savedData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const menuGroups = [
    {
      title: t("profile.account"),
      items: [
        { icon: User, label: t("profile.profile"), href: '/app/profile', desc: t("profile.profileDesc") },
        { icon: Sparkles, label: t("profile.interests"), href: '/app/profile/interests', desc: t("profile.servicePreferences") },
        { icon: Settings, label: t("profile.preferences"), href: '/app/profile/preferences', desc: t("profile.languageCurrencyNotifications") }
      ]
    },
    {
      title: t("profile.myActivity"),
      items: [
        { icon: Heart, label: t("profile.savedServices"), href: '/app/saved', desc: t("profile.savedItems").replace("{count}", saved.length) },
        { icon: Briefcase, label: t("profile.orders"), href: '/app/orders', desc: t("profile.orders") },
        { icon: Star, label: t("profile.reviews"), href: '#', desc: t("profile.reviews") }
      ]
    },
    {
      title: t("profile.freelancing"),
      items: [
        { icon: Building, label: t("profile.becomeSeller"), href: '/app/become-seller', desc: t("profile.becomeSellerDesc") }
      ]
    }
  ]

  function logout() {
    session.token = null
    session.user = null
    window.location.href = '/auth/login'
  }

  // Get role label for display
  const roleLabel = user.role === 'seller' ? t("profile.freelancer") : t("profile.client")

  return (
    <div className="profile-layout">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-avatar">
          {user.name?.[0]?.toUpperCase() || 'T'}
        </div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-role">{roleLabel}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</p>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{saved.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("profile.saved")}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>0</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("profile.orders")}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>0</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t("profile.reviews")}</div>
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '24px' }} onClick={logout}>
          <LogOut size={16} />
          {t("profile.signOut")}
        </button>
      </div>

      {/* Main Content */}
      <div className="profile-main">
        {menuGroups.map(group => (
          <div key={group.title} className="profile-section">
            <h2>{group.title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {group.items.map(item => (
                <Link key={item.label} to={item.href} className="profile-menu-item" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: 'var(--radius)', transition: 'background 0.2s' }}>
                  <item.icon size={20} style={{ color: 'var(--primary)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--muted)' }} />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Saved Services Preview */}
        {saved.length > 0 && (
          <div className="profile-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2>{t("profile.savedServicesPreview")}</h2>
              <Link to="/app/saved" className="btn btn-ghost btn-sm">{t("common.viewAll")}</Link>
            </div>
            <div className="saved-grid">
              {saved.slice(0, 4).map(item => (
                <div key={item.id} className="saved-item">
                  <img src={item.image_url || '/assets/home-2.jpg'} alt={item.title} />
                  <div className="saved-item-info">
                    <h4>{item.title}</h4>
                    <span>Rp{Number(item.price || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
