import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProperty, fetchPayments, fetchPropertyTenants } from '../services/api'
import { tenantDetailsMap } from '../data/tenantDetails'
import { ownerDetailsMap } from '../data/ownerDetails'
import MailboxPanel from '../components/MailboxPanel'
import TenantDetailsBlock from '../components/TenantDetailsBlock'
import { formatLeaseDate, formatLeaseDuration } from '../utils/leaseDates'
import { buildPropertyLedger, getPaymentLedgerDate } from '../utils/ledgerBalance'
import { buildManagementFeeSummary } from '../utils/managementFees'

function staticTenantFallback(property) {
  const info = tenantDetailsMap[property.title]
  if (!info) return null
  return { ...info, id: `static-${property.id}`, isCurrent: true }
}

export default function PropertyDetailsPanel() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [payments, setPayments] = useState([])
  const [propertyTenants, setPropertyTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ownerActiveTab, setOwnerActiveTab] = useState('personal')
  const [expandedPastTenantId, setExpandedPastTenantId] = useState(null)

  useEffect(() => {
    setOwnerActiveTab('personal')
    setExpandedPastTenantId(null)
    setLoading(true)
    setError('')
    Promise.all([
      fetchProperty(id),
      fetchPayments(),
      fetchPropertyTenants(id).catch((err) => {
        console.warn('Property tenants unavailable, using fallback', err)
        return []
      }),
    ])
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

  const ownerInfo = ownerDetailsMap[property.title]
  const ownerPayments = payments.filter((payment) => Number(payment.propertyId) === Number(property.id))
  const ledger = buildPropertyLedger(property.openingBalance, ownerPayments)
  const managementFees = buildManagementFeeSummary(ownerPayments)
  const currentTenant = propertyTenants.find((tenant) => tenant.isCurrent) || staticTenantFallback(property)
  const pastTenants = propertyTenants.filter((tenant) => !tenant.isCurrent)

  return (
    <div className="properties-detail-pane">
      <div className="property-detail-header">
        <span className={`status-badge ${property.hasCurrentTenant ? (property.status === 'Leased' ? 'status-paid' : 'status-overdue') : 'status-due'}`}>
          {property.hasCurrentTenant ? property.status : 'Available'}
        </span>
        <h2>{property.address}</h2>
      </div>

      <div className="property-list">
        <div className="property-card card owner-details-panel">
          <div className="owner-card-header">
            <h4>Owner details</h4>
            <p className="owner-name">{property.ownerName || '—'}</p>
          </div>

          <div className="tenant-tabs" role="tablist">
            <button className={`tenant-tab ${ownerActiveTab === 'personal' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'personal'} onClick={() => setOwnerActiveTab('personal')}>Personal information</button>
            <button className={`tenant-tab ${ownerActiveTab === 'financial' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'financial'} onClick={() => setOwnerActiveTab('financial')}>Financial</button>
            <button className={`tenant-tab ${ownerActiveTab === 'documents' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'documents'} onClick={() => setOwnerActiveTab('documents')}>Documents</button>
            <button className={`tenant-tab ${ownerActiveTab === 'mailbox' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'mailbox'} onClick={() => setOwnerActiveTab('mailbox')}>Mailbox</button>
            <button className={`tenant-tab ${ownerActiveTab === 'ledger' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'ledger'} onClick={() => setOwnerActiveTab('ledger')}>Ledger</button>
            <button className={`tenant-tab ${ownerActiveTab === 'management' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'management'} onClick={() => setOwnerActiveTab('management')}>Management fees</button>
          </div>

          {ownerActiveTab === 'personal' && (
            <div className="tenant-tab-panel">
              <div className="property-card-body">
                <div className="property-media">
                  {property.imageUrl ? <img src={property.imageUrl} alt={property.address} /> : <div className="property-image-placeholder">{property.type}</div>}
                </div>
                <div className="property-info">
                  <div className="property-meta-grid">
                    <div>
                      <span className="meta-label">Address</span>
                      <p>{property.address}</p>
                    </div>
                    <div>
                      <span className="meta-label">SSN / ITIN / EIN</span>
                      <p>{property.ownerTaxId || '—'}</p>
                    </div>
                    <div>
                      <span className="meta-label">Type</span>
                      <p>{property.type}</p>
                    </div>
                    <div>
                      <span className="meta-label">Beds</span>
                      <p>{property.beds}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ownerActiveTab === 'financial' && (
            <div className="tenant-tab-panel">
              <div className="property-card-body">
                <div className="property-media">
                  {property.imageUrl ? <img src={property.imageUrl} alt={property.address} /> : <div className="property-image-placeholder">{property.type}</div>}
                </div>
                <div className="property-info">
                  <div className="property-meta-grid">
                    <div>
                      <span className="meta-label">Price</span>
                      <p>${property.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="meta-label">Rent</span>
                      <p>${property.rent.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="meta-label">Purchase date</span>
                      <p>{property.purchaseDate || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="meta-label">Appraised value</span>
                      <p>${property.currentValue ? property.currentValue.toLocaleString() : '—'}</p>
                    </div>
                    <div>
                      <span className="meta-label">Zillow estimate</span>
                      <p>${property.zillowEstimate.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="meta-label">Cash ROI</span>
                      <p>{property.purchasePrice ? `${(((property.rent || 0) * 12) / property.purchasePrice * 100).toFixed(1)}%` : '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ownerActiveTab === 'documents' && (
            <div className="tenant-tab-panel">
              {ownerInfo?.documents?.length ? (
                <ul className="tenant-documents-list">
                  {ownerInfo.documents.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted-text">No documents on file.</p>
              )}
            </div>
          )}

          {ownerActiveTab === 'mailbox' && (
            <div className="tenant-tab-panel mailbox-panel">
              <MailboxPanel messages={ownerInfo?.mailbox} />
            </div>
          )}

          {ownerActiveTab === 'management' && (
            <div className="tenant-tab-panel owner-mgmt-panel">
              {managementFees.months.length ? (
                <>
                  <div className="owner-mgmt-summary">
                    <div>
                      <span className="owner-mgmt-summary-label">PM revenue from this owner</span>
                      <span className="owner-mgmt-summary-value">${managementFees.paidRevenue.toLocaleString()} collected</span>
                    </div>
                    {managementFees.pendingRevenue > 0 ? (
                      <span className="owner-mgmt-pending">+ ${managementFees.pendingRevenue.toLocaleString()} pending</span>
                    ) : null}
                  </div>
                  <ul className="owner-mgmt-month-list">
                    {managementFees.months.map((month) => (
                      <li key={month.monthKey} className="owner-mgmt-month-item">
                        <div className="owner-mgmt-month-header">
                          <span className="owner-mgmt-month-label">{month.monthLabel}</span>
                          <span className="owner-mgmt-month-total">${month.total.toLocaleString()}</span>
                        </div>
                        <ul className="owner-mgmt-fee-list">
                          {month.fees.map((payment) => (
                            <li key={payment.id} className="owner-mgmt-fee-item">
                              <div className="owner-mgmt-fee-main">
                                <span>${(payment.amount || 0).toLocaleString()}</span>
                                <span className={`status-badge ${payment.status === 'Paid' ? 'status-paid' : payment.status === 'Due' || payment.status === 'Pending' ? 'status-due' : 'status-overdue'}`}>
                                  {payment.status}
                                </span>
                              </div>
                              <p className="owner-mgmt-fee-desc">{payment.description || 'Management fee'}</p>
                              <span className="owner-mgmt-fee-date">{getPaymentLedgerDate(payment) || '—'}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="muted-text">No management fees recorded for this property yet.</p>
              )}
            </div>
          )}

          {ownerActiveTab === 'ledger' && (
            <div className="tenant-tab-panel owner-ledger-panel">
              {ownerPayments.length || ledger.openingBalance ? (
                <>
                  <div className="owner-ledger-summary">
                    <span className="owner-ledger-summary-label">Current balance</span>
                    <span className="owner-ledger-summary-value">${ledger.currentBalance.toLocaleString()}</span>
                  </div>
                  <ul className="owner-ledger-list">
                    {ledger.entries.map(({ payment, delta, balance }) => (
                      <li key={payment.id} className="owner-ledger-item">
                        <div className="owner-ledger-main">
                          <span className="owner-ledger-type">{payment.type}</span>
                          <div className="owner-ledger-amounts">
                            <span className={`owner-ledger-amount${delta > 0 ? ' credit' : delta < 0 ? ' debit' : ''}`}>
                              {delta > 0 ? '+' : ''}{delta !== 0 ? `$${Math.abs(delta).toLocaleString()}` : `$${(payment.amount || 0).toLocaleString()}`}
                            </span>
                            <span className="owner-ledger-balance">${balance.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="owner-ledger-meta">
                          <span className={`status-badge ${payment.status === 'Paid' ? 'status-paid' : payment.status === 'Due' || payment.status === 'Pending' ? 'status-due' : 'status-overdue'}`}>
                            {payment.status}
                          </span>
                          <span>{getPaymentLedgerDate(payment) || '—'}</span>
                          {payment.description ? <span>{payment.description}</span> : null}
                        </div>
                      </li>
                    ))}
                    {ledger.openingBalance > 0 ? (
                      <li className="owner-ledger-item owner-ledger-opening">
                        <div className="owner-ledger-main">
                          <span className="owner-ledger-type">Opening balance</span>
                          <div className="owner-ledger-amounts">
                            <span className="owner-ledger-amount credit">+${ledger.openingBalance.toLocaleString()}</span>
                            <span className="owner-ledger-balance">${ledger.openingBalance.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="owner-ledger-meta">
                          <span>Owner reserve deposit</span>
                        </div>
                      </li>
                    ) : null}
                  </ul>
                </>
              ) : (
                <p className="muted-text">No transactions recorded for this property yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

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
