import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'

export default function HeroVideoSection() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  const categoryPills = [
    t("hero.websiteDevelopment"),
    t("hero.logoDesign"),
    t("hero.aiServices"),
    t("hero.digitalMarketing"),
    t("hero.videoEditing"),
  ]

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/app/search')
    }
  }

  function handlePillClick(category) {
    navigate(`/app/search?q=${encodeURIComponent(category)}`)
  }

  return (
    <section className="hero-video">
      <video
        className="hero-video__media"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/assets/freelancer_remotiva.mp4" type="video/mp4" />
      </video>

      <div className="hero-video__overlay" />

      <div className="hero-video__content">
        <h1>{t("hero.buyerTitle")}</h1>
        <p>{t("hero.buyerSubtitle")}</p>

        <form className="hero-video__search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder={t("nav.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">{t("hero.searchButton")}</button>
        </form>

        <div className="hero-video__pills">
          {categoryPills.map(pill => (
            <button
              key={pill}
              type="button"
              onClick={() => handlePillClick(pill)}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
