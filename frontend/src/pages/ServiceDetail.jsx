import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Clock, Heart, Check, MessageSquare, Share2, ArrowLeft, CreditCard, Building2, Smartphone, Lock, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', desc: 'Visa, Mastercard, JCB', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', desc: 'BCA, Mandiri, BNI, BRI', icon: Building2 },
  { id: 'ewallet', name: 'E-Wallet', desc: 'GoPay, OVO, Dana', icon: Smartphone },
]

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
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [showCheckout, setShowCheckout] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' })

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

  async function handleCheckout() {
    setProcessing(true)
    try {
      await api.createOrder({ service_id: Number(id), package_name: selectedPackage })
      const ref = 'ORD-' + Date.now().toString(36).toUpperCase()
      setOrderId(ref)
      setOrderComplete(true)
      setTimeout(() => navigate('/app/orders'), 3000)
    } catch (err) {
      console.error('Failed to create order:', err)
    } finally {
      setProcessing(false)
    }
  }

  function getPrice() {
    if (!item) return 0
    const multiplier = packages[selectedPackage].priceMultiplier
    return Math.round(item.price * multiplier)
  }

  function formatCardNumber(value) {
    return value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(value) {
    return value.replace(/\D/g, '').substring(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
  }

  if (loading) {
    return (
      <div className="detail-layout">
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading service details...</p>
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
            <h2>Service Not Found</h2>
            <p>The service you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate('/app/search')} className="btn btn-primary">Browse Services</button>
          </div>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="checkout-layout">
        <div className="checkout-section" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px' }}>
          <div className="payment-success-icon">
            <CheckCircle size={40} />
          </div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your order. The seller will start working on your project soon.</p>
          <div className="payment-ref">Order ID: {orderId}</div>
          <p style={{ marginTop: '24px', color: 'var(--muted)' }}>Redirecting to orders...</p>
        </div>
      </div>
    )
  }

  if (showCheckout) {
    return (
      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="checkout-section">
            <h3>
              <CreditCard size={20} />
              Payment Method
            </h3>
            <div className="payment-methods">
              {paymentMethods.map(method => {
                const Icon = method.icon
                return (
                  <div
                    key={method.id}
                    className={`payment-method ${selectedPayment === method.id ? 'active' : ''}`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                    />
                    <div className="payment-method-icon">
                      <Icon size={20} />
                    </div>
                    <div className="payment-method-info">
                      <div className="payment-method-name">{method.name}</div>
                      <div className="payment-method-desc">{method.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {selectedPayment === 'card' && (
            <div className="checkout-section">
              <h3>Card Details</h3>
              <div className="card-form">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardForm.number}
                    onChange={(e) => setCardForm({ ...cardForm, number: formatCardNumber(e.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  />
                </div>
                <div className="card-form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => setShowCheckout(false)} className="btn btn-secondary">
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-service">
              <img src={item.image_url} alt={item.title} />
              <div className="summary-service-info">
                <h4>{item.title}</h4>
                <p>{selectedPackage} Package</p>
              </div>
            </div>
            <div className="summary-item">
              <span>Service Price</span>
              <span>Rp{getPrice().toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-item">
              <span>Platform Fee (5%)</span>
              <span>Rp{Math.round(getPrice() * 0.05).toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>Rp{Math.round(getPrice() * 1.05).toLocaleString('id-ID')}</span>
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '20px' }}
              onClick={handleCheckout}
              disabled={processing}
            >
              <Lock size={18} />
              {processing ? 'Processing...' : 'Pay Now'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', marginTop: '12px' }}>
              Your payment is protected. Money is released only when you approve the delivery.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-layout">
      <div className="detail-main">
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ margin: '16px 0 0 24px' }}>
          <ArrowLeft size={18} />
          Back
        </button>
        <img src={item.image_url} alt={item.title} className="detail-image" />
        <div className="detail-content">
          <div className="detail-badges">
            <span className="badge badge-rating">
              <Star size={12} fill="currentColor" />
              {Number(item.rating || 0).toFixed(1)} ({Math.floor(Math.random() * 50 + 10)} reviews)
            </span>
            <span className="badge badge-delivery">
              <Clock size={12} />
              {item.delivery_days} days delivery
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
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{Number(item.rating || 0).toFixed(1)}</span>
                </div>
                <div className="seller-stat">
                  <Clock size={14} />
                  <span>{item.delivery_days} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-sidebar">
        <div className="order-card">
          <div className="order-header">
            <h3>Select Package</h3>
          </div>

          <div className="package-options">
            {Object.entries(packages).map(([name, pkg]) => (
              <div
                key={name}
                className={`package-btn ${selectedPackage === name ? 'active' : ''}`}
                onClick={() => setSelectedPackage(name)}
              >
                <h4>{name}</h4>
                <span>{pkg.revisions === 99 ? 'Unlimited' : `${pkg.revisions} revision${pkg.revisions > 1 ? 's' : ''}`}</span>
              </div>
            ))}
          </div>

          <div className="order-price">
            <span>Total price</span>
            <strong>Rp{getPrice().toLocaleString('id-ID')}</strong>
          </div>

          <ul className="order-features">
            <li><Check size={16} /> Source files included</li>
            <li><Check size={16} /> Commercial use</li>
            <li><Check size={16} /> {item.delivery_days} day delivery</li>
            <li><Check size={16} /> {packages[selectedPackage].revisions === 99 ? 'Unlimited' : packages[selectedPackage].revisions} revision{s.packages?.[selectedPackage]?.revisions !== 1 ? 's' : ''}</li>
          </ul>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => setShowCheckout(true)}
          >
            Continue to Checkout
          </button>
        </div>

        <div className="actions-card">
          <button className="btn btn-secondary" onClick={handleSave}>
            <Heart size={18} />
            Save for Later
          </button>
          <button className="btn btn-secondary">
            <MessageSquare size={18} />
            Contact Seller
          </button>
          <button className="btn btn-secondary">
            <Share2 size={18} />
            Share Service
          </button>
        </div>
      </div>
    </div>
  )
}
