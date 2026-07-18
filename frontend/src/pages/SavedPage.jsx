import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { saved as savedCopy } from '../data/uiCopy'

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
        <h1>{savedCopy.title}</h1>
        <p>{savedCopy.subtitle}</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>{savedCopy.loading}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Heart size={32} />
          </div>
          <h2>{savedCopy.noSavedYet}</h2>
          <p>{savedCopy.noSavedDesc}</p>
          <Link to="/app/search" className="btn btn-primary">{savedCopy.exploreServices}</Link>
        </div>
      ) : (
        <div className="services-grid">
          {items.map(item => (
            <div key={item.id} className="gig-card" style={{ position: 'relative' }}>
              <button
                onClick={() => handleRemove(item.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '34px',
                  height: '34px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  cursor: 'pointer',
                  border: 'none',
                  color: '#e74c3c'
                }}
              >
                <Trash2 size={16} />
              </button>
              <Link to={`/app/services/${item.id}`} style={{ display: 'block' }}>
                <div className="gig-card-image">
                  <img src={item.image_url || '/assets/home-2.jpg'} alt={item.title} />
                </div>
                <div className="gig-card-content">
                  <div className="gig-card-seller">
                    <div className="gig-card-seller-avatar">
                      {item.seller_name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div className="gig-card-seller-info">
                      <span className="gig-card-seller-name">{item.seller_name}</span>
                      <span className="gig-card-seller-level">{item.seller_level}</span>
                    </div>
                  </div>
                  <h3 className="gig-card-title">{item.title}</h3>
                  <div className="gig-card-rating">
                    <Star size={14} fill="#ffb800" color="#ffb800" />
                    <span className="rating-value">{Number(item.rating || 0).toFixed(1)}</span>
                    <span className="rating-count">(99)</span>
                  </div>
                  <div className="gig-card-footer">
                    <div className="gig-card-price">
                      <span className="price-label">{savedCopy.from}</span>
                      <span className="price-value">Rp{Number(item.price || 0).toLocaleString('id-ID')}</span>
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
