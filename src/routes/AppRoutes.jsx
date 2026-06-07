import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import ProtectedRoute from '../auth/ProtectedRoute'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Properties from '../pages/Properties'
import PropertyDetails from '../pages/PropertyDetails'
import Tenants from '../pages/Tenants'
import Payments from '../pages/Payments'
import Reports from '../pages/Reports'
import AIInsights from '../pages/AIInsights'
import Settings from '../pages/Settings'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
          <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />
          <Route path="/tenants" element={<ProtectedRoute><Tenants /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
