import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Shell } from './components/layout/Shell.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import SecurityGuard from './components/security/SecurityGuard.jsx'
import { session } from './lib/api.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import SearchPage from './pages/SearchPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Checkout from './pages/Checkout.jsx'
import InboxPage from './pages/InboxPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PreferencesPage from './pages/PreferencesPage.jsx'
import InterestsPage from './pages/InterestsPage.jsx'
import BecomeSellerPage from './pages/BecomeSellerPage.jsx'
import BuyerDashboard from './pages/buyer/BuyerDashboard.jsx'
import SellerDashboard from './pages/seller/SellerDashboard.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import './styles.css'

// Protected route wrapper
function PrivateRoute({ children }) {
  return session.token ? children : <Navigate to="/auth/login" replace />
}

// Role-based route wrapper
function RoleRoute({ allowedRoles, children }) {
  const user = session.user
  if (!session.token) {
    return <Navigate to="/auth/login" replace />
  }
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'buyer') return <Navigate to="/app/buyer" replace />
    if (user?.role === 'seller') return <Navigate to="/app/seller" replace />
    if (user?.role === 'admin') return <Navigate to="/app/admin" replace />
    return <Navigate to="/auth/login" replace />
  }
  return children
}

function AppRoutes() {
  const navigate = useNavigate()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Initialize - check if user has valid session
    const user = session.user
    if (user) {
      // Redirect based on role if at root app
      const path = window.location.pathname
      if (path === '/app' || path === '/') {
        if (user.role === 'buyer') navigate('/app/buyer', { replace: true })
        else if (user.role === 'seller') navigate('/app/seller', { replace: true })
        else if (user.role === 'admin') navigate('/app/admin', { replace: true })
      }
    }
    setInitialized(true)
  }, [])

  if (!initialized) return null

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      {/* Shell-wrapped routes */}
      <Route element={<Shell />}>
        {/* Role-based dashboards */}
        <Route path="/app/buyer" element={
          <RoleRoute allowedRoles={['buyer']}>
            <Home />
          </RoleRoute>
        } />
        <Route path="/app/seller" element={
          <RoleRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </RoleRoute>
        } />
        <Route path="/app/admin" element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        } />

        {/* Generic app route - redirect based on role */}
        <Route path="/app" element={
          session.user ? (
            session.user.role === 'buyer' ? <Navigate to="/app/buyer" replace /> :
            session.user.role === 'seller' ? <Navigate to="/app/seller" replace /> :
            session.user.role === 'admin' ? <Navigate to="/app/admin" replace /> :
            <Navigate to="/auth/login" replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        } />

        {/* Existing routes */}
        <Route path="/app/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/app/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/app/categories/:slug" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
        <Route path="/app/services/:id" element={<PrivateRoute><ServiceDetail /></PrivateRoute>} />
	        <Route path="/app/checkout/:id" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/app/inbox" element={<PrivateRoute><InboxPage /></PrivateRoute>} />
        <Route path="/app/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/app/saved" element={<PrivateRoute><SavedPage /></PrivateRoute>} />
        <Route path="/app/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/app/profile/preferences" element={<PrivateRoute><PreferencesPage /></PrivateRoute>} />
        <Route path="/app/profile/interests" element={<PrivateRoute><InterestsPage /></PrivateRoute>} />
        <Route path="/app/become-seller" element={<PrivateRoute><BecomeSellerPage /></PrivateRoute>} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SecurityGuard />
        <AppRoutes />
      </LanguageProvider>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)