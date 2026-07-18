const sizes = {
  sm: { mark: '34px', text: '20px' },
  md: { mark: '44px', text: '26px' },
  lg: { mark: '72px', text: '38px' },
  xl: { mark: '120px', text: '48px' },
}

export function Logo({ variant = 'default', size = 'md', showText = true, className = '' }) {
  const config = sizes[size] || sizes.md
  const isInverse = variant === 'inverse'
  const textColor = isInverse ? '#ffffff' : 'var(--text)'
  const isXl = size === 'xl'

  return (
    <div className={`brand-logo brand-logo--${size} ${isInverse ? 'brand-logo--inverse' : ''} ${className}`}>
      <img
        src="/assets/logo_remotiva.png"
        alt="Remotiva"
        className="brand-logo-mark"
        style={{ height: config.mark, width: 'auto' }}
      />
      {showText && (
        <span
          className="brand-logo-text"
          style={{
            fontSize: config.text,
            fontWeight: 800,
            color: textColor,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          remotiva
        </span>
      )}
    </div>
  )
}

export default Logo