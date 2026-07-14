import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { api } from '../lib/api'
import { ServiceCard } from '../components/marketplace/ServiceCard'
import { FilterSidebar } from '../components/marketplace/FilterSidebar'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const query = searchParams.get('q') || ''
  const categorySlug = searchParams.get('category') || ''
  const sortBy = searchParams.get('sort') || 'featured'

  useEffect(() => {
    api.categories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (query) params.q = query
    if (categorySlug) params.category = categorySlug

    api.services(params)
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [query, categorySlug])

  function handleSearch(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const q = formData.get('q')
    setSearchParams(prev => {
      if (q) prev.set('q', q)
      else prev.delete('q')
      return prev
    })
  }

  function handleCategoryChange(slug) {
    setSearchParams(prev => {
      if (slug) prev.set('category', slug)
      else prev.delete('category')
      return prev
    })
  }

  function handleSortChange(e) {
    setSearchParams(prev => {
      prev.set('sort', e.target.value)
      return prev
    })
  }

  function clearFilters() {
    setSearchParams({})
  }

  const hasFilters = query || categorySlug

  return (
    <div className="marketplace-layout">
      {/* Filter Sidebar */}
      <FilterSidebar
        categories={categories}
        onFilterChange={(filters) => handleCategoryChange(filters.category)}
      />

      {/* Main Content */}
      <div className="marketplace-content">
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search for any service..."
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px 0 44px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={18} />
              Filters
            </button>
          </div>
        </form>

        {/* Active Filters */}
        {hasFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Active filters:</span>
            {query && (
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                Search: {query}
              </span>
            )}
            {categorySlug && (
              <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {categories.find(c => c.slug === categorySlug)?.name || categorySlug}
              </span>
            )}
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">
              <X size={14} />
              Clear
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="marketplace-header">
          <div>
            <h1>
              {categorySlug
                ? categories.find(c => c.slug === categorySlug)?.name || 'Services'
                : query
                  ? `Results for "${query}"`
                  : 'All Services'
              }
            </h1>
            <p className="marketplace-count">{services.length} services found</p>
          </div>
          <div className="marketplace-sort">
            <select value={sortBy} onChange={handleSortChange}>
              <option value="featured">Featured</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={48} />
            </div>
            <h2>No services found</h2>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
            <button onClick={clearFilters} className="btn btn-primary">Clear filters</button>
          </div>
        ) : (
          <div className="services-grid">
            {services.map(service => (
              <ServiceCard key={service.id} item={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}