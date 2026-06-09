import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import TenantDetailsBlock from '../components/TenantDetailsBlock'
import { useAuth } from '../auth/AuthProvider'
import { fetchTenant, fetchPayments } from '../services/api'

export default function TenantMyView() {
  const { session } = useAuth()
  const [tenant, setTenant] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.entityId) return
    setLoading(true)
    Promise.all([fetchTenant(session.entityId), fetchPayments().catch(() => [])])
      .then(([tenantData, paymentData]) => {
        setTenant(tenantData)
        setPayments(paymentData)
      })
      .catch(() => setError('Unable to load your tenant profile.'))
      .finally(() => setLoading(false))
  }, [session?.entityId])

  if (!session || session.role !== 'tenant') {
    return <Navigate to="/" replace />
  }

  return (
    <MainLayout>
      <div className="role-home-page">
        {loading ? (
          <div className="properties-detail-empty"><p>Loading...</p></div>
        ) : error || !tenant ? (
          <div className="properties-detail-empty"><p>{error || 'Profile not found.'}</p></div>
        ) : (
          <div className="properties-detail-pane role-home-pane">
            <div className="tenant-details-panel card">
              <TenantDetailsBlock tenant={tenant} payments={payments} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
