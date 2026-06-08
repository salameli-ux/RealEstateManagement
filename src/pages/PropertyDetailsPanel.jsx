import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProperty, fetchPayments } from '../services/api'
import { tenantDetailsMap } from '../data/tenantDetails'
import { ownerDetailsMap } from '../data/ownerDetails'

function MailboxPanel({ messages }) {
  if (!messages?.length) {
    return <p className="muted-text">No messages in mailbox.</p>
  }

  return (
    <ul className="mailbox-list">
      {messages.map((message, idx) => (
        <li key={idx} className={`mailbox-item${message.unread ? ' unread' : ''}`}>
          <div className="mailbox-item-header">
            <span className="mailbox-subject">{message.subject}</span>
            {message.unread ? <span className="mailbox-unread-dot" aria-label="Unread" /> : null}
          </div>
          <p className="mailbox-preview">{message.preview}</p>
          <div className="mailbox-meta">
            <span>{message.from}</span>
            <span>{message.date}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function PropertyDetailsPanel() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ownerActiveTab, setOwnerActiveTab] = useState('personal')
  const [tenantActiveTab, setTenantActiveTab] = useState('activity')

  useEffect(() => {
    setOwnerActiveTab('personal')
    setTenantActiveTab('activity')
    setLoading(true)
    setError('')
    Promise.all([fetchProperty(id), fetchPayments()])
      .then(([propertyData, paymentData]) => {
        setProperty(propertyData)
        setPayments(paymentData)
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
  const tenantInfo = tenantDetailsMap[property.title]
  const tenantPaymentRows = payments.filter((payment) => payment.tenantName === tenantInfo?.name)
  const deposit = tenantPaymentRows
    .filter((payment) => payment.type === 'Deposit')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const due = tenantPaymentRows
    .filter((payment) => ['Due', 'Overdue', 'Pending'].includes(payment.status) && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const paid = tenantPaymentRows
    .filter((payment) => payment.status === 'Paid' && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const position = paid + deposit - due
  const positionLabel = position >= 0 ? 'Balanced' : `Debt $${Math.abs(position).toLocaleString()}`
  const statusClass = position >= 0 ? 'status-paid' : 'status-overdue'

  return (
    <div className="properties-detail-pane">
      <div className="property-detail-header">
        <span className={`status-badge ${property.status === 'Leased' ? 'status-paid' : property.status === 'Available' ? 'status-due' : 'status-overdue'}`}>
          {property.status}
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

          {ownerActiveTab === 'ledger' && (
            <div className="tenant-tab-panel owner-ledger-panel">
              {ownerPayments.length ? (
                <ul className="owner-ledger-list">
                  {ownerPayments.map((payment) => (
                    <li key={payment.id} className="owner-ledger-item">
                      <div className="owner-ledger-main">
                        <span className="owner-ledger-type">{payment.type}</span>
                        <span className="owner-ledger-amount">${(payment.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="owner-ledger-meta">
                        <span className={`status-badge ${payment.status === 'Paid' ? 'status-paid' : payment.status === 'Due' || payment.status === 'Pending' ? 'status-due' : 'status-overdue'}`}>
                          {payment.status}
                        </span>
                        <span>{payment.dueDate || payment.paidDate || '—'}</span>
                        {payment.description ? <span>{payment.description}</span> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted-text">No transactions recorded for this property yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="tenant-details-panel card">
        <div className="tenant-card-header">
          <div>
            <h4>Tenant details</h4>
            <p className="tenant-name">{tenantInfo?.name || 'No tenant assigned to this property yet.'}</p>
          </div>
          <span className={`status-badge ${tenantInfo?.status === 'Paid' ? 'status-paid' : tenantInfo?.status === 'Due' ? 'status-due' : 'status-overdue'}`}>
            {tenantInfo?.status || 'Unassigned'}
          </span>
        </div>

        {tenantInfo ? (
          <>
            <div className="tenant-tabs" role="tablist">
              <button className={`tenant-tab ${tenantActiveTab === 'activity' ? 'active' : ''}`} type="button" role="tab" aria-selected={tenantActiveTab === 'activity'} onClick={() => setTenantActiveTab('activity')}>Activity</button>
              <button className={`tenant-tab ${tenantActiveTab === 'personal' ? 'active' : ''}`} type="button" role="tab" aria-selected={tenantActiveTab === 'personal'} onClick={() => setTenantActiveTab('personal')}>Personal information</button>
              <button className={`tenant-tab ${tenantActiveTab === 'financial' ? 'active' : ''}`} type="button" role="tab" aria-selected={tenantActiveTab === 'financial'} onClick={() => setTenantActiveTab('financial')}>Financial</button>
              <button className={`tenant-tab ${tenantActiveTab === 'documents' ? 'active' : ''}`} type="button" role="tab" aria-selected={tenantActiveTab === 'documents'} onClick={() => setTenantActiveTab('documents')}>Documents</button>
              <button className={`tenant-tab ${tenantActiveTab === 'mailbox' ? 'active' : ''}`} type="button" role="tab" aria-selected={tenantActiveTab === 'mailbox'} onClick={() => setTenantActiveTab('mailbox')}>Mailbox</button>
            </div>

            {tenantActiveTab === 'activity' && (
              <div className="tenant-tab-panel tenant-activity">
                <ul>
                  {tenantInfo.activity.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {tenantActiveTab === 'personal' && (
              <div className="tenant-tab-panel tenant-personal-grid property-meta-grid">
                <div>
                  <span className="meta-label">Name</span>
                  <p>{tenantInfo.name}</p>
                </div>
                <div>
                  <span className="meta-label">Email</span>
                  <p>{tenantInfo.email}</p>
                </div>
                <div>
                  <span className="meta-label">Phone</span>
                  <p>{tenantInfo.phone}</p>
                </div>
                <div>
                  <span className="meta-label">Unit</span>
                  <p>{tenantInfo.unit}</p>
                </div>
                <div>
                  <span className="meta-label">SSN / ITIN / EIN</span>
                  <p>{tenantInfo.taxId || '—'}</p>
                </div>
              </div>
            )}

            {tenantActiveTab === 'financial' && (
              <div className="tenant-tab-panel">
                <div className="tenant-contact-grid">
                  <div className="tenant-detail-card">
                    <h5>Lease</h5>
                    <p><strong>Term:</strong> {tenantInfo.contract}</p>
                    <p><strong>Cycle:</strong> {tenantInfo.cycle}</p>
                    <p><strong>Period:</strong> {tenantInfo.leaseStart} — {tenantInfo.leaseEnd}</p>
                    {tenantInfo.contractUrl ? (
                      <a className="link-button" href={tenantInfo.contractUrl} target="_blank" rel="noreferrer">View contract</a>
                    ) : null}
                  </div>
                  <div className="tenant-detail-card">
                    <h5>Financials</h5>
                    <p><strong>Rent:</strong> {tenantInfo.rent}</p>
                    <p><strong>Deposit:</strong> ${deposit.toLocaleString()}</p>
                    <p><strong>Due amount:</strong> ${due.toLocaleString()}</p>
                    <p><strong>Position:</strong> <span className={statusClass}>{positionLabel}</span></p>
                    <p><strong>Next due:</strong> {tenantInfo.nextDue}</p>
                  </div>
                </div>
              </div>
            )}

            {tenantActiveTab === 'documents' && (
              <div className="tenant-tab-panel">
                <ul className="tenant-documents-list">
                  {tenantInfo.documents.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {tenantActiveTab === 'mailbox' && (
              <div className="tenant-tab-panel mailbox-panel">
                <MailboxPanel messages={tenantInfo.mailbox} />
              </div>
            )}
          </>
        ) : (
          <p className="muted-text">This property does not have a linked tenant contract yet.</p>
        )}
      </div>
    </div>
  )
}
