import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { fetchProperty, fetchPayments } from '../services/api'
import { tenantDetailsMap } from '../data/tenantDetails'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setLoading(true)
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
      <MainLayout>
        <div className="page-header">
          <div>
            <h2>Loading property...</h2>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !property) {
    return (
      <MainLayout>
        <div className="page-header">
          <div>
            <h2>Property details</h2>
            <p>{error || 'This property was not found.'}</p>
          </div>
        </div>
        <div className="card">
          <button className="secondary-button" type="button" onClick={() => navigate('/properties')}>
            Back to properties
          </button>
        </div>
      </MainLayout>
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
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>{property.title}</h2>
          <p>Property address, value, lease details and tenant financial status in one page.</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => navigate('/properties')}>
          Back to properties
        </button>
      </div>

      <div className="property-list">
        <div className="property-card card">
          <div className="property-media">
            {property.imageUrl ? <img src={property.imageUrl} alt={property.title} /> : <div className="property-image-placeholder">{property.type}</div>}
          </div>
          <div className="property-info">
            <div className="property-title-row">
              <div>
                <h4>{property.title}</h4>
                <p className="property-address">{property.address}</p>
              </div>
              <span className={`status-badge ${property.status === 'Leased' ? 'status-paid' : property.status === 'Available' ? 'status-due' : 'status-overdue'}`}>
                {property.status}
              </span>
            </div>

            <div className="tenant-description">
              <p className="muted-text">{property.title} — {property.address}</p>
              <p><strong>Lease start:</strong> {tenantInfo?.leaseStart || 'N/A'}</p>
            </div>

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
    </MainLayout>
  )
}
