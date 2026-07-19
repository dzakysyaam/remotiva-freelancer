import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users, Package, CreditCard, Settings,
  UserCheck, UserX, Shield, TrendingUp, Clock,
  ChevronDown, RefreshCw, MessageCircle, Filter,
  Plus, Trash2, X
} from 'lucide-react'
import { api, session } from '../../lib/api'
import { CustomerServiceButton } from '../../components/customer-service/CustomerServiceButton'
import { DashboardHeroVideo } from '../../components/dashboard/DashboardHeroVideo'
import IconAsset from '../../components/ui/IconAsset'
import { admin, roles, customerService, formatOrderStatus, formatPaymentStatus, formatRole } from '../../data/uiCopy'
import { useLanguage } from '../../i18n/LanguageContext'
import '../../components/customer-service/CustomerService.css'

export default function AdminDashboard() {
  const dashboard = {
  userManagement: "Kelola Pengguna",
  users: "Kelola Pengguna",
  orders: "Pesanan",
  payments: "Pembayaran",
  customerService: "Bantuan Pelanggan",
  support: "Bantuan Pelanggan",
  totalUsers: "Total Pengguna",
  activeUsers: "Pengguna Aktif",
  inactiveUsers: "Pengguna Nonaktif",
  totalOrders: "Total Pesanan",
  activeOrders: "Pesanan Aktif",
  completedOrders: "Pesanan Selesai",
  pendingOrders: "Pesanan Menunggu",
  totalPayments: "Total Pembayaran",
  pendingPayments: "Pembayaran Menunggu",
  totalRevenue: "Total Pendapatan",
  recentOrders: "Pesanan Terbaru",
  noOrdersYet: "Belum ada pesanan",
  noUsersYet: "Belum ada pengguna",
  noPaymentsYet: "Belum ada pembayaran",
  noConversationsYet: "Belum ada percakapan",
  selectConversation: "Pilih percakapan untuk melihat detail pesan",
  createUser: "Tambah Pengguna",
  editUser: "Edit Pengguna",
  deleteUser: "Hapus Pengguna",
  confirmDelete: "Apakah Anda yakin ingin menghapus pengguna ini?",
  name: "Nama",
  email: "Email",
  password: "Kata Sandi",
  role: "Peran",
  cancel: "Batal",
  save: "Simpan",
};
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])
  const [csStats, setCsStats] = useState({ total: 0, open: 0, pending: 0, closed: 0 })
  const [activeTab, setActiveTab] = useState('users')
  const [statusFilter, setStatusFilter] = useState('all')
  const [csThreads, setCsThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [csMessages, setCsMessages] = useState([])
  const [csReply, setCsReply] = useState('')
  const [loading, setLoading] = useState(true)

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'buyer' })
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  // Delete User Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const user = session.user
    if (!user || user.role !== 'admin') {
      navigate('/auth/login')
      return
    }

    loadData()
  }, [])

  // Load CS threads when CS tab is active
  useEffect(() => {
    if (activeTab === 'cs') {
      loadCsThreads()
    }
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    try {
      const [userData, orderData, paymentData] = await Promise.all([
        api.adminUsers().catch(() => []),
        api.orders().catch(() => []),
        api.payments().catch(() => [])
      ])

      setUsers(userData)
      setOrders(orderData)
      setPayments(paymentData)

      // Calculate CS stats
      const allThreads = await api.adminCsThreads().catch(() => [])
      setCsStats({
        total: allThreads.length,
        open: allThreads.filter(t => t.status === 'open').length,
        pending: allThreads.filter(t => t.status === 'pending').length,
        closed: allThreads.filter(t => t.status === 'closed').length
      })
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(userId) {
    try {
      const result = await api.adminToggleUser(userId)
      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_active: result.is_active } : u
      ))
    } catch (err) {
      console.error('Failed to toggle user:', err)
      alert('Gagal mengubah status pengguna')
    }
  }

  async function handleUpdateRole(userId, newRole) {
    try {
      const result = await api.adminUpdateRole(userId, { role: newRole })
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: result.role } : u
      ))
    } catch (err) {
      console.error('Failed to update role:', err)
      alert('Gagal mengubah peran')
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    setCreateError('')

    if (!newUser.name || !newUser.email || !newUser.password) {
      setCreateError('Semua field wajib diisi')
      return
    }

    setCreating(true)
    try {
      const createdUser = await api.adminCreateUser(newUser)
      setUsers([createdUser, ...users])
      setShowCreateModal(false)
      setNewUser({ name: '', email: '', password: '', role: 'buyer' })
    } catch (err) {
      console.error('Failed to create user:', err)
      setCreateError(err.message || 'Gagal membuat pengguna')
    } finally {
      setCreating(false)
    }
  }

  function openDeleteModal(user) {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  async function handleDeleteUser() {
    if (!userToDelete) return
    setDeleting(true)
    try {
      await api.adminDeleteUser(userToDelete.id)
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert(err.message || 'Gagal menghapus pengguna')
    } finally {
      setDeleting(false)
    }
  }

  async function loadCsThreads() {
    try {
      const status = statusFilter === 'all' ? null : statusFilter
      const threads = await api.adminCsThreads(status).catch(() => [])
      setCsThreads(threads)
    } catch (err) {
      console.error('Failed to load CS threads:', err)
    }
  }

  async function loadCsMessages(threadId) {
    try {
      const messages = await api.adminCsThreadMessages(threadId).catch(() => [])
      setCsMessages(messages)
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  async function handleCsReply(e) {
    e.preventDefault()
    if (!csReply.trim() || !selectedThread) return

    try {
      await api.adminSendCsMessage(selectedThread.id, { message: csReply })
      setCsReply('')
      loadCsMessages(selectedThread.id)
      loadCsThreads()
    } catch (err) {
      console.error('Failed to send reply:', err)
    }
  }

  async function handleUpdateCsStatus(status) {
    if (!selectedThread) return

    try {
      await api.adminUpdateCsStatus(selectedThread.id, { status })
      setSelectedThread({ ...selectedThread, status })
      loadCsThreads()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  // Stats
  const buyerCount = users.filter(u => u.role === 'buyer').length
  const sellerCount = users.filter(u => u.role === 'seller').length
  const activeUsers = users.filter(u => u.is_active).length
  const totalPayments = payments.filter(p => p.status === 'paid')
  const totalRevenue = totalPayments.reduce((sum, p) => sum + p.total_amount, 0)

  function formatTime(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const currentUser = session.user

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        {/* Hero Video */}
        <DashboardHeroVideo
          title={t("hero.adminTitle")}
          subtitle={t("hero.adminSubtitle")}
          badge={t("hero.adminBadge")}
          actions={
            <button className="dashboard-hero-action" onClick={loadData}>
              <RefreshCw size={16} /> {t("dashboard.refresh")}
            </button>
          }
        />

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon">
              <IconAsset name="users" alt={t("dashboard.totalUsers")} size={40} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{users.length}</span>
              <span className="stat-label">{t("dashboard.totalUsers")}</span>
              <span className="stat-detail">{buyerCount} {t("dashboard.buyers")}, {sellerCount} {t("dashboard.sellers")}</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon">
              <IconAsset name="user-management" alt={t("dashboard.activeUsers")} size={40} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{activeUsers}</span>
              <span className="stat-label">{t("dashboard.activeUsers")}</span>
              <span className="stat-detail">{users.length - activeUsers} {t("dashboard.inactive")}</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon">
              <IconAsset name="payments" alt={t("dashboard.totalRevenue")} size={40} />
            </div>
            <div className="stat-info">
              <span className="stat-value">Rp{totalRevenue.toLocaleString('id-ID')}</span>
              <span className="stat-label">{t("dashboard.totalRevenue")}</span>
              <span className="stat-detail">{totalPayments.length} {t("dashboard.paymentCount")}</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon">
              <IconAsset name="tickets" alt={t("dashboard.openTickets")} size={40} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{csStats.open}</span>
              <span className="stat-label">{t("dashboard.openTickets")}</span>
              <span className="stat-detail">{csStats.pending} {t("dashboard.pending")}</span>
            </div>
          </div>
        </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> {t("dashboard.userManagement")}
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={16} /> Pesanan
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={16} /> {t("dashboard.payments")}
        </button>
        <button
          className={`dashboard-tab ${activeTab === 'cs' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('cs')
            loadCsThreads()
          }}
        >
          <IconAsset name="headset" alt={dashboard.customerService} size={16} /> {dashboard.customerService}
          {csStats.open > 0 && <span className="tab-badge">{csStats.open}</span>}
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {loading ? (
          <div className="loading-state">Memuat...</div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="users-tab">
                <div className="users-tab-header">
                  <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} /> {dashboard.createUser}
                  </button>
                </div>
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>{admin.user}</th>
                        <th>{admin.role}</th>
                        <th>{admin.status}</th>
                        <th>{admin.joined}</th>
                        <th>{admin.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-sm">
                                {user.name[0].toUpperCase()}
                              </div>
                              <div className="user-info">
                                <span className="user-name">{user.name}</span>
                                <span className="user-email">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select
                              className="role-select"
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                              disabled={user.id === currentUser?.id}
                            >
                              <option value="buyer">{roles.buyer}</option>
                              <option value="seller">{roles.seller}</option>
                              <option value="admin">{roles.admin}</option>
                            </select>
                          </td>
                          <td>
                            <span className={`status-indicator ${user.is_active ? 'active' : 'inactive'}`}>
                              {user.is_active ? (
                                <>
                                  <UserCheck size={14} /> {admin.active}
                                </>
                              ) : (
                                <>
                                  <UserX size={14} /> {admin.inactive}
                                </>
                              )}
                            </span>
                          </td>
                          <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className={`toggle-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                                onClick={() => handleToggleActive(user.id)}
                                disabled={user.id === currentUser?.id}
                              >
                                {user.is_active ? admin.deactivate : admin.activate}
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => openDeleteModal(user)}
                                disabled={user.id === currentUser?.id}
                                title={dashboard.deleteUser}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="orders-tab">
                <div className="orders-table-container">
                  <table className="orders-table-admin">
                    <thead>
                      <tr>
                        <th>{admin.orderId}</th>
                        <th>{admin.service}</th>
                        <th>{admin.package}</th>
                        <th>{admin.amount}</th>
                        <th>{admin.status}</th>
                        <th>{admin.joined.replace("Bergabung", "Tanggal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan="6" className="empty-row">{admin.noOrders}</td></tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.service_title}</td>
                            <td>{order.package_name}</td>
                            <td>Rp{Number(order.total_price).toLocaleString('id-ID')}</td>
                            <td>
                              <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                                {formatOrderStatus(order.status)}
                              </span>
                            </td>
                            <td>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="payments-tab">
                <div className="orders-table-container">
                  <table className="orders-table-admin">
                    <thead>
                      <tr>
                        <th>{admin.id}</th>
                        <th>{admin.method}</th>
                        <th>{admin.amount}</th>
                        <th>{admin.fee}</th>
                        <th>{admin.total}</th>
                        <th>{admin.status}</th>
                        <th>{admin.joined.replace("Bergabung", "Tanggal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr><td colSpan="7" className="empty-row">{admin.noPayments}</td></tr>
                      ) : (
                        payments.map(payment => (
                          <tr key={payment.id}>
                            <td>#{payment.id}</td>
                            <td>{payment.method}</td>
                            <td>Rp{Number(payment.amount).toLocaleString('id-ID')}</td>
                            <td>Rp{Number(payment.fee).toLocaleString('id-ID')}</td>
                            <td>Rp{Number(payment.total_amount).toLocaleString('id-ID')}</td>
                            <td>
                              <span className={`payment-status-badge ${payment.status}`}>
                                {formatPaymentStatus(payment.status)}
                              </span>
                            </td>
                            <td>{new Date(payment.created_at).toLocaleDateString('id-ID')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'cs' && (
              <div className="cs-admin-tab">
                <div className="cs-admin-layout">
                  <div className="cs-admin-sidebar">
                    <div className="cs-admin-filters">
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value)
                          loadCsThreads()
                        }}
                        className="filter-select"
                      >
                        <option value="all">{customerService.allThreads}</option>
                        <option value="open">{customerService.open}</option>
                        <option value="pending">{customerService.pending}</option>
                        <option value="closed">{customerService.closed}</option>
                      </select>
                      <button className="btn btn-sm btn-secondary" onClick={loadCsThreads}>
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    <div className="cs-thread-list">
                      {csThreads.length === 0 ? (
                        <div className="cs-empty-admin">{customerService.noThreads}</div>
                      ) : (
                        csThreads.map(thread => (
                          <div
                            key={thread.id}
                            className={`cs-thread-item-admin ${selectedThread?.id === thread.id ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedThread(thread)
                              loadCsMessages(thread.id)
                            }}
                          >
                            <div className="cs-thread-header">
                              <span className={`cs-thread-status ${thread.status}`}>
                                {thread.status === 'open' ? customerService.open : thread.status === 'pending' ? customerService.pending : customerService.closed}
                              </span>
                              <span className="cs-thread-date">
                                {new Date(thread.updated_at).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            <div className="cs-thread-user-row">
                              <span className="cs-thread-user">{thread.user_name}</span>
                              <span className={`cs-thread-role-badge ${thread.user_role}`}>
                                {formatRole(thread.user_role)}
                              </span>
                            </div>
                            <div className="cs-thread-subject">{thread.subject}</div>
                            {thread.last_message && (
                              <div className="cs-thread-preview">{thread.last_message}</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="cs-admin-main">
                    {selectedThread ? (
                      <>
                        <div className="cs-admin-header">
                          <div className="cs-admin-thread-info">
                            <h3>{selectedThread.subject}</h3>
                            <span className={`cs-thread-status ${selectedThread.status}`}>
                              {selectedThread.status === 'open' ? customerService.open : selectedThread.status === 'pending' ? customerService.pending : customerService.closed}
                            </span>
                          </div>
                          <div className="cs-admin-actions">
                            <select
                              value={selectedThread.status}
                              onChange={(e) => handleUpdateCsStatus(e.target.value)}
                              className="status-select"
                            >
                              <option value="open">{customerService.open}</option>
                              <option value="pending">{customerService.pending}</option>
                              <option value="closed">{customerService.closed}</option>
                            </select>
                          </div>
                        </div>

                        <div className="cs-admin-messages">
                          {csMessages.map(msg => (
                            <div
                              key={msg.id}
                              className={`cs-admin-message ${msg.sender_role === 'admin' ? 'admin' : 'user'}`}
                            >
                              <div className="cs-message-header">
                                <span className="cs-message-sender">{msg.sender_name}</span>
                                <span className="cs-message-role">({formatRole(msg.sender_role)})</span>
                                <span className="cs-message-time">{formatTime(msg.created_at)}</span>
                              </div>
                              <p>{msg.message}</p>
                            </div>
                          ))}
                        </div>

                        <form className="cs-admin-reply-form" onSubmit={handleCsReply}>
                          <textarea
                            placeholder={customerService.typeReply}
                            value={csReply}
                            onChange={(e) => setCsReply(e.target.value)}
                            rows={3}
                          />
                          <button type="submit" className="btn btn-primary" disabled={!csReply.trim()}>
                            <MessageCircle size={16} /> {customerService.sendReply}
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="cs-admin-empty">
                        <IconAsset name="chat" alt={customerService.selectThread} size={48} />
                        <p>{customerService.selectThread}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>

        {/* Customer Service Button */}
        <CustomerServiceButton />

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{dashboard.createUser}</h3>
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  {createError && (
                    <div className="error-message">{createError}</div>
                  )}
                  <div className="form-group">
                    <label>{dashboard.name}</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{dashboard.email}</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      placeholder="Masukkan email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{dashboard.password}</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Masukkan kata sandi (min 6 karakter)"
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{dashboard.role}</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="buyer">Pembeli</option>
                      <option value="seller">Penjual</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    {dashboard.cancel}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating ? 'Menyimpan...' : dashboard.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete User Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content modal-content-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{dashboard.deleteUser}</h3>
                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p>{dashboard.confirmDelete}</p>
                <div className="delete-user-info">
                  <strong>{userToDelete.name}</strong>
                  <span>{userToDelete.email}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  {dashboard.cancel}
                </button>
                <button className="btn btn-danger" onClick={handleDeleteUser} disabled={deleting}>
                  {deleting ? 'Menghapus...' : dashboard.deleteUser}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .admin-dashboard-page {
          background: #f8fafc;
          min-height: calc(100vh - 76px);
        }

        .admin-dashboard-container {
          width: min(100% - 64px, 1560px);
          margin: 0 auto;
          padding: 32px 0 56px;
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .admin-stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(45, 118, 255, 0.08);
          flex-shrink: 0;
        }

        .stat-icon img {
          width: 40px;
          height: 40px;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
        }

        .stat-detail {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .dashboard-tabs {
          display: flex;
          gap: 4px;
          background: white;
          padding: 4px;
          border-radius: 10px;
          margin-bottom: 24px;
        }

        .dashboard-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .dashboard-tab:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .dashboard-tab.active {
          background: #2D76FF;
          color: white;
        }

        .dashboard-tab img {
          width: 16px;
          height: 16px;
          object-fit: contain;
        }

        .tab-badge {
          background: #DC2626;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .dashboard-content {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          min-height: 500px;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px;
          color: #64748b;
        }

        /* Users Table */
        .users-table-container {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .users-table th {
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .users-table tbody tr:hover {
          background: #f8fafc;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar-sm {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: #0f172a;
        }

        .user-email {
          font-size: 0.8rem;
          color: #64748b;
        }

        .role-select {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .status-indicator.active {
          background: #dcfce7;
          color: #166534;
        }

        .status-indicator.inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .toggle-btn {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .toggle-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-btn.deactivate {
          background: #fee2e2;
          color: #991b1b;
        }

        .toggle-btn.deactivate:hover:not(:disabled) {
          background: #fecaca;
        }

        .toggle-btn.activate {
          background: #dcfce7;
          color: #166534;
        }

        .toggle-btn.activate:hover:not(:disabled) {
          background: #bbf7d0;
        }

        /* Orders Table */
        .orders-table-container {
          overflow-x: auto;
        }

        .orders-table-admin {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table-admin th,
        .orders-table-admin td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
        }

        .orders-table-admin th {
          background: #f8fafc;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .orders-table-admin tbody tr:hover {
          background: #f8fafc;
        }

        .empty-row {
          text-align: center;
          color: #64748b;
          padding: 48px !important;
        }

        /* Payment Status Badge */
        .payment-status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .payment-status-badge.paid {
          background: #dcfce7;
          color: #166534;
        }

        .payment-status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .payment-status-badge.failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .payment-status-badge.expired {
          background: #f1f5f9;
          color: #64748b;
        }

        /* CS Admin */
        .cs-admin-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          height: 600px;
        }

        .cs-admin-sidebar {
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .cs-admin-filters {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .filter-select {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .cs-thread-list {
          flex: 1;
          overflow-y: auto;
        }

        .cs-empty-admin {
          padding: 32px;
          text-align: center;
          color: #64748b;
        }

        .cs-thread-item-admin {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background 0.15s;
        }

        .cs-thread-item-admin:hover {
          background: #f8fafc;
        }

        .cs-thread-item-admin.active {
          background: #E8F1FF;
          border-left: 3px solid #2D76FF;
        }

        .cs-thread-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .cs-thread-status {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .cs-thread-status.open {
          background: #dcfce7;
          color: #166534;
        }

        .cs-thread-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .cs-thread-status.closed {
          background: #f1f5f9;
          color: #64748b;
        }

        .cs-thread-date {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .cs-thread-user {
          font-weight: 600;
          font-size: 0.9rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .cs-thread-user-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .cs-thread-role-badge {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .cs-thread-role-badge.buyer {
          background: #DBEAFE;
          color: #1E40AF;
        }

        .cs-thread-role-badge.seller {
          background: #D1FAE5;
          color: #065F46;
        }

        .cs-thread-role-badge.admin {
          background: #FEE2E2;
          color: #991B1B;
        }

        .cs-thread-subject {
          font-size: 0.85rem;
          color: #0f172a;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cs-thread-preview {
          font-size: 0.8rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cs-admin-main {
          display: flex;
          flex-direction: column;
        }

        .cs-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .cs-admin-thread-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cs-admin-thread-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .status-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .cs-admin-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cs-admin-message {
          max-width: 80%;
        }

        .cs-admin-message.user {
          align-self: flex-end;
        }

        .cs-admin-message.admin {
          align-self: flex-start;
        }

        .cs-message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .cs-message-sender {
          font-weight: 600;
          font-size: 0.85rem;
        }

        .cs-message-role {
          font-size: 0.75rem;
          color: #64748b;
        }

        .cs-message-time {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .cs-admin-message p {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .cs-admin-message.user p {
          background: #2D76FF;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .cs-admin-message.admin p {
          background: #f1f5f9;
          color: #0f172a;
          border-bottom-left-radius: 4px;
        }

        .cs-admin-reply-form {
          padding: 16px 20px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cs-admin-reply-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          resize: none;
        }

        .cs-admin-reply-form textarea:focus {
          outline: none;
          border-color: #2D76FF;
        }

        .cs-admin-reply-form .btn {
          align-self: flex-end;
        }

        .cs-admin-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .cs-admin-empty img {
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #2D76FF;
          color: white;
        }

        .btn-primary:hover {
          background: #1F66EC;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .btn-sm {
          padding: 6px 10px;
          font-size: 0.8rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .modal-content-sm {
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 0 0 12px 12px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #2D76FF;
          box-shadow: 0 0 0 3px rgba(45, 118, 255, 0.1);
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .delete-user-info {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin-top: 12px;
        }

        .delete-user-info strong {
          display: block;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .delete-user-info span {
          font-size: 0.85rem;
          color: #64748b;
        }

        .btn-danger {
          background: #DC2626;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #B91C1C;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .delete-btn {
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: #fee2e2;
          color: #991b1b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover:not(:disabled) {
          background: #fecaca;
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .users-tab-header {
          display: flex;
          justify-content: flex-end;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        @media (max-width: 1200px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .cs-admin-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-dashboard-container {
            width: min(100% - 32px, 100%);
            padding: 24px 0 40px;
          }
          .admin-dashboard-title h1 {
            font-size: 26px;
          }
          .admin-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
