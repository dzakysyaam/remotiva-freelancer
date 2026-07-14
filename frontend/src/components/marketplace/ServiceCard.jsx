import { Link } from 'react-router-dom'
import { Heart, Star, Clock, Check } from 'lucide-react'
import { api } from '../../lib/api'

export function ServiceCard({ item, showSave = true }) {
  async function handleSave(e) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.save(item.id)
    } catch (err) {
      console.error('Failed to save:', err)
    }
  }

  return (
    <Link to={`/app/services/${item.id}`} className="service-card">
      <div className="service-image">
        <img src={item.image_url || '/assets/home-2.jpg'} alt={item.title} loading="lazy" />
        {showSave && (
          <button className="service-save" onClick={handleSave} aria-label="Save service">
            <Heart size={18} />
          </button>
        )}
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
          <div className="service-meta">
            <Clock size={14} />
            <span>{item.delivery_days}d</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function CategoryCard({ category, compact = false }) {
  return (
    <Link to={`/app/categories/${category.slug}`} className={`category-card ${compact ? 'compact' : ''}`}>
      <div className="category-icon">{category.icon}</div>
      <h3>{category.name}</h3>
      <p>{category.description}</p>
    </Link>
  )
}

export function FreelancerCard({ user }) {
  return (
    <div className="freelancer-card">
      <div className="freelancer-avatar">
        {user.name?.[0]?.toUpperCase() || 'F'}
      </div>
      <h3 className="freelancer-name">{user.name}</h3>
      <p className="freelancer-title">{user.seller_level || 'Freelancer'}</p>
      <div className="freelancer-stats">
        <div className="freelancer-stat">
          <div className="freelancer-stat-value">
            <Star size={14} fill="currentColor" style={{ color: '#f59e0b' }} />
            4.9
          </div>
          <div className="freelancer-stat-label">Rating</div>
        </div>
        <div className="freelancer-stat">
          <div className="freelancer-stat-value">50+</div>
          <div className="freelancer-stat-label">Orders</div>
        </div>
      </div>
    </div>
  )
}

export function OrderCard({ order }) {
  const statusClass = order.status?.toLowerCase().replace(' ', '-') || 'pending'

  return (
    <div className="table-row">
      <div className="order-service">
        <div className="order-service-info">
          <h4>{order.service_title}</h4>
          <span>{order.package_name}</span>
        </div>
      </div>
      <div>
        <span className="status-badge {statusClass}">{order.status}</span>
      </div>
      <div>Rp{Number(order.total_price || 0).toLocaleString('id-ID')}</div>
      <div>{order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '-'}</div>
      <div>
        <button className="btn btn-sm btn-secondary">View</button>
      </div>
    </div>
  )
}
