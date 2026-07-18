import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Users, Award, Zap, ChevronRight } from 'lucide-react'
import { Logo } from '../components/brand'
import { becomeSeller as bsCopy } from '../data/uiCopy'

const benefits = [
  {
    icon: TrendingUp,
    title: bsCopy.growIncome,
    description: bsCopy.growIncomeDesc
  },
  {
    icon: Users,
    title: bsCopy.accessClients,
    description: bsCopy.accessClientsDesc
  },
  {
    icon: Award,
    title: bsCopy.buildReputation,
    description: bsCopy.buildReputationDesc
  },
  {
    icon: Zap,
    title: bsCopy.flexibleSchedule,
    description: bsCopy.flexibleScheduleDesc
  }
]

const steps = [
  { step: '1', title: bsCopy.createProfile, desc: bsCopy.createProfileDesc },
  { step: '2', title: bsCopy.listServices, desc: bsCopy.listServicesDesc },
  { step: '3', title: bsCopy.receiveOrders, desc: bsCopy.receiveOrdersDesc },
  { step: '4', title: bsCopy.buildReputationStep, desc: bsCopy.buildReputationStepDesc }
]

export default function BecomeSellerPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <Link to="/app/profile" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={18} />
        {bsCopy.backToProfile}
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Logo size="lg" />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{bsCopy.mainTitle}</h1>
        <p style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto 32px', color: 'var(--text-secondary)' }}>
          {bsCopy.mainSubtitle}
        </p>
        <button className="btn btn-primary btn-lg">
          {bsCopy.getStarted}
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ marginBottom: '64px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '48px' }}>{bsCopy.whySellTitle}</h2>
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
                background: 'var(--primary-soft)',
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

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '48px', border: '1px solid var(--border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '48px' }}>{bsCopy.howToStartTitle}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {steps.map((item, index) => (
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

      <div style={{ textAlign: 'center', marginTop: '64px' }}>
        <h2 style={{ marginBottom: '16px' }}>{bsCopy.readyToStart}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{bsCopy.readyToStartDesc}</p>
        <button className="btn btn-primary btn-lg">
          {bsCopy.createSellerAccount}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
