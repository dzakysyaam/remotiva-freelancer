import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, Globe, Menu, X, ChevronDown, Home, User } from 'lucide-react'
import { session } from '../../lib/api'
import { Logo } from '../brand'
import { useState, useEffect } from 'react'
import IconAsset from '../ui/IconAsset'
import { getCategoryIconName } from '../../data/iconMap'
import { nav } from '../../data/uiCopy'
import { LanguageSelector } from '../ui/LanguageSelector'
import { useLanguage } from '../../i18n/LanguageContext'

// Categories with Indonesian names for display
const categories = [
  { slug: 'desain-grafis', name: 'Desain Grafis' },
  { slug: 'pemasaran-digital', name: 'Pemasaran Digital' },
  { slug: 'penulisan-terjemahan', name: 'Penulisan & Terjemahan' },
  { slug: 'video-animasi', name: 'Video & Animasi' },
  { slug: 'pemrograman-teknologi', name: 'Pemrograman & Teknologi' },
  { slug: 'data', name: 'Data & Analitik' },
]

export function Shell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const isAuthPage = location.pathname.includes('/auth')
  const { t } = useLanguage()

  useEffect(() => {
    setMobileMenuOpen(false)
    setShowCategories(false)
  }, [location.pathname])

  function logout() {
    session.token = null
    session.user = null
    navigate('/auth/login')
  }

  if (isAuthPage) {
    return <Outlet />
  }

  const user = session.user
  const isLoggedIn = !!session.token && !!user

  return (
    <div className="app-container">
      <header className="main-navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <NavLink to="/app" className="navbar-logo">
              <Logo size="md" />
            </NavLink>
          </div>

          <div className="navbar-search">
            <Search size={18} />
            <input
              type="text"
              placeholder={t("nav.searchPlaceholder")}
              onFocus={() => navigate('/app/search')}
            />
          </div>

          <nav className="navbar-center">
            <NavLink to="/app" className="nav-link nav-home">
              <Home size={16} />
              {t("nav.home")}
            </NavLink>
            <div
              className="nav-dropdown"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button className="nav-dropdown-trigger">
                {t("nav.categories")} <ChevronDown size={14} />
              </button>
              {showCategories && (
                <div className="nav-dropdown-menu">
                  {categories.map(cat => (
                    <NavLink
                      key={cat.slug}
                      to={`/app/categories/${cat.slug}`}
                      className="nav-dropdown-item"
                    >
                      <span className="nav-cat-icon">
                        <IconAsset name={getCategoryIconName(cat.name)} alt={cat.name} size={18} />
                      </span>
                      {cat.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
            <NavLink to="/app/search" className="nav-link">{t("nav.explore")}</NavLink>
            <NavLink to="/app/become-seller" className="nav-link">{t("nav.becomeSeller")}</NavLink>
          </nav>

          <div className="navbar-right">
            <NavLink to="/app/orders" className="nav-icon-btn" title={t("nav.myOrders")}>
              <ShoppingCart size={20} />
            </NavLink>
            <NavLink to="/app/saved" className="nav-icon-btn" title={t("nav.savedServices")}>
              <Heart size={20} />
            </NavLink>

            {isLoggedIn ? (
              <>
                <div className="navbar-divider" />
                <NavLink to="/app/profile" className="user-menu">
                  <div className="user-avatar">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                </NavLink>
              </>
            ) : (
              <>
                <button
                  className="btn-signin"
                  onClick={() => navigate('/auth/login')}
                >
                  {t("nav.signIn")}
                </button>
                <button
                  className="btn-join"
                  onClick={() => navigate('/auth/register')}
                >
                  {t("nav.join")}
                </button>
              </>
            )}

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
            <h4>{t("nav.menu")}</h4>
            <NavLink to="/app"><Home size={18} /> {t("nav.home")}</NavLink>
            <NavLink to="/app/search"><Search size={18} /> {t("nav.explore")}</NavLink>
            <NavLink to="/app/orders"><ShoppingCart size={18} /> {t("nav.myOrders")}</NavLink>
            <NavLink to="/app/saved"><Heart size={18} /> {t("nav.savedServices")}</NavLink>
            <NavLink to="/app/profile"><User size={18} /> Profile</NavLink>
          </div>
          <div className="mobile-nav-section">
            <h4>{t("nav.categories")}</h4>
            {categories.map(cat => (
              <NavLink key={cat.slug} to={`/app/categories/${cat.slug}`}>
                <span className="nav-cat-icon">
                  <IconAsset name={getCategoryIconName(cat.name)} alt={cat.name} size={18} />
                </span> {cat.name}
              </NavLink>
            ))}
          </div>
          {isLoggedIn ? (
            <div className="mobile-nav-actions">
              <button onClick={logout} className="btn btn-secondary" style={{ width: '100%' }}>
                {t("nav.signOut")}
              </button>
            </div>
          ) : (
            <div className="mobile-nav-actions">
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '8px' }}
                onClick={() => { navigate('/auth/register'); setMobileMenuOpen(false); }}
              >
                {t("nav.join")} Remotiva
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false); }}
              >
                {t("nav.signIn")}
              </button>
            </div>
          )}
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
                {t("footer.tagline")}
              </p>
              <div className="footer-social">
                <a href="https://x.com/elonmusk" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="footer-social-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/muhammaddzakysyamhaidar" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.instagram.com/dzakysyaam" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h4>{t("nav.categories")}</h4>
              <ul>
                <li><NavLink to="/app/categories/desain-grafis">{t("footer.graphicDesign")}</NavLink></li>
                <li><NavLink to="/app/categories/pemasaran-digital">{t("footer.digitalMarketing")}</NavLink></li>
                <li><NavLink to="/app/categories/penulisan-terjemahan">{t("footer.writingTranslation")}</NavLink></li>
                <li><NavLink to="/app/categories/video-animasi">{t("footer.videoAnimation")}</NavLink></li>
                <li><NavLink to="/app/categories/pemrograman-teknologi">{t("footer.programmingTech")}</NavLink></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t("footer.about")}</h4>
              <ul>
                <li><a href="#">{t("footer.careers")}</a></li>
                <li><a href="#">{t("footer.pressNews")}</a></li>
                <li><a href="#">{t("footer.partnerships")}</a></li>
                <li><a href="#">{t("footer.privacyPolicy")}</a></li>
                <li><a href="#">{t("footer.termsOfService")}</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t("footer.support")}</h4>
              <ul>
                <li><a href="#">{t("footer.helpSupport")}</a></li>
                <li><a href="#">{t("footer.trustSafety")}</a></li>
                <li><a href="#">{t("footer.selling")}</a></li>
                <li><a href="#">{t("footer.buying")}</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              <span>&copy; {new Date().getFullYear()} Remotiva. {t("footer.copyright")}</span>
            </div>
            <div className="footer-locale">
              <LanguageSelector />
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

export function EmptyState({ title, body, action, iconType = 'chat' }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon-container">
        <IconAsset name={`empty-${iconType}`} alt={title} size={64} />
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  )
}
