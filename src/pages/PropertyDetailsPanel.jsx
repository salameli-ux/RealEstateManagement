import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProperty, fetchPayments, fetchPropertyTenants } from '../services/api'
import OwnerDetailsBlock from '../components/OwnerDetailsBlock'
import TenantDetailsBlock from '../components/TenantDetailsBlock'
import { formatLeaseDate, formatLeaseDuration } from '../utils/leaseDates'

export default function PropertyDetailsPanel() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [payments, setPayments] = useState([])
  const [propertyTenants, setPropertyTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedPastTenantId, setExpandedPastTenantId] = useState(null)

  useEffect(() => {
    setExpandedPastTenantId(null)
    setLoading(true)
    setError('')
    Promise.all([fetchProperty(id), fetchPayments(), fetchPropertyTenants(id)])
      .then(([propertyData, paymentData, tenantData]) => {
        setProperty(propertyData)
        setPayments(paymentData)
        setPropertyTenants(tenantData)
      })
      .catch((err) => {
        console.error('Failed to load property details', err)
        setError('Unable to load this property. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const onPropertyUpdated = (event) => {
      const updated = event.detail?.property
      if (updated && String(updated.id) === String(id)) {
        setProperty(updated)
      }
    }

    window.addEventListener('property-updated', onPropertyUpdated)
    return () => window.removeEventListener('property-updated', onPropertyUpdated)
  }, [id])

  if (loading) {
    return (
      <div className="properties-detail-pane">
        <div className="properties-detail-empty">
          <p>Loading property...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="properties-detail-pane">
        <div className="properties-detail-empty">
          <p>{error || 'This property was not found.'}</p>
        </div>
      </div>
    )
  }

  const currentTenant = propertyTenants.find((tenant) => tenant.isCurrent)
  const pastTenants = propertyTenants.filter((tenant) => !tenant.isCurrent)

  return (
    <div className="properties-detail-pane">
      <div className="property-detail-header">
        <span className={`status-badge ${property.hasCurrentTenant ? (property.status === 'Leased' ? 'status-paid' : 'status-overdue') : 'status-due'}`}>
          {property.hasCurrentTenant ? property.status : 'Available'}
        </span>
        <h2>{property.address}</h2>
      </div>

      <OwnerDetailsBlock property={property} payments={payments} />

      <div className="tenant-details-panel card">
        {currentTenant ? (
          <TenantDetailsBlock key={currentTenant.id} tenant={currentTenant} payments={payments} />
        ) : (
          <>
            <div className="tenant-card-header">
              <div>
                <h4>Tenant details</h4>
                <p className="tenant-name">No tenant assigned to this property yet.</p>
              </div>
            </div>
            <p className="muted-text">This property does not have a linked tenant contract yet.</p>
          </>
        )}
      </div>

      {pastTenants.length > 0 && (
        <div className="past-tenants-section card">
          <h4 className="past-tenants-heading">Previous tenants</h4>
          <ul className="past-tenants-list">
            {pastTenants.map((tenant) => {
              const isExpanded = expandedPastTenantId === tenant.id
              return (
                <li key={tenant.id} className={`past-tenant-item${isExpanded ? ' expanded' : ''}`}>
                  <button
                    type="button"
                    className="past-tenant-row"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedPastTenantId((prev) => (prev === tenant.id ? null : tenant.id))}
                  >
                    <span className="past-tenant-name">{tenant.name}</span>
                    <span className="past-tenant-period">
                      {formatLeaseDate(tenant.leaseStart)} — {formatLeaseDate(tenant.leaseEnd)}
                    </span>
                    <span className="past-tenant-duration">{formatLeaseDuration(tenant.leaseStart, tenant.leaseEnd)}</span>
                    <span className="past-tenant-chevron" aria-hidden="true">{isExpanded ? '▲' : '▼'}</span>
                  </button>
                  {isExpanded && (
                    <div className="past-tenant-expanded">
                      <TenantDetailsBlock
                        key={tenant.id}
                        tenant={tenant}
                        payments={payments}
                        compactHeader
                        defaultTab="personal"
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
