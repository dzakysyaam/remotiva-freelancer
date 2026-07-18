import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Heart, Package, CreditCard,
  Settings, ChevronRight, Headphones
} from 'lucide-react'
import { api, session } from '../../lib/api'
import { ServiceCard } from '../../components/marketplace/ServiceCard'
import { CustomerServiceButton } from '../../components/customer-service/CustomerServiceButton'
import { DashboardHeroVideo } from '../../components/dashboard/DashboardHeroVideo'
import IconAsset from '../../components/ui/IconAsset'
import { getCategoryIconName } from '../../data/iconMap'
import { dashboard } from '../../data/uiCopy'
import { useLanguage } from '../../i18n/LanguageContext'
import '../../components/customer-service/CustomerService.css'

export default function BuyerDashboard() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [savedServices, setSavedServices] = useState([])
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const { t } = useLanguage()

  useEffect(() => {
    const user = session.user
    if (!user || user.role !== 'buyer') {
      navigate('/auth/login')
      return
    }

    loadData()
  }, [])

  async function loadData() {
    try {
      const [catData, svcData, savedData, orderData, paymentData] = await Promise.all([
        api.categories().catch(() => []),
        api.services({ limit: 8 }).catch(() => []),
        api.saved().catch(() => []),
        api.orders().catch(() => []),
        api.payments().catch(() => [])
      ])
      setCategories(catData)
      setServices(svcData)
      setSavedServices(savedData)
      setOrders(orderData)
      setPayments(paymentData)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  const user = session.user

  return (
    <main className="dashboard-page dashboard-page--buyer">
      {/* Hero Video */}
      <DashboardHeroVideo
        title={t("hero.buyerTitle")}
        subtitle={t("hero.buyerSubtitle")}
        badge={t("hero.buyerBadge")}
      />

      {/* Quick Actions */}
      <section className="dashboard-actions-grid">
        <Link to="/app/search" className="quick-action-card">
          <div className="quick-action-icon">
            <IconAsset name="orders" alt={t("dashboard.browseServices")} size={40} />
          </div>
          <span>{t("dashboard.browseServices")}</span>
        </Link>
        <Link to="/app/saved" className="quick-action-card">
          <div className="quick-action-icon">
            <IconAsset name="empty-saved" alt={t("dashboard.savedServices")} size={40} />
          </div>
          <span>{t("dashboard.savedServices")} ({savedServices.length})</span>
        </Link>
        <Link to="/app/orders" className="quick-action-card">
          <div className="quick-action-icon">
            <IconAsset name="orders" alt={t("dashboard.myOrders")} size={40} />
          </div>
          <span>{t("dashboard.myOrders")} ({orders.length})</span>
        </Link>
        <button className="quick-action-card" onClick={() => window.openCustomerService?.()}>
          <div className="quick-action-icon">
            <IconAsset name="headset" alt={t("dashboard.customerService")} size={40} />
          </div>
          <span>{t("dashboard.customerService")}</span>
        </button>
        <Link to="/app/profile" className="quick-action-card">
          <div className="quick-action-icon">
            <IconAsset name="settings" alt={t("dashboard.settings")} size={40} />
          </div>
          <span>{t("dashboard.settings")}</span>
        </Link>
      </section>

      {/* Categories */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>{t("dashboard.exploreCategories")}</h2>
          <Link to="/app/search">{t("dashboard.viewAll")} <ChevronRight size={16} /></Link>
        </div>
        <div className="categories-mini-grid">
          {categories.slice(0, 6).map(cat => (
            <Link
              key={cat.id}
              to={`/app/categories/${cat.slug}`}
              className="category-mini-card"
            >
              <div className="category-mini-icon">
                <IconAsset
                  name={getCategoryIconName(cat.name)}
                  alt={cat.name}
                  size={40}
                />
              </div>
              <span>{cat.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>{t("dashboard.featuredServices")}</h2>
          <Link to="/app/search">{t("dashboard.viewAll")} <ChevronRight size={16} /></Link>
        </div>
        <div className="services-grid">
          {services.slice(0, 4).map(service => (
            <ServiceCard key={service.id} item={service} />
          ))}
        </div>
      </section>

      {/* All Services */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>{t("dashboard.popularServices")}</h2>
          <Link to="/app/search">{t("dashboard.viewAll")} <ChevronRight size={16} /></Link>
        </div>
        <div className="services-grid">
          {services.slice(4, 8).map(service => (
            <ServiceCard key={service.id} item={service} />
          ))}
        </div>
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

        .dashboard-actions-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .dashboard-section {
          margin-bottom: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .section-header a {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #2D76FF;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .section-header a:hover {
          text-decoration: underline;
        }

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
          text-align: center;
        }

        .categories-mini-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 16px;
        }

        .category-mini-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .category-mini-card:hover {
          border-color: #2D76FF;
          transform: translateY(-2px);
        }

        .category-mini-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-mini-icon img {
          width: 40px;
          height: 40px;
        }

        .category-mini-card span:last-child {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
          text-align: center;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .dashboard-actions-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .categories-mini-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .services-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 1024px) {
          .dashboard-page {
            width: calc(100% - 40px);
          }
        }

        @media (max-width: 900px) {
          .services-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .dashboard-page {
            width: calc(100% - 28px);
            padding: 24px 0 40px;
          }
          .dashboard-actions-grid,
          .categories-mini-grid,
          .services-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  )
}
