/**
 * Remotiva Logo Component
 *
 * A shared logo component used across the application.
 * Supports different variants for light/dark backgrounds.
 */

export function Logo({ variant = 'default', size = 'md', className = '' }) {
  const sizes = {
    sm: { icon: 28, text: '1.125rem' },
    md: { icon: 36, text: '1.5rem' },
    lg: { icon: 44, text: '1.75rem' },
  }

  const { icon: iconSize, text: textSize } = sizes[size] || sizes.md

  const isInverse = variant === 'inverse'
  const textColor = isInverse ? '#ffffff' : 'var(--text)'
  const iconBgColor = isInverse ? '#ffffff' : 'linear-gradient(135deg, #2f78f6 0%, #1f5ed8 100%)'

  return (
    <div
      className={`logo ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Logo Icon - Modern geometric R mark */}
      <div
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          background: iconBgColor,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize * 0.6}
          height={iconSize * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 8V16H12.5C15.5 16 17 14.5 17 12C17 9.5 15.5 8 12.5 8H7ZM10 10H12.5C14 10 15 10.5 15 12C15 13.5 14 14 12.5 14H10V10Z"
            fill={isInverse ? '#2f78f6' : '#ffffff'}
          />
          <path
            d="M7 17H17V19H7V17Z"
            fill={isInverse ? '#2f78f6' : '#ffffff'}
          />
        </svg>
      </div>

      {/* Logo Text */}
      <span
        style={{
          fontSize: textSize,
          fontWeight: 800,
          color: textColor,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        remotiva
      </span>
    </div>
  )
}

export default Logo
