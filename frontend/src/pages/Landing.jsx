import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Shield, Clock, Users, Award } from 'lucide-react'
import { api } from '../lib/api'
import { ServiceCard, CategoryCard } from '../components/marketplace/ServiceCard'

export default function Landing() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    api.categories().then(setCategories).catch(console.error)
    api.services({ limit: 8 }).then(setServices).catch(console.error)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/app/search')
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <h1>Find trusted freelance talent for every digital project</h1>
          <p>Remotiva connects businesses with skilled freelancers for design, development, writing, marketing, and more.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="What service are you looking for today?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <Search size={18} />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Popular Categories</h2>
          <Link to="/app/search">View all <ArrowRight size={16} /></Link>
        </div>
        <div className="categories-grid">
          {categories.slice(0, 6).map(cat => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="section" style={{ background: '#f5f7fa', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section-header">
          <h2>Featured Services</h2>
          <Link to="/app/search">View all <ArrowRight size={16} /></Link>
        </div>
        <div className="services-grid">
          {services.map(service => (
            <ServiceCard key={service.id} item={service} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
          <h2>How It Works</h2>
          <p style={{ maxWidth: '500px', marginTop: '12px', color: 'rgba(255,255,255,0.7)' }}>Get your projects done in three simple steps</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Find a Service</h3>
            <p>Browse through thousands of services from verified freelancers across various categories.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Place Your Order</h3>
            <p>Select the package that fits your needs and place your order with secure payment.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Get It Delivered</h3>
            <p>Receive your project on time with unlimited revisions until you're satisfied.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Rate Your Experience</h3>
            <p>Share your feedback and help others find quality freelancers on the platform.</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="trust-icon">
              <Shield size={24} />
            </div>
            <h3>Secure Payments</h3>
            <p>Your payment is protected until you approve the deliverable. No upfront risk.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <Clock size={24} />
            </div>
            <h3>On-Time Delivery</h3>
            <p>Freelancers are committed to deadlines. Get your work when you need it.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <Users size={24} />
            </div>
            <h3>Verified Talent</h3>
            <p>All freelancers go through a verification process to ensure quality and trust.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '12px' }}>Ready to get started?</h2>
        <p style={{ maxWidth: '500px', margin: '0 auto 28px', color: 'var(--text-secondary)' }}>
          Join thousands of businesses and freelancers on Remotiva today.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/auth/register" className="btn btn-primary btn-lg" style={{ background: '#1dbf73' }}>
            Get Started
            <ArrowRight size={18} />
          </Link>
          <Link to="/app/search" className="btn btn-secondary btn-lg">
            Browse Services
          </Link>
        </div>
      </section>
    </>
  )
}
