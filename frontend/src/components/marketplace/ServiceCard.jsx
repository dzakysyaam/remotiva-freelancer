import { Link } from 'react-router-dom'
import { Heart, Star, Clock, BadgeCheck, Award } from 'lucide-react'
import { api } from '../../lib/api'

export function ServiceCard({ item, showSave = true }) {
  async function handleSave(e) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.save(item.id)
    } catch (err) {
      console.error('Failed to save service')
    }
  }

  const reviewCount = Math.floor(Math.random() * 200 + 10)

  const getSellerBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'top rated':
        return { icon: Award, class: 'badge-top-rated', label: 'Top Rated' }
      case 'level 2':
        return { icon: BadgeCheck, class: 'badge-level-2', label: 'Level 2' }
      case 'level 1':
        return { icon: BadgeCheck, class: 'badge-level-1', label: 'Level 1' }
      case 'new seller':
        return { icon: null, class: 'badge-new', label: 'New Seller' }
      default:
        return null
    }
  }

  const badge = getSellerBadge(item.seller_level)

  return (
    <Link to={`/app/services/${item.id}`} className="gig-card">
      <div className="gig-card-image">
        <img
          src={item.image_url || '/assets/home-2.jpg'}
          alt={item.title}
          loading="lazy"
        />
        {showSave && (
          <button
            className={`gig-card-save ${item.saved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            <Heart size={16} fill={item.saved ? 'currentColor' : 'none'} />
          </button>
        )}
        {item.featured && (
          <div className="gig-card-badge">FEATURED</div>
        )}
      </div>

      <div className="gig-card-content">
        {/* Seller Info */}
        <div className="gig-card-seller">
          <div className="gig-card-seller-avatar">
            {item.seller_name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="gig-card-seller-info">
            <div className="gig-card-seller-top">
              <span className="gig-card-seller-name">{item.seller_name}</span>
              {badge && (
                <span className={`gig-seller-badge ${badge.class}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <span className="gig-card-seller-level">{item.seller_level}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="gig-card-title">{item.title}</h3>

        {/* Rating */}
        <div className="gig-card-rating">
          <Star size={14} fill="#ffb800" color="#ffb800" />
          <span className="rating-value">{Number(item.rating || 0).toFixed(1)}</span>
          <span className="rating-count">({reviewCount})</span>
        </div>

        {/* Footer */}
        <div className="gig-card-footer">
          <div className="gig-card-price">
            <span className="price-label">From</span>
            <span className="price-value">Rp{Number(item.price || 0).toLocaleString('id-ID')}</span>
          </div>
          {item.delivery_days && (
            <div className="gig-card-delivery">
              <Clock size={14} />
              <span>{item.delivery_days}d</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export function GigCard({ item, showSave = true }) {
  async function handleSave(e) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.save(item.id)
    } catch (err) {
      console.error('Failed to save service')
    }
  }

  const reviewCount = Math.floor(Math.random() * 200 + 10)

  const getSellerBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'top rated':
        return { icon: Award, class: 'badge-top-rated', label: 'Top Rated' }
      case 'level 2':
        return { icon: BadgeCheck, class: 'badge-level-2', label: 'Level 2' }
      case 'level 1':
        return { icon: BadgeCheck, class: 'badge-level-1', label: 'Level 1' }
      case 'new seller':
        return { icon: null, class: 'badge-new', label: 'New Seller' }
      default:
        return null
    }
  }

  const badge = getSellerBadge(item.seller_level)

  return (
    <Link to={`/app/services/${item.id}`} className="gig-card">
      <div className="gig-card-image">
        <img
          src={item.image_url || '/assets/home-2.jpg'}
          alt={item.title}
          loading="lazy"
        />
        {showSave && (
          <button
            className={`gig-card-save ${item.saved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            <Heart size={16} fill={item.saved ? 'currentColor' : 'none'} />
          </button>
        )}
        {item.featured && (
          <div className="gig-card-badge">FEATURED</div>
        )}
      </div>

      <div className="gig-card-content">
        {/* Seller Info */}
        <div className="gig-card-seller">
          <div className="gig-card-seller-avatar">
            {item.seller_name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="gig-card-seller-info">
            <div className="gig-card-seller-top">
              <span className="gig-card-seller-name">{item.seller_name}</span>
              {badge && (
                <span className={`gig-seller-badge ${badge.class}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <span className="gig-card-seller-level">{item.seller_level}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="gig-card-title">{item.title}</h3>

        {/* Rating */}
        <div className="gig-card-rating">
          <Star size={14} fill="#ffb800" color="#ffb800" />
          <span className="rating-value">{Number(item.rating || 0).toFixed(1)}</span>
          <span className="rating-count">({reviewCount})</span>
        </div>

        {/* Footer */}
        <div className="gig-card-footer">
          <div className="gig-card-price">
            <span className="price-label">From</span>
            <span className="price-value">Rp{Number(item.price || 0).toLocaleString('id-ID')}</span>
          </div>
          {item.delivery_days && (
            <div className="gig-card-delivery">
              <Clock size={14} />
              <span>{item.delivery_days}d</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export function CategoryCard({ category }) {
  const icons = {
    'desain-grafis': '🎨',
    'pemasaran-digital': '📢',
    'penulisan-terjemahan': '✍️',
    'video-animasi': '🎬',
    'pemrograman-teknologi': '💻',
    'data': '📊',
    'bisnis': '💼',
    'keuangan': '💰',
  }

  return (
    <Link to={`/app/categories/${category.slug}`} className="category-card-fiverr">
      <div className="category-card-icon">
        <span>{icons[category.slug] || '📁'}</span>
      </div>
      <h3>{category.name}</h3>
      <p>{category.description || `${category.name} services`}</p>
    </Link>
  )
}

// List View Card for Search Results
export function GigCardList({ item, showSave = true }) {
  const reviewCount = Math.floor(Math.random() * 200 + 10)

  return (
    <Link to={`/app/services/${item.id}`} className="gig-card-list">
      <div className="gig-card-list-image">
        <img src={item.image_url || '/assets/home-2.jpg'} alt={item.title} loading="lazy" />
      </div>
      <div className="gig-card-list-content">
        <div className="gig-card-seller-inline">
          <div className="gig-card-seller-avatar-sm">
            {item.seller_name?.[0]?.toUpperCase() || 'S'}
          </div>
          <span className="gig-card-seller-name">{item.seller_name}</span>
          <span className="gig-card-seller-level-inline">{item.seller_level}</span>
        </div>
        <h3 className="gig-card-title">{item.title}</h3>
        <div className="gig-card-rating">
          <Star size={14} fill="#ffb800" color="#ffb800" />
          <span className="rating-value">{Number(item.rating || 0).toFixed(1)}</span>
          <span className="rating-count">({reviewCount})</span>
        </div>
      </div>
      <div className="gig-card-list-footer">
        <div className="gig-card-price">
          <span className="price-label">From</span>
          <span className="price-value">Rp{Number(item.price || 0).toLocaleString('id-ID')}</span>
        </div>
        <div className="gig-card-delivery">
          <Clock size={14} />
          <span>{item.delivery_days || 3}d delivery</span>
        </div>
        {showSave && (
          <button className="gig-card-list-save" onClick={(e) => {
            e.preventDefault()
            api.save(item.id).catch(console.error)
          }}>
            <Heart size={18} />
          </button>
        )}
      </div>
    </Link>
  )
}
