import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Users, Award, Zap, ChevronRight } from 'lucide-react'

const benefits = [
  {
    icon: TrendingUp,
    title: 'Grow Your Income',
    description: 'Set your own prices and earn from your skills. The more orders you complete, the more you earn.'
  },
  {
    icon: Users,
    title: 'Access to Clients',
    description: 'Connect with businesses and individuals looking for your specific skills worldwide.'
  },
  {
    icon: Award,
    title: 'Build Your Reputation',
    description: 'Receive reviews and ratings that help you stand out and attract more clients.'
  },
  {
    icon: Zap,
    title: 'Flexible Schedule',
    description: 'Work whenever you want. Manage your own time and balance work with life.'
  }
]

export default function BecomeSellerPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/app/profile" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={18} />
        Back to Profile
      </Link>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          borderRadius: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '3rem',
          color: 'white',
          fontWeight: 800
        }}>
          R
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Start Selling on Remotiva</h1>
        <p style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto 32px', color: 'var(--text-secondary)' }}>
          Turn your skills into a thriving freelance business. Join thousands of professionals earning on Remotiva.
        </p>
        <button className="btn btn-primary btn-lg">
          Get Started
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Benefits */}
      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '48px' }}>Why Sell on Remotiva?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--primary-light)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <benefit.icon size={28} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{benefit.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '48px', border: '1px solid var(--border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '48px' }}>How to Get Started</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {[
            { step: '1', title: 'Create Your Profile', desc: 'Sign up and complete your profile with your skills, experience, and portfolio.' },
            { step: '2', title: 'List Your Services', desc: 'Create service packages that showcase what you offer and set your prices.' },
            { step: '3', title: 'Start Receiving Orders', desc: 'Clients will find your services and place orders. Deliver quality work on time.' },
            { step: '4', title: 'Build Your Reputation', desc: 'Collect reviews and ratings to establish credibility and attract more clients.' }
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'var(--primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '1.25rem',
                flexShrink: 0
              }}>
                {item.step}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: '64px' }}>
        <h2 style={{ marginBottom: '16px' }}>Ready to start your journey?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Join the Remotiva community and start earning today.</p>
        <button className="btn btn-primary btn-lg">
          Create Seller Account
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}