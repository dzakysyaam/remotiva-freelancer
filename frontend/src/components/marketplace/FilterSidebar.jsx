import { useState } from 'react'
import { X } from 'lucide-react'

export function FilterSidebar({
  categories = [],
  selectedCategory = '',
  onFilterChange,
  onClear
}) {
  const [filters, setFilters] = useState({
    category: selectedCategory,
    priceMin: '',
    priceMax: '',
    sellerLevel: [],
    onlineStatus: false,
    language: ''
  })

  function handleChange(field, value) {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange?.(field === 'category' ? value : selectedCategory)
  }

  function handleLevelToggle(level) {
    const levels = filters.sellerLevel.includes(level)
      ? filters.sellerLevel.filter(l => l !== level)
      : [...filters.sellerLevel, level]
    handleChange('sellerLevel', levels)
  }

  function clearAll() {
    const cleared = {
      category: '',
      priceMin: '',
      priceMax: '',
      sellerLevel: [],
      onlineStatus: false,
      language: ''
    }
    setFilters(cleared)
    onClear?.()
  }

  const hasActiveFilters = filters.category || filters.priceMin || filters.priceMax ||
    filters.sellerLevel.length > 0 || filters.onlineStatus

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button className="filter-clear" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div className="filter-section">
        <h4>Category</h4>
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

      <div className="filter-divider" />

      {/* Budget Range */}
      <div className="filter-section">
        <h4>Budget</h4>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => handleChange('priceMin', e.target.value)}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => handleChange('priceMax', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-divider" />

      {/* Seller Level */}
      <div className="filter-section">
        <h4>Seller Level</h4>
        <div className="filter-options">
          {[
            { value: 'top_rated', label: 'Top Rated', color: '#f59e0b' },
            { value: 'level_2', label: 'Level 2', color: '#1dbf73' },
            { value: 'level_1', label: 'Level 1', color: '#0a95b5' },
            { value: 'new', label: 'New Seller', color: '#8c99ad' }
          ].map(level => (
            <label key={level.value} className="filter-option">
              <input
                type="checkbox"
                checked={filters.sellerLevel.includes(level.value)}
                onChange={() => handleLevelToggle(level.value)}
              />
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: level.color,
                flexShrink: 0
              }} />
              {level.label}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Delivery Time */}
      <div className="filter-section">
        <h4>Delivery Time</h4>
        <div className="filter-options">
          {[
            { value: '', label: 'Any Time' },
            { value: '24h', label: 'Express 24H' },
            { value: '3', label: 'Up to 3 days' },
            { value: '7', label: 'Up to 7 days' }
          ].map(opt => (
            <label key={opt.value} className="filter-option">
              <input
                type="radio"
                name="delivery"
                value={opt.value}
                defaultChecked={opt.value === ''}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Online Status */}
      <div className="filter-section">
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.onlineStatus}
            onChange={(e) => handleChange('onlineStatus', e.target.checked)}
          />
          Online sellers only
        </label>
      </div>
    </aside>
  )
}
