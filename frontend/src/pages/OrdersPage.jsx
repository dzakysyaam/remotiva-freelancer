import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../lib/api'
import { orders, formatOrderStatus } from '../data/uiCopy'

export default function OrdersPage() {
  const [ordersList, setOrders] = useState([])
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
    total: ordersList.length,
    pending: ordersList.filter(o => o.status === 'Pending').length,
    inProgress: ordersList.filter(o => o.status === 'In Progress').length,
    completed: ordersList.filter(o => o.status === 'Completed').length
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-header">
        <h1>{orders.title}</h1>
        <p>{orders.subtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>{orders.totalOrders}</h4>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h4>{orders.pending}</h4>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
        </div>
        <div className="stat-card">
          <h4>{orders.inProgress}</h4>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.inProgress}</div>
        </div>
        <div className="stat-card">
          <h4>{orders.completed}</h4>
          <div className="stat-value" style={{ color: '#1dbf73' }}>{stats.completed}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table">
        <div className="table-header">
          <div>{orders.service}</div>
          <div>{orders.status}</div>
          <div>{orders.price}</div>
          <div>{orders.date}</div>
          <div>{orders.actions}</div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>{orders.loadingOrders}</p>
          </div>
        ) : ordersList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={32} />
            </div>
            <h2>{orders.noOrdersYet}</h2>
            <p>{orders.startExploring}</p>
            <Link to="/app/search" className="btn btn-primary">{orders.browseServices}</Link>
          </div>
        ) : (
          ordersList.map(order => (
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
                  <span style={{ marginLeft: '6px' }}>{formatOrderStatus(order.status)}</span>
                </span>
              </div>
              <div style={{ fontWeight: 600 }}>
                Rp{Number(order.total_price || 0).toLocaleString('id-ID')}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : '-'}
              </div>
              <div>
                <Link to={`/app/services/${order.service_id}`} className="btn btn-sm btn-secondary">
                  {orders.view}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
