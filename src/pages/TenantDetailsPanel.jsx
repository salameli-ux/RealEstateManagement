import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TenantDetailsBlock from '../components/TenantDetailsBlock'
import { fetchTenant, fetchPayments } from '../services/api'

export default function TenantDetailsPanel() {
  const { id } = useParams()
  const [tenant, setTenant] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([fetchTenant(id), fetchPayments().catch(() => [])])
      .then(([tenantData, paymentData]) => {
        setTenant(tenantData)
        setPayments(paymentData)
      })
      .catch((err) => {
        console.error('Failed to load tenant details', err)
        setError('Unable to load this tenant. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const onTenantUpdated = (event) => {
      const updated = event.detail?.tenant
      if (updated && String(updated.id) === String(id)) {
        setTenant(updated)
      }
    }

    window.addEventListener('tenant-updated', onTenantUpdated)
    return () => window.removeEventListener('tenant-updated', onTenantUpdated)
  }, [id])

  if (loading) {
    return (
      <div className="properties-detail-pane">
        <div className="properties-detail-empty">
          <p>Loading tenant...</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="properties-detail-pane">
        <div className="properties-detail-empty">
          <p>{error || 'Tenant not found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="properties-detail-pane">
      <div className="tenant-details-panel card">
        <TenantDetailsBlock key={tenant.id} tenant={tenant} payments={payments} />
      </div>
    </div>
  )
}
