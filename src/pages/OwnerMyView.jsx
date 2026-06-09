import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import OwnerDetailsBlock from '../components/OwnerDetailsBlock'
import { useAuth } from '../auth/AuthProvider'
import { fetchProperty, fetchPayments } from '../services/api'

export default function OwnerMyView() {
  const { session } = useAuth()
  const [property, setProperty] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.entityId) return
    setLoading(true)
    Promise.all([fetchProperty(session.entityId), fetchPayments().catch(() => [])])
      .then(([propertyData, paymentData]) => {
        setProperty(propertyData)
        setPayments(paymentData)
      })
      .catch(() => setError('Unable to load your owner profile.'))
      .finally(() => setLoading(false))
  }, [session?.entityId])

  if (!session || session.role !== 'owner') {
    return <Navigate to="/" replace />
  }

  return (
    <MainLayout>
      <div className="role-home-page">
        {loading ? (
          <div className="properties-detail-empty"><p>Loading...</p></div>
        ) : error || !property ? (
          <div className="properties-detail-empty"><p>{error || 'Profile not found.'}</p></div>
        ) : (
          <div className="properties-detail-pane role-home-pane">
            <div className="property-list">
              <OwnerDetailsBlock property={property} payments={payments} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
