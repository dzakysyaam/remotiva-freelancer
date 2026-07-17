import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../lib/api'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.orders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock size={14} />
      case 'in progress':
        return <Package size={14} />
      case 'completed':
        return <CheckCircle size={14} />
      case 'cancelled':
        return <XCircle size={14} />
      default:
        return <Clock size={14} />
    }
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending'
      case 'in progress':
        return 'in-progress'
      case 'completed':
        return 'completed'
      case 'cancelled':
        return 'cancelled'
      default:
        return 'pending'
    }
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    inProgress: orders.filter(o => o.status === 'In Progress').length,
    completed: orders.filter(o => o.status === 'Completed').length
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1>My Orders</h1>
        <p>Manage your orders and track progress</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Orders</h4>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>Pending</h4>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h4>In Progress</h4>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.inProgress}</div>
        </div>
        <div className="stat-card">
          <h4>Completed</h4>
          <div className="stat-value" style={{ color: '#1dbf73' }}>{stats.completed}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table">
        <div className="table-header">
          <div>Service</div>
          <div>Status</div>
          <div>Price</div>
          <div>Date</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={32} />
            </div>
            <h2>No orders yet</h2>
            <p>Start by exploring our services and placing your first order.</p>
            <Link to="/app/search" className="btn btn-primary">Browse Services</Link>
          </div>
        ) : (
          orders.map(order => (
            <div className="table-row" key={order.id}>
              <div className="order-service">
                <div className="order-service-info">
                  <h4>{order.service_title}</h4>
                  <span>{order.package_name}</span>
                </div>
              </div>
              <div>
                <span className={`status-badge ${getStatusClass(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span style={{ marginLeft: '6px' }}>{order.status}</span>
                </span>
              </div>
              <div style={{ fontWeight: 600 }}>
                Rp{Number(order.total_price || 0).toLocaleString('id-ID')}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : '-'}
              </div>
              <div>
                <Link to={`/app/services/${order.service_id}`} className="btn btn-sm btn-secondary">
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
