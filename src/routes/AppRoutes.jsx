import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import ProtectedRoute from '../auth/ProtectedRoute'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Properties from '../pages/Properties'
import PropertyDetailsPanel from '../pages/PropertyDetailsPanel'
import TenantPortal from '../pages/TenantPortal'
import TenantDetailsPanel from '../pages/TenantDetailsPanel'
import TenantMyView from '../pages/TenantMyView'
import TenantPayments from '../pages/TenantPayments'
import OwnerMyView from '../pages/OwnerMyView'
import Payments from '../pages/Payments'
import AchCredit from '../pages/AchCredit'
import Reports from '../pages/Reports'
import AIInsights from '../pages/AIInsights'
import Settings from '../pages/Settings'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/my/tenant" element={<ProtectedRoute requireRole="tenant"><TenantMyView /></ProtectedRoute>} />
          <Route path="/my/tenant/payments" element={<ProtectedRoute requireRole="tenant"><TenantPayments /></ProtectedRoute>} />
          <Route path="/my/owner" element={<ProtectedRoute requireRole="owner"><OwnerMyView /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requireRole="pm"><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute requireRole="pm"><Properties /></ProtectedRoute>}>
            <Route
              index
              element={
                <div className="properties-detail-pane">
                  <div className="properties-detail-empty">
                    <p>Select a property to view details</p>
                  </div>
                </div>
              }
            />
            <Route path=":id" element={<PropertyDetailsPanel />} />
          </Route>
          <Route path="/tenant-portal" element={<ProtectedRoute requireRole="pm"><TenantPortal /></ProtectedRoute>}>
            <Route
              index
              element={
                <div className="properties-detail-pane">
                  <div className="properties-detail-empty">
                    <p>Select a tenant to view details</p>
                  </div>
                </div>
              }
            />
            <Route path=":id" element={<TenantDetailsPanel />} />
          </Route>
          <Route path="/tenants" element={<Navigate to="/tenant-portal" replace />} />
          <Route path="/ach-credit" element={<ProtectedRoute requireRole="pm"><AchCredit /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute requireRole="pm"><Payments /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute requireRole="pm"><Reports /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute requireRole="pm"><AIInsights /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requireRole="pm"><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
