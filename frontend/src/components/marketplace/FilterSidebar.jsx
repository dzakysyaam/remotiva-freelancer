import { useState } from 'react'

export function FilterSidebar({ categories = [], onFilterChange }) {
  const [filters, setFilters] = useState({
    category: '',
    priceMin: '',
    priceMax: '',
    rating: '',
    deliveryTime: ''
  })

  function handleChange(field, value) {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  return (
    <aside className="filter-sidebar">
      <div className="filter-section">
        <h3>Category</h3>
        <div className="filter-options">
          <label className={`filter-option ${filters.category === '' ? 'active' : ''}`}>
            <input
              type="radio"
              name="category"
              checked={filters.category === ''}
              onChange={() => handleChange('category', '')}
            />
            All Categories
          </label>
          {categories.map(cat => (
            <label key={cat.id} className={`filter-option ${filters.category === cat.slug ? 'active' : ''}`}>
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.slug}
                onChange={() => handleChange('category', cat.slug)}
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Budget</h3>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => handleChange('priceMin', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => handleChange('priceMax', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-section">
        <h3>Rating</h3>
        <div className="filter-options">
          {[
            { value: '', label: 'All Ratings' },
            { value: '4.5', label: '4.5 & up' },
            { value: '4', label: '4.0 & up' },
            { value: '3', label: '3.0 & up' }
          ].map(opt => (
            <label key={opt.value} className={`filter-option ${filters.rating === opt.value ? 'active' : ''}`}>
              <input
                type="radio"
                name="rating"
                checked={filters.rating === opt.value}
                onChange={() => handleChange('rating', opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Delivery Time</h3>
        <div className="filter-options">
          {[
            { value: '', label: 'Any Time' },
            { value: '1', label: '24 hours' },
            { value: '3', label: '3 days' },
            { value: '7', label: '7 days' }
          ].map(opt => (
            <label key={opt.value} className={`filter-option ${filters.deliveryTime === opt.value ? 'active' : ''}`}>
              <input
                type="radio"
                name="delivery"
                checked={filters.deliveryTime === opt.value}
                onChange={() => handleChange('deliveryTime', opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
