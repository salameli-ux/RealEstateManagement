import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProperty, fetchPayments } from '../services/api'
import { tenantDetailsMap } from '../data/tenantDetails'

export default function PropertyDetailsPanel() {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
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
        <div>
          <h2>{property.title}</h2>
          <p className="property-detail-address">{property.address}</p>
        </div>
        <span className={`status-badge ${property.status === 'Leased' ? 'status-paid' : property.status === 'Available' ? 'status-due' : 'status-overdue'}`}>
          {property.status}
        </span>
      </div>

      <div className="property-list">
        <div className="property-card card">
          <div className="property-media">
            {property.imageUrl ? <img src={property.imageUrl} alt={property.title} /> : <div className="property-image-placeholder">{property.type}</div>}
          </div>
          <div className="property-info">
            <div className="property-meta-grid">
              <div>
                <span className="meta-label">Type</span>
                <p>{property.type}</p>
              </div>
              <div>
                <span className="meta-label">Price</span>
                <p>${property.price.toLocaleString()}</p>
              </div>
              <div>
                <span className="meta-label">Rent</span>
                <p>${property.rent.toLocaleString()}</p>
              </div>
              <div>
                <span className="meta-label">Beds</span>
                <p>{property.beds}</p>
              </div>
            </div>
            <div className="property-meta-grid">
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

      <div className="tenant-details-panel card">
        <div className="tenant-card-header">
          <div>
            <h4>Tenant details</h4>
            <p>{tenantInfo?.name || 'No tenant assigned to this property yet.'}</p>
          </div>
          <span className={`status-badge ${tenantInfo?.status === 'Paid' ? 'status-paid' : tenantInfo?.status === 'Due' ? 'status-due' : 'status-overdue'}`}>
            {tenantInfo?.status || 'Unassigned'}
          </span>
        </div>

        {tenantInfo ? (
          <>
            <div className="tenant-tabs">
              <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('overview')}>Overview</button>
              <button className={`tab-btn ${activeTab === 'lease' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('lease')}>Lease</button>
            </div>

            {activeTab === 'overview' ? (
              <>
                <div className="tenant-contact-grid">
                  <div className="tenant-detail-card">
                    <h5>Contact</h5>
                    <p><strong>Email:</strong> {tenantInfo.email}</p>
                    <p><strong>Phone:</strong> {tenantInfo.phone}</p>
                    <p><strong>Unit:</strong> {tenantInfo.unit}</p>
                  </div>
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
                <div className="tenant-activity">
                  <h5>Recent activity</h5>
                  <ul>
                    {tenantInfo.activity.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="tenant-lease-card">
                <h5>Lease details</h5>
                <p><strong>Lease start:</strong> {tenantInfo.leaseStart}</p>
                <p><strong>Lease end:</strong> {tenantInfo.leaseEnd}</p>
                {tenantInfo.contractUrl ? (
                  <p><a className="link-button" href={tenantInfo.contractUrl} target="_blank" rel="noreferrer">View contract</a></p>
                ) : null}
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
