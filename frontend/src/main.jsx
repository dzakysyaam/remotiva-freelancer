import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/layout/Shell.jsx'
import { session } from './lib/api.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import SearchPage from './pages/SearchPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import InboxPage from './pages/InboxPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import PreferencesPage from './pages/PreferencesPage.jsx'
import InterestsPage from './pages/InterestsPage.jsx'
import BecomeSellerPage from './pages/BecomeSellerPage.jsx'
import './styles.css'

function PrivateRoute({ children }) {
  return session.token ? children : <Navigate to="/auth/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route element={<Shell />}>
        <Route path="/app" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/app/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path="/app/categories/:slug" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
        <Route path="/app/services/:id" element={<PrivateRoute><ServiceDetail /></PrivateRoute>} />
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
      <AppRoutes />
    </BrowserRouter>
  )
}
createRoot(document.getElementById('root')).render(<App />)