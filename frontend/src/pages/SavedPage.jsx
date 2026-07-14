import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Trash2 } from 'lucide-react'
import { api } from '../lib/api'

export default function SavedPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.saved()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleRemove(id) {
    try {
      await api.unsave(id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('Failed to remove:', err)
    }
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1>Saved Services</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your favorite services in one place</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading saved services...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Heart size={48} />
          </div>
          <h2>No saved services yet</h2>
          <p>Save services you like to compare them later and easily find them again.</p>
          <Link to="/app/search" className="btn btn-primary">Explore Services</Link>
        </div>
      ) : (
        <div className="services-grid">
          {items.map(item => (
            <div key={item.id} className="service-card" style={{ position: 'relative' }}>
              <button
                onClick={() => handleRemove(item.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '36px',
                  height: '36px',
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  cursor: 'pointer',
                  border: 'none',
                  color: 'var(--text-secondary)'
                }}
              >
                <Trash2 size={16} />
              </button>
              <Link to={`/app/services/${item.id}`} style={{ display: 'block' }}>
                <div className="service-image">
                  <img src={item.image_url || '/assets/home-2.jpg'} alt={item.title} />
                </div>
                <div className="service-content">
                  <div className="service-seller">
                    <div className="service-avatar">
                      {item.seller_name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div className="service-seller-info">
                      <div className="service-seller-name">{item.seller_name}</div>
                      <div className="service-seller-level">{item.seller_level}</div>
                    </div>
                    <div className="service-rating">
                      <Star size={14} fill="currentColor" />
                      {Number(item.rating || 0).toFixed(1)}
                    </div>
                  </div>
                  <h3 className="service-title">{item.title}</h3>
                  <div className="service-footer">
                    <div>
                      <div className="service-price-label">Starting at</div>
                      <div className="service-price">Rp{Number(item.price || 0).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}