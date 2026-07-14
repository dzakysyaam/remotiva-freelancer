import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Clock } from 'lucide-react'
import { api } from '../lib/api'
import { ServiceCard } from '../components/marketplace/ServiceCard'

const filters = [
  { value: '', label: 'All' },
  { value: 'featured', label: 'Featured' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' }
]

export default function CategoryPage() {
  const { slug } = useParams()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('')

  useEffect(() => {
    api.categories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    api.services({ category: slug })
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  const category = categories.find(c => c.slug === slug)

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link to="/app/search" className="btn btn-ghost" style={{ marginBottom: '16px' }}>
          <ArrowLeft size={18} />
          Back to Categories
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{category?.name || 'Services'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{category?.description || 'Browse all services in this category'}</p>
          </div>
          <div style={{ fontSize: '2rem' }}>{category?.icon || '◇'}</div>
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {filters.map(filter => (
          <button
            key={filter.value}
            className={`pill ${activeFilter === filter.value ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
        {services.length} services available
      </p>

      {/* Services Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Star size={48} />
          </div>
          <h2>No services in this category</h2>
          <p>Check back later or explore other categories.</p>
          <Link to="/app/search" className="btn btn-primary">Browse All Services</Link>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <ServiceCard key={service.id} item={service} />
          ))}
        </div>
      )}
    </div>
  )
}