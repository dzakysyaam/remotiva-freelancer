import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Clock, Heart, Check, MessageSquare, Share2, ArrowLeft, CreditCard, Building2, Smartphone, Lock, CheckCircle, X, QrCode, Shield, Copy, CheckCheck, Loader, SmartphoneIcon, AlertCircle } from 'lucide-react'
import { api, session } from '../lib/api'
import { checkout } from '../data/uiCopy'

const bankOptions = [
  { id: 'bca', name: 'BCA', prefix: '8808' },
  { id: 'mandiri', name: 'Mandiri', prefix: '8877' },
  { id: 'bni', name: 'BNI', prefix: '8899' },
  { id: 'bri', name: 'BRI', prefix: '8866' },
]

const packages = {
  Basic: { revisions: 1, priceMultiplier: 0.7 },
  Standard: { revisions: 3, priceMultiplier: 1 },
  Premium: { revisions: 99, priceMultiplier: 1.5 }
}

export default function Checkout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState('Standard')
  const [paymentMethod, setPaymentMethod] = useState('') // 'card', 'bank', 'qris'
  const [selectedBank, setSelectedBank] = useState('bca')
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [cardError, setCardError] = useState('')
  const [vaCopied, setVaCopied] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [paymentId, setPaymentId] = useState(null)
  const [qrScanned, setQrScanned] = useState(false)
  const [error, setError] = useState('')

  // Load service data
  useEffect(() => {
    if (!session.user || session.user.role !== 'buyer') {
      navigate('/app')
      return
    }
    api.service(id)
      .then(setService)
      .catch(() => setService(false))
      .finally(() => setLoading(false))
  }, [id])

  function getPrice() {
    if (!service) return 0
    const multiplier = packages[selectedPackage].priceMultiplier
    return Math.round(service.price * multiplier)
  }

  function getTotalPrice() {
    const subtotal = getPrice()
    const fee = Math.round(subtotal * 0.05)
    return subtotal + fee
  }

  function formatCardNumber(value) {
    return value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(value) {
    return value.replace(/\D/g, '').substring(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
  }

  function generateVANumber() {
    const bank = bankOptions.find(b => b.id === selectedBank)
    const prefix = bank?.prefix || '8800'
    const orderSuffix = orderId.replace(/[^0-9]/g, '').slice(0, 6) || '000000'
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
    return `${prefix} ${orderSuffix} ${random}`.replace(/(.{4})/g, '$1 ').trim()
  }

  function generateQRPayload() {
    return `REMOTIVA|ORDER:${orderId}|AMOUNT:${getTotalPrice()}|TIME:${Date.now()}`
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text.replace(/\s/g, ''))
    setVaCopied(true)
    setTimeout(() => setVaCopied(false), 2000)
  }

  async function handleCardPayment() {
    const cardNum = cardForm.number.replace(/\s/g, '')
    if (cardNum.length < 16) {
      setCardError(checkout.invalidCard)
      return
    }
    if (!cardForm.name.trim()) {
      setCardError(checkout.enterCardholderName)
      return
    }
    if (cardForm.expiry.length < 5) {
      setCardError(checkout.enterExpiry)
      return
    }
    if (cardForm.cvv.length < 3) {
      setCardError(checkout.enterCvv)
      return
    }

    await processPayment()
  }

  async function processPayment() {
    setProcessing(true)
    setError('')

    try {
      // Create order
      const orderRes = await api.createOrder({ service_id: Number(id), package_name: selectedPackage })
      const newOrderId = 'ORD-' + Date.now().toString(36).toUpperCase()
      setOrderId(newOrderId)

      // Create payment
      if (paymentMethod) {
        const methodName = paymentMethod === 'card' ? 'Credit Card' :
                          paymentMethod === 'bank' ? `${selectedBank.toUpperCase()} Virtual Account` :
                          'QRIS'
        const paymentRes = await api.createPayment({
          order_id: orderRes.id || 1,
          method: methodName
        })
        setPaymentId(paymentRes.id)
      }

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mark as paid
      if (paymentId) {
        await api.markPaymentPaid(paymentId)
      }

      setShowSuccess(true)
    } catch (err) {
      console.error('Payment failed:', err)
      setError(err.message || 'Pembayaran gagal. Silakan coba lagi.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-loading">
            <Loader size={32} className="spin" />
            <p>{checkout.loadingCheckout}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <AlertCircle size={48} />
            <h2>{checkout.serviceNotFoundTitle}</h2>
            <p>{checkout.serviceNotFoundDesc}</p>
            <button onClick={() => navigate('/app/search')} className="btn btn-primary">
              {checkout.browseServices}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="success-card">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h2>{checkout.paymentSuccess}</h2>
            <p className="success-desc">
              {checkout.paymentSuccessDesc}
            </p>
            <div className="success-details">
              <div className="success-detail-row">
                <span>{checkout.orderId}</span>
                <span className="mono">{orderId}</span>
              </div>
              <div className="success-detail-row">
                <span>{checkout.totalPaid}</span>
                <span className="mono">Rp{getTotalPrice().toLocaleString('id-ID')}</span>
              </div>
              <div className="success-detail-row">
                <span>{checkout.paymentMethod}</span>
                <span>{paymentMethod === 'card' ? checkout.creditDebitCard : paymentMethod === 'bank' ? `${selectedBank.toUpperCase()} Virtual Account` : 'QRIS'}</span>
              </div>
            </div>
            <div className="success-actions">
              <button onClick={() => navigate('/app/orders')} className="btn btn-primary">
                {checkout.viewMyOrders}
              </button>
              <button onClick={() => navigate('/app')} className="btn btn-secondary">
                {checkout.backToHome}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Main Content */}
        <div className="checkout-main">
          {/* Back Button */}
          <button className="back-link" onClick={() => navigate(`/app/services/${id}`)}>
            <ArrowLeft size={18} />
            {checkout.backToService}
          </button>

          <h1 className="checkout-title">{checkout.title}</h1>

          {/* Payment Methods */}
          <div className="payment-section">
            <h2 className="section-title">{checkout.selectPaymentMethod}</h2>

            <div className="payment-methods">
              {/* credit Card */}
              <div
                className={`payment-method-card ${paymentMethod === 'card' ? 'is-selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="payment-method-radio">
                  <div className={`radio-dot ${paymentMethod === 'card' ? 'checked' : ''}`} />
                </div>
                <div className="payment-method-icon">
                  <CreditCard size={24} />
                </div>
                <div className="payment-method-info">
                  <span className="payment-method-name">{checkout.creditDebitCard}</span>
                  <span className="payment-method-desc">{checkout.cardDesc}</span>
                </div>
              </div>

              {/* Bank Transfer */}
              <div
                className={`payment-method-card ${paymentMethod === 'bank' ? 'is-selected' : ''}`}
                onClick={() => setPaymentMethod('bank')}
              >
                <div className="payment-method-radio">
                  <div className={`radio-dot ${paymentMethod === 'bank' ? 'checked' : ''}`} />
                </div>
                <div className="payment-method-icon">
                  <Building2 size={24} />
                </div>
                <div className="payment-method-info">
                  <span className="payment-method-name">{checkout.bankTransfer}</span>
                  <span className="payment-method-desc">{checkout.bankTransferDesc}</span>
                </div>
              </div>

              {/* QRIS */}
              <div
                className={`payment-method-card ${paymentMethod === 'qris' ? 'is-selected' : ''}`}
                onClick={() => setPaymentMethod('qris')}
              >
                <div className="payment-method-radio">
                  <div className={`radio-dot ${paymentMethod === 'qris' ? 'checked' : ''}`} />
                </div>
                <div className="payment-method-icon">
                  <QrCode size={24} />
                </div>
                <div className="payment-method-info">
                  <span className="payment-method-name">{checkout.qris}</span>
                  <span className="payment-method-desc">{checkout.qrisDesc}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Panel */}
          {paymentMethod === 'card' && (
            <div className="payment-detail-panel">
              <h2 className="section-title">{checkout.cardDetails}</h2>
              <p className="panel-note">{checkout.cardNote}</p>

              <div className="card-form">
                <div className="form-group">
                  <label>{checkout.cardNumber}</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardForm.number}
                    onChange={e => setCardForm(f => ({ ...f, number: formatCardNumber(e.target.value) }))}
                    maxLength={19}
                  />
                </div>
                <div className="form-group">
                  <label>{checkout.cardholderName}</label>
                  <input
                    type="text"
                    placeholder="NAMA LENGKAP"
                    value={cardForm.name}
                    onChange={e => setCardForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{checkout.expiryDate}</label>
                    <input
                      type="text"
                      placeholder="BB/TT"
                      value={cardForm.expiry}
                      onChange={e => setCardForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label>{checkout.cvv}</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) }))}
                      maxLength={4}
                    />
                  </div>
                </div>
                {cardError && <div className="error-message">{cardError}</div>}
              </div>
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div className="payment-detail-panel">
              <h2 className="section-title">{checkout.bankTransferTitle}</h2>
              <p className="panel-note">{checkout.completePayment}</p>

              {/* Bank Selection */}
              <div className="bank-selector">
                <label>{checkout.selectBank}</label>
                <div className="bank-options">
                  {bankOptions.map(bank => (
                    <button
                      key={bank.id}
                      className={`bank-option ${selectedBank === bank.id ? 'selected' : ''}`}
                      onClick={() => setSelectedBank(bank.id)}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* VA Info */}
              {orderId && (
                <div className="va-info-card">
                  <div className="va-header">
                    <Building2 size={20} />
                    <span>{selectedBank.toUpperCase()} Virtual Account</span>
                  </div>
                  <div className="va-number">{generateVANumber()}</div>
                  <button className="copy-btn" onClick={() => copyToClipboard(generateVANumber())}>
                    {vaCopied ? <><CheckCheck size={16} /> {checkout.copied}</> : <><Copy size={16} /> {checkout.copyVaNumber}</>}
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="payment-instructions">
                <h4>{checkout.howToPay}</h4>
                <ol>
                  <li>{checkout.step1.replace('{bank}', selectedBank.toUpperCase())}</li>
                  <li>{checkout.step2}</li>
                  <li>{checkout.step3}</li>
                  <li>{checkout.step4}</li>
                  <li>{checkout.step5}</li>
                </ol>
              </div>
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="payment-detail-panel">
              <h2 className="section-title">{checkout.qrisTitle}</h2>
              <p className="panel-note">{checkout.qrisNote}</p>

              {/* QR Code Display */}
              <div className="qris-display">
                <div className="qr-frame">
                  <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                    {/* Corner patterns */}
                    <rect x="8" y="8" width="44" height="44" fill="#2D76FF" rx="6"/>
                    <rect x="14" y="14" width="32" height="32" fill="white" rx="4"/>
                    <rect x="20" y="20" width="20" height="20" fill="#2D76FF" rx="3"/>

                    <rect x="108" y="8" width="44" height="44" fill="#2D76FF" rx="6"/>
                    <rect x="114" y="14" width="32" height="32" fill="white" rx="4"/>
                    <rect x="120" y="20" width="20" height="20" fill="#2D76FF" rx="3"/>

                    <rect x="8" y="108" width="44" height="44" fill="#2D76FF" rx="6"/>
                    <rect x="14" y="114" width="32" height="32" fill="white" rx="4"/>
                    <rect x="20" y="120" width="20" height="20" fill="#2D76FF" rx="3"/>

                    {/* Data modules */}
                    <rect x="62" y="8" width="10" height="10" fill="#2D76FF"/>
                    <rect x="82" y="8" width="10" height="10" fill="#2D76FF"/>
                    <rect x="62" y="28" width="10" height="10" fill="#2D76FF"/>
                    <rect x="82" y="28" width="10" height="10" fill="#2D76FF"/>

                    <rect x="62" y="62" width="10" height="10" fill="#2D76FF"/>
                    <rect x="82" y="62" width="10" height="10" fill="#2D76FF"/>
                    <rect x="62" y="82" width="10" height="10" fill="#2D76FF"/>
                    <rect x="82" y="82" width="10" height="10" fill="#2D76FF"/>

                    <rect x="62" y="108" width="10" height="10" fill="#2D76FF"/>
                    <rect x="82" y="108" width="10" height="10" fill="#2D76FF"/>
                    <rect x="62" y="128" width="10" height="10" fill="#2D76FF"/>
                    <rect x="82" y="128" width="10" height="10" fill="#2D76FF"/>

                    <rect x="108" y="62" width="10" height="10" fill="#2D76FF"/>
                    <rect x="128" y="62" width="10" height="10" fill="#2D76FF"/>
                    <rect x="108" y="82" width="10" height="10" fill="#2D76FF"/>
                    <rect x="128" y="82" width="10" height="10" fill="#2D76FF"/>

                    <rect x="108" y="108" width="10" height="10" fill="#2D76FF"/>
                    <rect x="128" y="108" width="10" height="10" fill="#2D76FF"/>
                    <rect x="108" y="128" width="10" height="10" fill="#2D76FF"/>
                    <rect x="128" y="128" width="10" height="10" fill="#2D76FF"/>

                    {/* Center pattern */}
                    <rect x="70" y="70" width="20" height="20" fill="#2D76FF" rx="3"/>
                    <rect x="76" y="76" width="8" height="8" fill="white"/>
                  </svg>
                </div>
                <p className="qr-note">{checkout.scanWithApp}</p>
              </div>

              {/* QR Info */}
              <div className="qris-info-card">
                <div className="qris-info-row">
                  <span>{checkout.orderId}</span>
                  <span className="mono">{orderId || 'Generating...'}</span>
                </div>
                <div className="qris-info-row">
                  <span>{checkout.amount || "Jumlah"}</span>
                  <span className="amount">Rp{getTotalPrice().toLocaleString('id-ID')}</span>
                </div>
                <div className="qris-info-row">
                  <span>{checkout.paymentMethod}</span>
                  <span>QRIS</span>
                </div>
              </div>

              {/* Simulation */}
              {!qrScanned && (
                <button className="btn btn-secondary scan-btn" onClick={() => setQrScanned(true)}>
                  <SmartphoneIcon size={18} />
                  {checkout.simulateQris}
                </button>
              )}
              {qrScanned && (
                <div className="qr-scanned-badge">
                  <CheckCircle size={16} />
                  {checkout.qrScanned}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="checkout-sidebar">
          <div className="summary-card">
            <h3 className="summary-title">{checkout.orderSummary}</h3>

            {/* Service Info */}
            <div className="summary-service">
              <img src={service.image_url} alt={service.title} />
              <div className="summary-service-info">
                <h4>{service.title}</h4>
                <p>{selectedPackage} Package</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="summary-breakdown">
              <div className="summary-row">
                <span>{checkout.servicePrice}</span>
                <span>Rp{getPrice().toLocaleString('id-ID')}</span>
              </div>
              <div className="summary-row">
                <span>{checkout.platformFee}</span>
                <span>Rp{Math.round(getPrice() * 0.05).toLocaleString('id-ID')}</span>
              </div>
              <div className="summary-total">
                <span>{checkout.total}</span>
                <span>Rp{getTotalPrice().toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              className="btn btn-primary pay-btn"
              onClick={paymentMethod === 'card' ? handleCardPayment : processPayment}
              disabled={!paymentMethod || processing}
            >
              {processing ? (
                <><Loader size={18} className="spin" /> {checkout.processing}</>
              ) : (
                <><Lock size={18} /> {checkout.payNow.replace('{amount}', getTotalPrice().toLocaleString('id-ID'))}</>
              )}
            </button>

            <p className="summary-note">
              <Lock size={14} />
              {checkout.secureSimulation}
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        .checkout-page {
          background: #F8FAFC;
          min-height: calc(100vh - 76px);
          padding: 40px 0 72px;
        }

        .checkout-container {
          width: min(100% - 64px, 1320px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 28px;
          align-items: start;
        }

        .checkout-main {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
          padding: 28px;
        }

        .checkout-sidebar {
          position: sticky;
          top: 100px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748B;
          font-size: 0.9rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 0;
          margin-bottom: 16px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #2D76FF;
        }

        .checkout-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 28px;
        }

        .payment-section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0F172A;
          margin-bottom: 16px;
        }

        .payment-methods {
          display: grid;
          gap: 14px;
        }

        .payment-method-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .payment-method-card:hover {
          border-color: #2D76FF;
        }

        .payment-method-card.is-selected {
          border-color: #2D76FF;
          background: rgba(45, 118, 255, 0.05);
          box-shadow: 0 12px 26px rgba(45, 118, 255, 0.12);
        }

        .payment-method-radio {
          width: 20px;
          height: 20px;
          border: 2px solid #CBD5E1;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .radio-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: transparent;
          transition: background 0.2s;
        }

        .radio-dot.checked {
          background: #2D76FF;
        }

        .payment-method-icon {
          width: 48px;
          height: 48px;
          background: #F1F5F9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          flex-shrink: 0;
        }

        .payment-method-card.is-selected .payment-method-icon {
          background: rgba(45, 118, 255, 0.1);
          color: #2D76FF;
        }

        .payment-method-info {
          flex: 1;
        }

        .payment-method-name {
          display: block;
          font-weight: 600;
          color: #0F172A;
          margin-bottom: 2px;
        }

        .payment-method-desc {
          display: block;
          font-size: 0.85rem;
          color: #64748B;
        }

        .payment-detail-panel {
          background: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .panel-note {
          font-size: 0.85rem;
          color: #64748B;
          margin-bottom: 20px;
        }

        .card-form .form-group {
          margin-bottom: 16px;
        }

        .card-form label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .card-form input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: 'Courier New', monospace;
          transition: border-color 0.2s;
        }

        .card-form input:focus {
          outline: none;
          border-color: #2D76FF;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .error-message {
          color: #DC2626;
          font-size: 0.85rem;
          margin-top: 12px;
          padding: 10px 14px;
          background: #FEF2F2;
          border-radius: 8px;
        }

        .bank-selector {
          margin-bottom: 20px;
        }

        .bank-selector label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 10px;
        }

        .bank-options {
          display: flex;
          gap: 10px;
        }

        .bank-option {
          flex: 1;
          padding: 12px 16px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bank-option:hover {
          border-color: #2D76FF;
        }

        .bank-option.selected {
          background: rgba(45, 118, 255, 0.1);
          border-color: #2D76FF;
          color: #2D76FF;
        }

        .va-info-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          margin-bottom: 20px;
        }

        .va-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #2D76FF;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .va-number {
          font-size: 1.6rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.05em;
          color: #0F172A;
          margin-bottom: 16px;
        }

        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #2D76FF;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .copy-btn:hover {
          background: #1F66EC;
        }

        .payment-instructions {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 12px;
          padding: 16px 20px;
        }

        .payment-instructions h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #92400E;
          margin-bottom: 12px;
        }

        .payment-instructions ol {
          margin: 0;
          padding-left: 20px;
          color: #92400E;
          font-size: 0.85rem;
          line-height: 1.8;
        }

        .qris-display {
          text-align: center;
          padding: 24px;
          background: #FFFFFF;
          border-radius: 16px;
          margin-bottom: 20px;
        }

        .qr-frame {
          display: inline-block;
          padding: 20px;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          margin-bottom: 12px;
        }

        .qr-note {
          font-size: 0.85rem;
          color: #64748B;
        }

        .qris-info-card {
          background: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .qris-info-row {
          display: flex;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid #F1F5F9;
        }

        .qris-info-row:last-child {
          border-bottom: none;
        }

        .qris-info-row span:first-child {
          color: #64748B;
          font-size: 0.9rem;
        }

        .qris-info-row .mono {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #0F172A;
        }

        .qris-info-row .amount {
          font-weight: 700;
          color: #2D76FF;
        }

        .scan-btn {
          width: 100%;
          justify-content: center;
          padding: 14px;
        }

        .qr-scanned-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: #ECFDF5;
          color: #059669;
          border-radius: 10px;
          font-weight: 600;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: #FEF2F2;
          color: #DC2626;
          border-radius: 10px;
          font-size: 0.9rem;
        }

        /* Summary Card */
        .summary-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
        }

        .summary-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 20px;
        }

        .summary-service {
          display: flex;
          gap: 14px;
          padding-bottom: 20px;
          border-bottom: 1px solid #F1F5F9;
          margin-bottom: 20px;
        }

        .summary-service img {
          width: 72px;
          height: 54px;
          object-fit: cover;
          border-radius: 8px;
        }

        .summary-service-info h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0F172A;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .summary-service-info p {
          font-size: 0.8rem;
          color: #64748B;
        }

        .summary-breakdown {
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 0.9rem;
          color: #64748B;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          border-top: 1px solid #E2E8F0;
          margin-top: 8px;
          font-weight: 700;
          font-size: 1.1rem;
          color: #0F172A;
        }

        .pay-btn {
          width: 100%;
          justify-content: center;
          padding: 16px;
          font-size: 1rem;
        }

        .summary-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 14px;
          font-size: 0.8rem;
          color: #94A3B8;
        }

        /* Success Card */
        .success-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 24px;
          padding: 48px;
          text-align: center;
          max-width: 520px;
          margin: 0 auto;
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.06);
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: #ECFDF5;
          color: #059669;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .success-card h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 12px;
        }

        .success-desc {
          color: #64748B;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .success-details {
          background: #F8FAFC;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 28px;
          text-align: left;
        }

        .success-detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #E2E8F0;
        }

        .success-detail-row:last-child {
          border-bottom: none;
        }

        .success-detail-row span:first-child {
          color: #64748B;
        }

        .success-detail-row .mono {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #0F172A;
        }

        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .success-actions .btn {
          width: 100%;
          justify-content: center;
        }

        /* Loading/Empty States */
        .checkout-loading,
        .checkout-empty {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px;
          background: #FFFFFF;
          border-radius: 20px;
          color: #64748B;
          gap: 16px;
        }

        .checkout-loading p,
        .checkout-empty p {
          color: #64748B;
        }

        .checkout-empty h2 {
          color: #0F172A;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .checkout-container {
            grid-template-columns: 1fr;
            width: min(100% - 32px, 100%);
          }

          .checkout-sidebar {
            position: static;
          }

          .bank-options {
            flex-wrap: wrap;
          }

          .bank-option {
            flex: 1 1 45%;
          }
        }

        @media (max-width: 480px) {
          .checkout-main,
          .summary-card,
          .success-card {
            padding: 20px;
          }

          .checkout-title {
            font-size: 1.25rem;
          }

          .success-card {
            padding: 32px 20px;
          }
        }
      `}</style>
    </div>
  )
}
