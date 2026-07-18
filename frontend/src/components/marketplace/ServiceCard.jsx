import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Clock } from 'lucide-react'
import { api } from '../../lib/api'
import { getGigThumbnail, fallbackThumbnail } from '../../data/gigVisuals'

export function ServiceCard({ item, showSave = true }) {
  const reviewCount = Math.floor(Math.random() * 200 + 50)
  const thumbnail = getGigThumbnail(item)
  const [imgError, setImgError] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    e.stopPropagation()
    try { await api.save(item.id) } catch (err) { console.error('Failed to save service') }
  }

  const getSellerBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'top rated': return { class: 'badge-top-rated', label: 'Top Rated' }
      case 'level 2': return { class: 'badge-level-2', label: 'Level 2' }
      case 'level 1': return { class: 'badge-level-1', label: 'Level 1' }
      default: return null
    }
  }

  const badge = getSellerBadge(item.seller_level)

  return (
    <Link to={`/app/services/${item.id}`} className="gig-card">
      <div className="gig-card-image">
        <img
          src={imgError ? fallbackThumbnail : thumbnail}
          alt={item.title}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        {showSave && (
          <button className={`gig-card-save ${item.saved ? 'saved' : ''}`} onClick={handleSave}>
            <Heart size={20} fill={item.saved ? 'currentColor' : 'none'} />
          </button>
        )}
        {item.is_featured && <div className="gig-card-badge">FEATURED</div>}
      </div>
      <div className="gig-card-content">
        <div className="gig-card-seller">
          <div className="gig-card-seller-avatar">{item.seller_name?.[0]?.toUpperCase() || 'S'}</div>
          <div className="gig-card-seller-info">
            <div className="gig-card-seller-top">
              <span className="gig-card-seller-name">{item.seller_name}</span>
              {badge && <span className={`gig-seller-badge ${badge.class}`}>{badge.label}</span>}
            </div>
          </div>
        </div>
        <h3 className="gig-card-title">{item.title}</h3>
        <div className="gig-card-rating">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span className="rating-value">{Number(item.rating || 0).toFixed(1)}</span>
          <span className="rating-count">({reviewCount})</span>
        </div>
        <div className="gig-card-footer">
          <div className="gig-card-price">
            <span className="price-label">From</span>
            <span className="price-value">Rp{Number(item.price || 0).toLocaleString('id-ID')}</span>
          </div>
          {item.delivery_days && (
            <div className="gig-card-delivery"><Clock size={14} /><span>{item.delivery_days}d</span></div>
          )}
        </div>
      </div>
    </Link>
  )
}

export function GigCard(props) { return <ServiceCard {...props} /> }

export function GigCardList({ item, showSave = true }) {
  const thumbnail = getGigThumbnail(item)
  const [imgError, setImgError] = useState(false)
  return (
    <Link to={`/app/services/${item.id}`} className="gig-card-list">
      <div className="gig-card-list-image">
        <img
          src={imgError ? fallbackThumbnail : thumbnail}
          alt={item.title}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="gig-card-list-content">
        <div className="gig-card-seller-inline">
          <div className="gig-card-seller-avatar-sm">{item.seller_name?.[0]?.toUpperCase() || 'S'}</div>
          <span className="gig-card-seller-name">{item.seller_name}</span>
        </div>
        <h3 className="gig-card-title">{item.title}</h3>
        <div className="gig-card-rating">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span className="rating-value">{Number(item.rating || 0).toFixed(1)}</span>
        </div>
      </div>
      <div className="gig-card-list-footer">
        <div className="gig-card-price">
          <span className="price-label">From</span>
          <span className="price-value">Rp{Number(item.price || 0).toLocaleString('id-ID')}</span>
        </div>
        <div className="gig-card-delivery"><Clock size={14} /><span>{item.delivery_days || 3}d delivery</span></div>
        {showSave && (
          <button className="gig-card-list-save" onClick={(e) => { e.preventDefault(); api.save(item.id).catch(console.error) }}>
            <Heart size={18} />
          </button>
        )}
      </div>
    </Link>
  )
}

export function CategoryCard() { return null }
