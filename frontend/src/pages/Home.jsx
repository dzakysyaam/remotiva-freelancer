import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Shield, Users, Zap, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'
import { ServiceCard, CategoryCard } from '../components/marketplace/ServiceCard'

const categoryIcons = {
  'desain-grafis': { icon: '🎨', color: '#1dbf73' },
  'pemasaran-digital': { icon: '📢', color: '#f57924' },
  'penulisan-terjemahan': { icon: '✍️', color: '#714dd9' },
  'video-animasi': { icon: '🎬', color: '#ff6b6b' },
  'pemrograman-teknologi': { icon: '💻', color: '#0cb5c9' },
  'data': { icon: '📊', color: '#e74c3c' },
  'bisnis': { icon: '💼', color: '#6366f1' },
  'keuangan': { icon: '💰', color: '#2eca8b' },
}

const featuredServices = [
  {
    id: 1,
    title: 'Professional Logo Design for Your Business',
    image_url: '/assets/frame-81.jpg',
    seller_name: 'Nadia Studio',
    seller_level: 'Top Rated',
    price: 350000,
    rating: 4.9,
    delivery_days: 3
  },
  {
    id: 2,
    title: 'Build Professional Company Website',
    image_url: '/assets/home.jpg',
    seller_name: 'Andara Tech',
    seller_level: 'Level 2',
    price: 1500000,
    rating: 4.8,
    delivery_days: 10
  },
  {
    id: 3,
    title: 'Social Media Marketing Campaign',
    image_url: '/assets/frame-84.jpg',
    seller_name: 'Kreasi Media',
    seller_level: 'Level 2',
    price: 900000,
    rating: 4.7,
    delivery_days: 7
  },
  {
    id: 4,
    title: 'Professional Video Editing Service',
    image_url: '/assets/home-2.jpg',
    seller_name: 'Pixel Works',
    seller_level: 'Level 1',
    price: 600000,
    rating: 4.7,
    delivery_days: 5
  },
  {
    id: 5,
    title: 'Mobile App Development iOS Android',
    image_url: '/assets/frame-81.jpg',
    seller_name: 'AppCraft Studio',
    seller_level: 'Top Rated',
    price: 2500000,
    rating: 5.0,
    delivery_days: 14
  },
  {
    id: 6,
    title: 'SEO Optimization for Higher Rankings',
    image_url: '/assets/home.jpg',
    seller_name: 'RankUp Digital',
    seller_level: 'Level 2',
    price: 750000,
    rating: 4.6,
    delivery_days: 5
  },
  {
    id: 7,
    title: 'Professional Copywriting Service',
    image_url: '/assets/frame-84.jpg',
    seller_name: 'WordCraft',
    seller_level: 'Level 1',
    price: 250000,
    rating: 4.5,
    delivery_days: 3
  },
  {
    id: 8,
    title: 'Brand Identity Design Package',
    image_url: '/assets/home-2.jpg',
    seller_name: 'Studio Hype',
    seller_level: 'Top Rated',
    price: 1200000,
    rating: 4.9,
    delivery_days: 7
  }
]

export default function Home() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]))
    api.services({ limit: 8 }).then(setServices).catch(() => setServices([]))
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
          <h1>Find the perfect freelance services for your business</h1>
          <p>Connect with talented professionals who can help bring your projects to life. Quality work delivered on time, every time.</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for any service..."
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

      {/* Categories */}
      <section className="section categories-section">
        <div className="section-header">
          <h2>Explore Categories</h2>
          <Link to="/app/search">View all <ChevronRight size={16} /></Link>
        </div>
        <div className="categories-grid">
          {categories.slice(0, 6).map(cat => {
            const catData = categoryIcons[cat.slug] || { icon: '📁', color: '#1dbf73' }
            return (
              <Link key={cat.id} to={`/app/categories/${cat.slug}`} className="category-card-fiverr">
                <div className="category-card-icon">
                  <span>{catData.icon}</span>
                </div>
                <h3>{cat.name.split(' ')[0]}</h3>
                <p>{cat.name.split(' ').slice(1).join(' ')}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Services */}
      <section className="services-section">
        <div className="section-full">
          <div className="section-header">
            <h2>Featured Services</h2>
            <Link to="/app/search">View all <ChevronRight size={16} /></Link>
          </div>
          <div className="services-grid">
            {featuredServices.map(service => (
              <ServiceCard key={service.id} item={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services from API */}
      {services.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Popular Services</h2>
            <Link to="/app/search">View all <ChevronRight size={16} /></Link>
          </div>
          <div className="services-grid">
            {services.slice(0, 4).map(service => (
              <ServiceCard key={service.id} item={service} />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="how-it-works">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>How It Works</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Find Your Service</h3>
            <p>Browse through thousands of services from verified professionals across all categories.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Place Your Order</h3>
            <p>Select the perfect package for your needs and checkout securely with our payment system.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Get Delivered</h3>
            <p>Receive your completed project on time with revisions until you are 100% satisfied.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Rate & Review</h3>
            <p>Share your experience to help others find great freelancers on Remotiva.</p>
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
            <h3>Secure Payment</h3>
            <p>Your payment is protected until you approve the final deliverable.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <Users size={24} />
            </div>
            <h3>Verified Professionals</h3>
            <p>All freelancers are vetted and verified for your peace of mind.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <Zap size={24} />
            </div>
            <h3>24/7 Support</h3>
            <p>Our support team is always here to help whenever you need assistance.</p>
          </div>
        </div>
      </section>
    </>
  )
}
