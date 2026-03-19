import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PartnerLogin from './pages/PartnerLogin'
import AdminLogin from './pages/AdminLogin'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'
import NewOrder from './pages/NewOrder'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import PartnerDashboard from './pages/PartnerDashboard'
import PartnerOrders from './pages/PartnerOrders'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPartners from './pages/admin/AdminPartners'
import AdminPricing from './pages/admin/AdminPricing'

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages - no navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin - own layout */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="pricing" element={<AdminPricing />} />
        </Route>

        {/* Public + user pages - with navbar */}
        <Route path="/*" element={
          <div className="page">
            <Navbar />
            <div style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pricing" element={<Pricing />} />

                <Route path="/dashboard" element={
                  <ProtectedRoute role="user"><Dashboard /></ProtectedRoute>
                } />
                <Route path="/order/new" element={
                  <ProtectedRoute role="user"><NewOrder /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute role="user"><Orders /></ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute role="user"><OrderDetail /></ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute role="user"><Notifications /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute role="user"><Profile /></ProtectedRoute>
                } />

                <Route path="/partner/dashboard" element={
                  <ProtectedRoute role="partner"><PartnerDashboard /></ProtectedRoute>
                } />
                <Route path="/partner/orders" element={
                  <ProtectedRoute role="partner"><PartnerOrders /></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
