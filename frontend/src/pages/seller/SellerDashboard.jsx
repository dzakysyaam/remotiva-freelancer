import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package, DollarSign, Headphones, TrendingUp,
  Eye, Clock, CheckCircle, Settings, Plus, Edit, Pause, Play
} from 'lucide-react'
import { api, session } from '../../lib/api'
import { CustomerServiceButton } from '../../components/customer-service/CustomerServiceButton'
import { DashboardHeroVideo } from '../../components/dashboard/DashboardHeroVideo'
import IconAsset from '../../components/ui/IconAsset'
import { dashboard, formatServiceStatus } from '../../data/uiCopy'
import { useLanguage } from '../../i18n/LanguageContext'
import '../../components/customer-service/CustomerService.css'

// Mock seller services data
const mockSellerServices = [
  {
    id: 1,
    title: "Professional Logo Design for Your Business",
    category: "Graphic & Design",
    price: 350000,
    status: "active",
    orders: 12,
    rating: 4.9,
    thumbnail: "/assets/card-remotiva-1.png"
  },
  {
    id: 2,
    title: "Build Professional Company Website",
    category: "Programming & Tech",
    price: 1500000,
    status: "active",
    orders: 8,
    rating: 4.8,
    thumbnail: "/assets/card-remotiva-2.png"
  },
  {
    id: 3,
    title: "Social Media Marketing Campaign",
    category: "Digital Marketing",
    price: 900000,
    status: "draft",
    orders: 0,
    rating: 0,
    thumbnail: "/assets/card-remotiva-6.png"
  },
  {
    id: 4,
    title: "AI Art Generation & Editing",
    category: "AI Services",
    price: 500000,
    status: "active",
    orders: 24,
    rating: 5.0,
    thumbnail: "/assets/card-remotiva-3.png"
  }
]

