import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../auth/AuthProvider'
import ProtectedRoute from '../auth/ProtectedRoute'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Properties from '../pages/Properties'
import PropertyDetailsPanel from '../pages/PropertyDetailsPanel'
import TenantPortal from '../pages/TenantPortal'
import TenantDetailsPanel from '../pages/TenantDetailsPanel'
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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>}>
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
          <Route path="/tenant-portal" element={<ProtectedRoute><TenantPortal /></ProtectedRoute>}>
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
          <Route path="/ach-credit" element={<ProtectedRoute><AchCredit /></ProtectedRoute>} />
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
