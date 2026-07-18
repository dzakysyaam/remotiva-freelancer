import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Shield, Users, Zap, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'
import { ServiceCard } from '../components/marketplace/ServiceCard'
import HeroVideoSection from '../components/home/HeroVideoSection'
import IconAsset from '../components/ui/IconAsset'
import { getCategoryIconName } from '../data/iconMap'
import { home } from '../data/uiCopy'

export default function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]))
    api.services({ limit: 8 }).then(setServices).catch(() => setServices([]))
  }, [])

  return (
    <>
      <HeroVideoSection />

      <section className="section categories-section">
        <div className="section-container">
          <div className="section-header">
            <h2>{home.exploreCategories}</h2>
            <Link to="/app/search">{home.viewAll} <ChevronRight size={16} /></Link>
          </div>
          <div className="categories-grid">
            {categories.slice(0, 6).map(cat => (
              <Link key={cat.id} to={`/app/categories/${cat.slug}`} className="category-card">
                <div className="category-card-icon">
                  <IconAsset
                    name={getCategoryIconName(cat.name)}
                    alt={cat.name}
                    size={40}
                  />
                </div>
                <span className="category-card-title">{cat.name.split(' ')[0]}</span>
                <span className="category-card-subtitle">{cat.name.split(' ').slice(1).join(' ')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-section">
        <div className="section-container">
          <div className="section-header">
            <h2>{home.featuredServices}</h2>
            <Link to="/app/search">{home.viewAll} <ChevronRight size={16} /></Link>
          </div>
          <div className="services-grid">
            {services.slice(0, 4).map(service => (
              <ServiceCard key={service.id} item={service} />
            ))}
          </div>
        </div>
      </section>

      {services.length > 4 && (
        <section className="section services-section">
          <div className="section-container">
            <div className="section-header">
              <h2>{home.popularServices}</h2>
              <Link to="/app/search">{home.viewAll} <ChevronRight size={16} /></Link>
            </div>
            <div className="services-grid">
              {services.slice(4, 8).map(service => (
                <ServiceCard key={service.id} item={service} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="how-it-works">
        <div className="section-container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{home.howItWorks}</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>{home.findService}</h3>
              <p>{home.findServiceDesc}</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>{home.placeOrder}</h3>
              <p>{home.placeOrderDesc}</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>{home.getDelivered}</h3>
              <p>{home.getDeliveredDesc}</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>{home.rateReview}</h3>
              <p>{home.rateReviewDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="trust-icon">
              <Shield size={24} />
            </div>
            <h3>{home.securePayment}</h3>
            <p>{home.securePaymentDesc}</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <Users size={24} />
            </div>
            <h3>{home.verifiedProfessionals}</h3>
            <p>{home.verifiedDesc}</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <Zap size={24} />
            </div>
            <h3>{home.support247}</h3>
            <p>{home.supportDesc}</p>
          </div>
        </div>
      </section>
    </>
  )
}