export default function SellerDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalEarnings: 0
  })
  const [sellerServices, setSellerServices] = useState(mockSellerServices)
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const { t } = useLanguage()

  useEffect(() => {
    const user = session.user
    if (!user || user.role !== 'seller') {
      navigate('/auth/login')
      return
    }

    loadData()
  }, [])

  async function loadData() {
    try {
      const [orderData, paymentData] = await Promise.all([
        api.orders().catch(() => []),
        api.payments().catch(() => [])
      ])

      setOrders(orderData)

      const completedOrders = orderData.filter(o => o.status === 'Completed')
      const activeOrders = orderData.filter(o => ['Pending', 'In Progress', 'Delivered'].includes(o.status))
      const totalEarnings = paymentData
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.total_amount, 0)

      setStats({
        totalOrders: orderData.length,
        activeOrders: activeOrders.length,
        completedOrders: completedOrders.length,
        totalEarnings
      })
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  function toggleServiceStatus(serviceId) {
    setSellerServices(prev => prev.map(s =>
      s.id === serviceId
        ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
        : s
    ))
  }

  return (
    <>
      <DashboardHeroVideo
        title={t("hero.sellerTitle")}
        subtitle={t("hero.sellerSubtitle")}
        badge={t("hero.sellerBadge")}
        actions={
          <Link to="/app/become-seller" className="dashboard-hero-action">
            <Plus size={16} /> {t("dashboard.addNewService")}
          </Link>
        }
      />

      <main className="dashboard-page dashboard-page--seller">

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        <div className="stat-card-main">
          <div className="stat-icon">
            <IconAsset name="earnings" alt={t("dashboard.totalEarnings")} size={40} />
          </div>
          <div className="stat-info">
            <span className="stat-value">Rp{stats.totalEarnings.toLocaleString('id-ID')}</span>
            <span className="stat-label">{t("dashboard.totalEarnings")}</span>
          </div>
        </div>
        <div className="stat-card-main">
          <div className="stat-icon">
            <IconAsset name="orders" alt={t("dashboard.totalOrders")} size={40} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">{t("dashboard.totalOrders")}</span>
          </div>
        </div>
        <div className="stat-card-main">
          <div className="stat-icon">
            <IconAsset name="active-orders" alt={t("dashboard.activeOrders")} size={40} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeOrders}</span>
            <span className="stat-label">{t("dashboard.activeOrders")}</span>
          </div>
        </div>
        <div className="stat-card-main">
          <div className="stat-icon">
            <IconAsset name="completed" alt={t("dashboard.completed")} size={40} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.completedOrders}</span>
            <span className="stat-label">{t("dashboard.completed")}</span>
          </div>
        </div>
      </div>

      {/* My Services Section */}
      <section className="seller-services-section">
        <div className="seller-services-header">
          <div>
            <h2>{t("dashboard.myServices")}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              {t("dashboard.myServicesSubtitle")}
            </p>
          </div>
          <Link to="/app/become-seller" className="btn btn-primary">
            <Plus size={16} /> {t("dashboard.addNewService")}
          </Link>
        </div>
        <div className="seller-services-grid">
          {sellerServices.map(service => (
            <div key={service.id} className="seller-service-card">
              <div className="seller-service-card__image">
                <img src={service.thumbnail} alt={service.title} />
                <span className={`seller-service-card__status ${service.status}`}>
                  {formatServiceStatus(service.status)}
                </span>
              </div>
              <div className="seller-service-card__content">
                <h3>{service.title}</h3>
                <span className="seller-service-card__category">{service.category}</span>
                <div className="seller-service-card__meta">
                  <span className="seller-service-card__orders">
                    <Package size={14} /> {service.orders} {t("dashboard.orders")}
                  </span>
                  {service.rating > 0 && (
                    <span className="seller-service-card__rating">
                      <span style={{ color: '#f59e0b' }}>★</span> {service.rating}
                    </span>
                  )}
                </div>
                <div className="seller-service-card__footer">
                  <span className="seller-service-card__price">
                    Rp{Number(service.price).toLocaleString('id-ID')}
                  </span>
                  <div className="seller-service-card__actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => toggleServiceStatus(service.id)}>
                      {service.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button className="btn btn-sm btn-primary">
                      <Edit size={14} /> {t("dashboard.edit")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-actions-grid" style={{ marginTop: '32px' }}>
        <Link to="/app/orders" className="quick-action-card">
          <div className="quick-action-icon">
            <IconAsset name="incoming-orders" alt={t("dashboard.incomingOrders")} size={40} />
          </div>
          <span>{t("dashboard.incomingOrders")}</span>
        </Link>
        <button className="quick-action-card" onClick={() => window.openCustomerService?.()}>
          <div className="quick-action-icon">
            <IconAsset name="headset" alt={t("dashboard.customerService")} size={40} />
          </div>
          <span>{t("dashboard.customerService")}</span>
        </button>
        <Link to="/app/become-seller" className="quick-action-card">
          <div className="quick-action-icon">
            <IconAsset name="analytics" alt={t("dashboard.analytics")} size={40} />
          </div>
          <span>{t("dashboard.analytics")}</span>
        </Link>
        <Link to="/app/profile" className="quick-action-card">
          <div className="quick-action-icon">
            <IconAsset name="settings" alt={t("dashboard.settings")} size={40} />
          </div>
          <span>{t("dashboard.settings")}</span>
        </Link>
      </section>

      {/* Customer Service Button */}
      <CustomerServiceButton />

      <style>{`
        .dashboard-page {
          width: calc(100% - 96px);
          max-width: 1680px;
          margin: 0 auto;
          padding: 32px 0 64px;
        }

        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .dashboard-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .stat-card-main {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(45, 118, 255, 0.08);
          flex-shrink: 0;
        }

        .stat-icon img {
          width: 40px;
          height: 40px;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
        }

        /* Seller Services Section */
        .seller-services-section {
          margin-bottom: 32px;
        }

        .seller-services-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .seller-services-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .seller-services-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        .seller-service-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .seller-service-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .seller-service-card__image {
          position: relative;
          height: 140px;
          overflow: hidden;
        }

        .seller-service-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .seller-service-card__status {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .seller-service-card__status.active {
          background: #dcfce7;
          color: #166534;
        }

        .seller-service-card__status.paused {
          background: #fef3c7;
          color: #92400e;
        }

        .seller-service-card__status.draft {
          background: #f1f5f9;
          color: #64748b;
        }

        .seller-service-card__content {
          padding: 16px;
        }

        .seller-service-card__content h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 6px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .seller-service-card__category {
          font-size: 0.75rem;
          color: #64748b;
          display: block;
          margin-bottom: 10px;
        }

        .seller-service-card__meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 12px;
        }

        .seller-service-card__orders {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .seller-service-card__rating {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .seller-service-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .seller-service-card__price {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .seller-service-card__actions {
          display: flex;
          gap: 6px;
        }

        /* Quick Actions */
        .quick-action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }

        .quick-action-card:hover {
          border-color: #2D76FF;
          box-shadow: 0 4px 12px rgba(45, 118, 255, 0.1);
          transform: translateY(-2px);
        }

        .quick-action-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(45, 118, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .quick-action-icon img {
          width: 40px;
          height: 40px;
        }

        .quick-action-card span {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #2D76FF;
          color: white;
        }

        .btn-primary:hover {
          background: #1F66EC;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .btn-sm {
          padding: 6px 10px;
          font-size: 0.8rem;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .seller-services-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1024px) {
          .dashboard-page {
            width: calc(100% - 40px);
          }
          .dashboard-stats-grid,
          .dashboard-actions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .seller-services-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .dashboard-page {
            width: calc(100% - 28px);
            padding: 24px 0 40px;
          }
          .dashboard-stats-grid,
          .dashboard-actions-grid,
          .seller-services-grid {
            grid-template-columns: 1fr;
          }
          .seller-services-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
    </>
  )
}
