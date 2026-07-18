import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Clock, Heart, Check, MessageSquare, Share2, ArrowLeft, CreditCard, Shield } from 'lucide-react'
import { api, session } from '../lib/api'
import { serviceDetail } from '../data/uiCopy'

const packages = {
  Basic: { revisions: 1, priceMultiplier: 0.7 },
  Standard: { revisions: 3, priceMultiplier: 1 },
  Premium: { revisions: 99, priceMultiplier: 1.5 }
}

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState('Standard')

  useEffect(() => {
    api.service(id)
      .then(setItem)
      .catch(() => setItem(false))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    try {
      await api.save(item.id)
    } catch (err) {
      console.error('Failed to save:', err)
    }
  }

  function getPrice() {
    if (!item) return 0
    const multiplier = packages[selectedPackage].priceMultiplier
    return Math.round(item.price * multiplier)
  }

  if (loading) {
    return (
      <div className="detail-layout">
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>{serviceDetail.loadingService}</p>
        </div>
      </div>
    )
  }

  if (item === false || !item) {
    return (
      <div className="detail-layout">
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px' }}>
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2>{serviceDetail.serviceNotFound}</h2>
            <p>{serviceDetail.serviceNotFoundDesc}</p>
            <button onClick={() => navigate('/app/search')} className="btn btn-primary">{serviceDetail.browseServices}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-layout">
      <div className="detail-main">
        <div className="detail-breadcrumb">
          <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <a href="/app/search">{serviceDetail.allServices}</a>
          <span>/</span>
          <span>{item.title}</span>
        </div>

        <img src={item.image_url} alt={item.title} className="detail-image" />

        <div className="detail-content">
          <div className="detail-badges">
            <span className="badge badge-rating">
              <Star size={14} fill="#ffb800" color="#ffb800" />
              {Number(item.rating || 0).toFixed(1)} ({Math.floor(Math.random() * 50 + 10)})
            </span>
            <span className="badge badge-delivery">
              <Clock size={14} />
              {item.delivery_days} {serviceDetail.daysDelivery}
            </span>
          </div>

          <h1>{item.title}</h1>
          <p className="detail-description">{item.description}</p>

          <div className="seller-info">
            <div className="seller-avatar-lg">
              {item.seller_name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="seller-details">
              <h3>{item.seller_name}</h3>
              <p className="seller-level">{item.seller_level}</p>
              <div className="seller-stats-row">
                <div className="seller-stat">
                  <Star size={16} fill="#ffb800" color="#ffb800" />
                  <span style={{ fontWeight: 700 }}>{Number(item.rating || 0).toFixed(1)}</span>
                </div>
                <div className="seller-stat">
                  <Clock size={16} />
                  <span>{item.delivery_days} {serviceDetail.days}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-sidebar">
        <div className="order-card">
          <div className="order-header">
            <h3>{serviceDetail.selectPackage}</h3>
          </div>

          <div className="package-options">
            {Object.entries(packages).map(([name, pkg]) => (
              <div
                key={name}
                className={`package-btn ${selectedPackage === name ? 'active' : ''}`}
                onClick={() => setSelectedPackage(name)}
              >
                <h4>{name}</h4>
                <span>{pkg.revisions === 99 ? serviceDetail.unlimited : `${pkg.revisions} ${pkg.revisions > 1 ? serviceDetail.revisions : serviceDetail.revision}`}</span>
              </div>
            ))}
          </div>

          <div className="order-price">
            <span>{serviceDetail.totalPrice}</span>
            <strong>Rp{getPrice().toLocaleString('id-ID')}</strong>
          </div>

          <ul className="order-features">
            <li><Check size={18} /> {serviceDetail.sourceFiles}</li>
            <li><Check size={18} /> {serviceDetail.commercialUse}</li>
            <li><Check size={18} /> {item.delivery_days} {serviceDetail.daysDelivery}</li>
            <li><Check size={18} /> {packages[selectedPackage].revisions === 99 ? serviceDetail.unlimited : `${packages[selectedPackage].revisions} ${packages[selectedPackage].revisions !== 1 ? serviceDetail.revisions : serviceDetail.revision}`}</li>
          </ul>

          {session.user?.role === 'buyer' ? (
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', background: '#2D76FF' }}
              onClick={() => navigate(`/app/checkout/${id}?package=${selectedPackage}`)}
            >
              <CreditCard size={18} />
              {serviceDetail.continueToCheckout}
            </button>
          ) : (
            <div className="view-only-badge">
              <Shield size={16} />
              {session.user?.role === 'admin' ? serviceDetail.adminPreview : serviceDetail.sellerView}
            </div>
          )}
        </div>

        <div className="actions-card">
          <button className="btn btn-secondary" onClick={handleSave}>
            <Heart size={18} />
            {serviceDetail.saveForLater}
          </button>
          <button className="btn btn-secondary">
            <MessageSquare size={18} />
            {serviceDetail.contactSeller}
          </button>
          <button className="btn btn-secondary">
            <Share2 size={18} />
            {serviceDetail.shareService}
          </button>
        </div>
      </div>
    </div>
  )
}
