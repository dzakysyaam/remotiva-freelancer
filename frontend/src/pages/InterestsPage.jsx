import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, Check, ChevronLeft } from 'lucide-react'
import { api } from '../lib/api'
import { interests as interestsCopy } from '../data/uiCopy'

// Interest categories with Indonesian labels
const defaultInterests = [
  'Konten Media Sosial',
  'Desain Identitas Merek',
  'Desain Siap Cetak',
  'Edit Foto & Gambar',
  'Fotografi Profesional',
  'Solusi E-commerce',
  'Pengembangan Website',
  'Pengembangan Aplikasi Mobile',
  'SEO & Pemasaran',
  'Editing Video',
  'Penulisan',
  'Jasa Terjemahan'
]

export default function InterestsPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.profile()
      .then(res => {
        if (res?.interests?.length > 0) {
          setSelected(res.interests)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function toggle(item) {
    setSelected(prev =>
      prev.includes(item)
        ? prev.filter(x => x !== item)
        : [...prev, item]
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.updateInterests({ interests: selected })
      navigate('/app')
    } catch (err) {
      console.error('Failed to save interests:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/app/profile" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ChevronLeft size={18} />
        {interestsCopy.backToProfile}
      </Link>

      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={28} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{interestsCopy.title}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{interestsCopy.subtitle}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {defaultInterests.map(interest => (
          <button
            key={interest}
            onClick={() => toggle(interest)}
            style={{
              padding: '16px 20px',
              border: `2px solid ${selected.includes(interest) ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              background: selected.includes(interest) ? 'var(--primary-light)' : 'var(--surface)',
              color: selected.includes(interest) ? 'var(--primary)' : 'var(--text)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left'
            }}
          >
            <span>{interest}</span>
            {selected.includes(interest) && <Check size={18} />}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? interestsCopy.saving : interestsCopy.saveInterests}
        </button>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {selected.length} {interestsCopy.selected}
        </span>
      </div>
    </div>
  )
}
