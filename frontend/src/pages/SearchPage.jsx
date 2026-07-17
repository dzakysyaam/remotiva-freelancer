import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Grid, List } from 'lucide-react'
import { api } from '../lib/api'
import { ServiceCard, GigCardList } from '../components/marketplace/ServiceCard'
import { FilterSidebar } from '../components/marketplace/FilterSidebar'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const query = searchParams.get('q') || ''
  const categorySlug = searchParams.get('category') || ''
  const sortBy = searchParams.get('sort') || 'recommended'

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

  // Get current category name
  const currentCategory = categories.find(c => c.slug === categorySlug)
  const pageTitle = categorySlug
    ? currentCategory?.name || 'Services'
    : query
      ? `Results for "${query}"`
      : 'All Services'

  return (
    <div className="marketplace-layout">
      {/* Filter Sidebar */}
      <FilterSidebar
        categories={categories}
        selectedCategory={categorySlug}
        onFilterChange={handleCategoryChange}
        onClear={clearFilters}
      />

      {/* Main Content */}
      <div className="marketplace-content">
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
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
                  height: '44px',
                  padding: '0 16px 0 44px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>
              Search
            </button>
          </div>
        </form>

        {/* Results Header */}
        <div className="marketplace-header">
          <div className="marketplace-header-left">
            <h1>{pageTitle}</h1>
            <span className="marketplace-count" style={{ margin: 0 }}>({services.length} services)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* View Toggle */}
            <div className="marketplace-view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>

            <div className="marketplace-sort">
              <label>Sort by:</label>
              <select value={sortBy} onChange={handleSortChange}>
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active filters:</span>
            {query && (
              <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '4px' }}>
                Search: {query}
              </span>
            )}
            {categorySlug && (
              <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '4px' }}>
                {currentCategory?.name || categorySlug}
              </span>
            )}
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">
              <X size={14} />
              Clear all
            </button>
          </div>
        )}

        {/* Services Grid/List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={32} />
            </div>
            <h2>No services found</h2>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
            <button onClick={clearFilters} className="btn btn-primary">Clear filters</button>
          </div>
        ) : (
          <div className={`services-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {viewMode === 'grid' ? (
              services.map(service => (
                <ServiceCard key={service.id} item={service} />
              ))
            ) : (
              services.map(service => (
                <GigCardList key={service.id} item={service} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
