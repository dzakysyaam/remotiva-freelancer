export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const classes = `btn btn-${variant} ${size === 'lg' ? 'btn-lg' : ''} ${size === 'sm' ? 'btn-sm' : ''} ${className}`
  return <button className={classes} {...props}>{children}</button>
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label>{label}</label>}
      <input {...props} />
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label>{label}</label>}
      <select {...props}>{children}</select>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

export function Badge({ children, variant = 'default', className = '' }) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>
}

export function Card({ children, className = '', ...props }) {
  return <div className={`card ${className}`} {...props}>{children}</div>
}

export function Avatar({ name, size = 'md', className = '' }) {
  const sizeMap = { sm: 32, md: 48, lg: 72, xl: 120 }
  const px = sizeMap[size] || sizeMap.md
  const fontSize = px * 0.4

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{
        width: px,
        height: px,
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize
      }}
    >
      {name?.[0]?.toUpperCase() || 'U'}
    </div>
  )
}

export function Rating({ value, showValue = true, className = '' }) {
  return (
    <span className={`rating ${className}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      {showValue ? Number(value || 0).toFixed(1) : ''}
    </span>
  )
}

export function Spinner({ size = 'md' }) {
  return (
    <div className={`spinner spinner-${size}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
      </svg>
    </div>
  )
}
