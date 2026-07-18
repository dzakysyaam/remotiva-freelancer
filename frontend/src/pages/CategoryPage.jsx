import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Clock } from 'lucide-react'
import { api } from '../lib/api'
import { ServiceCard } from '../components/marketplace/ServiceCard'
import { category as catCopy } from '../data/uiCopy'

const filters = [
  { value: '', label: catCopy.all },
  { value: 'featured', label: catCopy.featured },
  { value: 'rating', label: catCopy.topRated },
  { value: 'newest', label: catCopy.newest }
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
          {catCopy.backToCategories}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{category?.name || catCopy.allServices}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{category?.description || catCopy.browseAll}</p>
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
        {services.length} {catCopy.servicesAvailable}
      </p>

      {/* Services Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--text-secondary)' }}>{catCopy.loadingServices}</p>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Star size={48} />
          </div>
          <h2>{catCopy.noServicesInCategory}</h2>
          <p>{catCopy.checkBackLater}</p>
          <Link to="/app/search" className="btn btn-primary">{catCopy.browseAllServices}</Link>
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
