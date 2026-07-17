import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, Globe, Menu, X, ChevronDown, Home, Compass, User } from 'lucide-react'
import { session } from '../../lib/api'
import { Logo } from '../brand'
import { useState, useEffect } from 'react'

const categoryIcons = {
  'desain-grafis': '🎨',
  'pemasaran-digital': '📢',
  'penulisan-terjemahan': '✍️',
  'video-animasi': '🎬',
  'pemrograman-teknologi': '💻',
  'data': '📊',
  'bisnis': '💼',
  'keuangan': '💰',
}

const categories = [
  { slug: 'desain-grafis', name: 'Graphic & Design' },
  { slug: 'pemasaran-digital', name: 'Digital Marketing' },
  { slug: 'penulisan-terjemahan', name: 'Writing & Translation' },
  { slug: 'video-animasi', name: 'Video & Animation' },
  { slug: 'pemrograman-teknologi', name: 'Programming & Tech' },
  { slug: 'data', name: 'Data & Analytics' },
]

export function Shell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const isAuthPage = location.pathname.includes('/auth')

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  function logout() {
    session.token = null
    session.user = null
    navigate('/auth/login')
  }

  if (isAuthPage) {
    return <Outlet />
  }

  const user = session.user || { name: 'Guest' }

  return (
    <div className="app-container">
      <header className="main-navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <NavLink to="/app" className="navbar-logo">
              <Logo size="sm" />
            </NavLink>

            <div className="navbar-search">
              <Search size={18} />
              <input type="text" placeholder="Search for any service..." onFocus={() => navigate('/app/search')} />
            </div>
          </div>

          <nav className="navbar-center">
            <div
              className="nav-dropdown"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className="nav-dropdown-trigger">
                Categories <ChevronDown size={14} />
              </button>
              {showCategories && (
                <div className="nav-dropdown-menu">
                  {categories.map(cat => (
                    <NavLink
                      key={cat.slug}
                      to={`/app/categories/${cat.slug}`}
                      className="nav-dropdown-item"
                    >
                      <span>{categoryIcons[cat.slug] || '📁'}</span>
                      {cat.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
            <NavLink to="/app/search" className="nav-link">Explore</NavLink>
            <NavLink to="/app/become-seller" className="nav-link">Become a Seller</NavLink>
          </nav>

          <div className="navbar-right">
            <NavLink to="/app/orders" className="nav-icon-btn" title="My Orders" style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
            </NavLink>
            <NavLink to="/app/saved" className="nav-icon-btn" title="Saved">
              <Heart size={20} />
            </NavLink>

            <div className="navbar-divider" />

            <NavLink to="/app/profile" className="navbar-user">
              <div className="user-avatar-sm">
                {user.name?.[0]?.toUpperCase() || 'G'}
              </div>
              <span className="user-name">{user.name?.split(' ')[0] || 'Guest'}</span>
            </NavLink>

            <button className="btn-join" onClick={() => navigate('/auth/register')}>
              Join
            </button>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <nav className="mobile-nav">
          <div className="mobile-nav-section">
            <h4>Menu</h4>
            <NavLink to="/app"><Home size={20} /> Home</NavLink>
            <NavLink to="/app/search"><Compass size={20} /> Explore Services</NavLink>
            <NavLink to="/app/orders"><ShoppingCart size={20} /> My Orders</NavLink>
            <NavLink to="/app/saved"><Heart size={20} /> Saved Services</NavLink>
            <NavLink to="/app/profile"><User size={20} /> Profile</NavLink>
          </div>
          <div className="mobile-nav-section">
            <h4>Categories</h4>
            {categories.map(cat => (
              <NavLink key={cat.slug} to={`/app/categories/${cat.slug}`}>
                <span>{categoryIcons[cat.slug] || '📁'}</span> {cat.name}
              </NavLink>
            ))}
          </div>
          <div className="mobile-nav-actions">
            <button onClick={logout} className="btn btn-secondary" style={{ width: '100%' }}>
              Sign Out
            </button>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <NavLink to="/app" className="navbar-logo">
                <Logo size="sm" />
              </NavLink>
              <p className="footer-tagline">
                Connect with world-class talent. Find the perfect freelancer for any project.
              </p>
              <div className="footer-social">
                <a href="#" aria-label="Twitter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h4>Categories</h4>
              <ul>
                <li><NavLink to="/app/categories/desain-grafis">Graphic & Design</NavLink></li>
                <li><NavLink to="/app/categories/pemasaran-digital">Digital Marketing</NavLink></li>
                <li><NavLink to="/app/categories/penulisan-terjemahan">Writing & Translation</NavLink></li>
                <li><NavLink to="/app/categories/video-animasi">Video & Animation</NavLink></li>
                <li><NavLink to="/app/categories/pemrograman-teknologi">Programming & Tech</NavLink></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>About</h4>
              <ul>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press & News</a></li>
                <li><a href="#">Partnerships</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help & Support</a></li>
                <li><a href="#">Trust & Safety</a></li>
                <li><a href="#">Selling on Remotiva</a></li>
                <li><a href="#">Buying on Remotiva</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              <span>&copy; {new Date().getFullYear()} Remotiva. All rights reserved.</span>
            </div>
            <div className="footer-locale">
              <Globe size={14} />
              <span>English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header-component">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  )
}
