import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User, Settings, Heart, Briefcase, Star, Bell, Shield,
  LogOut, ChevronRight, Palette, Globe, Building, Sparkles
} from 'lucide-react'
import { api, session } from '../lib/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  const user = session.user || { name: 'Guest', email: '' }

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
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', href: '/app/profile', desc: 'Manage your profile information' },
        { icon: Sparkles, label: 'Interests', href: '/app/profile/interests', desc: 'Set your service preferences' },
        { icon: Settings, label: 'Preferences', href: '/app/profile/preferences', desc: 'Language, currency, notifications' }
      ]
    },
    {
      title: 'My Activity',
      items: [
        { icon: Heart, label: 'Saved Services', href: '/app/saved', desc: `${saved.length} saved items` },
        { icon: Briefcase, label: 'Orders', href: '/app/orders', desc: 'View and manage orders' },
        { icon: Star, label: 'Reviews', href: '#', desc: 'Your reviews and ratings' }
      ]
    },
    {
      title: 'Freelancing',
      items: [
        { icon: Building, label: 'Become a Seller', href: '/app/become-seller', desc: 'Start selling your services' }
      ]
    }
  ]

  function logout() {
    session.token = null
    session.user = null
    window.location.href = '/auth/login'
  }

  return (
    <div className="profile-layout">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-avatar">
          {user.name?.[0]?.toUpperCase() || 'G'}
        </div>
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-role">{user.role === 'seller' ? 'Freelancer' : 'Client'}</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</p>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{saved.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saved</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>0</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Orders</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>0</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reviews</div>
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '24px' }} onClick={logout}>
          <LogOut size={16} />
          Sign Out
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
              <h2>Saved Services</h2>
              <Link to="/app/saved" className="btn btn-ghost btn-sm">View All</Link>
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