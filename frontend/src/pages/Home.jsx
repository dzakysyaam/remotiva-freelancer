import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Star, TrendingUp, Briefcase, Shield, Zap, Users, PenTool, Megaphone, FileText, Video, Code, Database, Building } from 'lucide-react'
import { api } from '../lib/api'
import { ServiceCard } from '../components/marketplace/ServiceCard'

const categoryIcons = {
  'desain-grafis': { icon: PenTool, color: '#ff6b6b' },
  'pemasaran-digital': { icon: Megaphone, color: '#4ecdc4' },
  'penulisan-terjemahan': { icon: FileText, color: '#45b7d1' },
  'video-animasi': { icon: Video, color: '#96ceb4' },
  'pemrograman-teknologi': { icon: Code, color: '#6c5ce7' },
  'data': { icon: Database, color: '#fd79a8' },
  'bisnis': { icon: Building, color: '#f9ca24' },
  'keuangan': { icon: TrendingUp, color: '#6ab04c' },
}

const featuredServices = [
  {
    id: 1,
    title: 'Professional Logo Design Package',
    image_url: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600&h=400&fit=crop',
    seller_name: 'Nadia Studio',
    seller_level: 'Top Rated Seller',
    price: 350000,
    rating: 4.9,
    delivery_days: 3
  },
  {
    id: 2,
    title: 'Full Stack Web Development',
    image_url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop',
    seller_name: 'Andara Tech',
    seller_level: 'Level 2 Seller',
    price: 1500000,
    rating: 4.8,
    delivery_days: 10
  },
  {
    id: 3,
    title: 'Social Media Marketing Campaign',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
    seller_name: 'Kreasi Media',
    seller_level: 'Level 2 Seller',
    price: 900000,
    rating: 4.7,
    delivery_days: 7
  },
  {
    id: 4,
    title: 'Professional Video Editing',
    image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=400&fit=crop',
    seller_name: 'Kreasi Media',
    seller_level: 'Level 2 Seller',
    price: 600000,
    rating: 4.7,
    delivery_days: 5
  }
]

export default function Home() {
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

  function getCategoryIcon(slug) {
    return categoryIcons[slug] || { icon: Star, color: '#6c5ce7' }
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
              <Search size={20} />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="section categories-section">
        <div className="section-header">
          <h2>Explore Categories</h2>
          <Link to="/app/search">View all</Link>
        </div>
        <div className="categories-grid">
          {categories.slice(0, 6).map(cat => {
            const { icon: Icon, color } = getCategoryIcon(cat.slug)
            return (
              <Link key={cat.id} to={`/app/categories/${cat.slug}`} className="category-card">
                <div className="category-icon" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <h3>{cat.name.split(' & ')[0].split(' ')[0]}</h3>
                <p>{cat.description?.substring(0, 40)}...</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Services */}
      <section className="services-section">
        <div className="section">
          <div className="section-header">
            <h2>Featured Services</h2>
            <Link to="/app/search">View all</Link>
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
            <Link to="/app/search">View all</Link>
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
        <div className="section">
          <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', marginBottom: '48px' }}>
            <h2>How It Works</h2>
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
              <p>Receive your completed project on time with revisions until you're 100% satisfied.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Rate & Review</h3>
              <p>Share your experience to help others find great freelancers on Remotiva.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="trust-icon">
              <Shield size={32} />
            </div>
            <h3>Secure Payment</h3>
            <p>Your payment is protected until you approve the final deliverable. Your money is safe with us.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <Users size={32} />
            </div>
            <h3>Verified Professionals</h3>
            <p>All freelancers are vetted and verified. Read reviews and choose with confidence.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <Zap size={32} />
            </div>
            <h3>24/7 Support</h3>
            <p>Our support team is always here to help. Get assistance anytime you need it.</p>
          </div>
        </div>
      </section>
    </>
  )
}
