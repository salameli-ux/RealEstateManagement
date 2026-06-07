import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { fetchPayments, createPayment, fetchTenants, fetchProperties } from '../services/api'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState({
    invoiceNumber: '',
    tenantId: '',
    propertyId: '',
    amount: '',
    currency: 'USD',
    type: 'Rent',
    status: 'Pending',
    dueDate: '',
    paidDate: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedTenantId, setSelectedTenantId] = useState('')

  const totalDeposit = payments
    .filter((payment) => payment.type === 'Deposit')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)

  const totalDue = payments
    .filter((payment) => ['Due', 'Overdue', 'Pending'].includes(payment.status) && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)

  const totalPaid = payments
    .filter((payment) => payment.status === 'Paid' && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)

  const paymentPositionAmount = totalPaid + totalDeposit - totalDue
  const paymentPositionLabel = paymentPositionAmount >= 0 ? 'Balanced' : `Debt $${Math.abs(paymentPositionAmount).toLocaleString()}`
  const paymentPositionStatus = paymentPositionAmount >= 0 ? 'status-paid' : 'status-overdue'

  const selectedTenant = tenants.find((tenant) => tenant.id === Number(selectedTenantId))
  const selectedTenantPayments = payments.filter((payment) => payment.tenantId === Number(selectedTenantId))
  const tenantDeposit = selectedTenantPayments
    .filter((payment) => payment.type === 'Deposit')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const tenantDue = selectedTenantPayments
    .filter((payment) => ['Due', 'Overdue', 'Pending'].includes(payment.status) && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const tenantPaid = selectedTenantPayments
    .filter((payment) => payment.status === 'Paid' && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const tenantPositionAmount = tenantPaid + tenantDeposit - tenantDue
  const tenantPositionLabel = tenantPositionAmount >= 0 ? 'Balanced' : `Debt $${Math.abs(tenantPositionAmount).toLocaleString()}`
  const tenantPositionStatus = tenantPositionAmount >= 0 ? 'status-paid' : 'status-overdue'

  useEffect(() => {
    Promise.all([fetchPayments(), fetchTenants(), fetchProperties()])
      .then(([paymentData, tenantData, propertyData]) => {
        setPayments(paymentData)
        setTenants(tenantData)
        setProperties(propertyData)
      })
      .catch((err) => {
        console.error('Failed to load payments data', err)
        setError('Unable to load payments. Please try again later.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTenantOverviewChange = (event) => {
    setSelectedTenantId(event.target.value)
  }

  const handleAddPayment = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const created = await createPayment({
        invoiceNumber: form.invoiceNumber || undefined,
        tenantId: form.tenantId ? Number(form.tenantId) : null,
        propertyId: form.propertyId ? Number(form.propertyId) : null,
        amount: Number(form.amount) || 0,
        currency: form.currency,
        type: form.type,
        status: form.status,
        dueDate: form.dueDate,
        paidDate: form.paidDate,
        description: form.description,
      })
      setPayments((prev) => [created, ...prev])
      setForm({
        invoiceNumber: '',
        tenantId: '',
        propertyId: '',
        amount: '',
        currency: 'USD',
        type: 'Rent',
        status: 'Pending',
        dueDate: '',
        paidDate: '',
        description: '',
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>Payments & Billing</h2>
          <p>Track rent, fees and overdue collections for tenants and properties.</p>
        </div>
      </div>

      <div className="billing-grid">
        <div className="billing-card card">
          <h3>New payment</h3>
          <form className="form-grid" onSubmit={handleAddPayment}>
            <div className="form-group">
              <label>Invoice #</label>
              <input name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} placeholder="INV-1004" />
            </div>
            <div className="form-group">
              <label>Tenant</label>
              <select name="tenantId" value={form.tenantId} onChange={handleChange}>
                <option value="">Select tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name} — {tenant.unit}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Property</label>
              <select name="propertyId" value={form.propertyId} onChange={handleChange}>
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input name="amount" value={form.amount} onChange={handleChange} placeholder="3250" />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Rent</option>
                <option>Fee</option>
                <option>Deposit</option>
                <option>Refund</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Paid</option>
                <option>Pending</option>
                <option>Due</option>
                <option>Overdue</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due date</label>
              <input name="dueDate" value={form.dueDate} onChange={handleChange} type="date" />
            </div>
            <div className="form-group">
              <label>Paid date</label>
              <input name="paidDate" value={form.paidDate} onChange={handleChange} type="date" />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Late fee, rent, security deposit" />
            </div>
            {error ? <p className="form-error">{error}</p> : null}
            <div className="form-actions full-width">
              <button className="primary-button" type="submit">Save payment</button>
            </div>
          </form>
        </div>

        <div className="billing-card card">
          <h3>Recent billing activity</h3>
          {loading ? (
            <p>Loading payments...</p>
          ) : (
            <>
              <div className="financial-summary">
                <div className="financial-stat card">
                  <p className="stat-label">Security deposit</p>
                  <h4>${totalDeposit.toLocaleString()}</h4>
                </div>
                <div className="financial-stat card">
                  <p className="stat-label">Outstanding obligation</p>
                  <h4>${totalDue.toLocaleString()}</h4>
                </div>
                <div className="financial-stat card">
                  <p className="stat-label">Payment position</p>
                  <h4 className={paymentPositionStatus}>{paymentPositionLabel}</h4>
                </div>
              </div>
              <div className="tenant-overview card">
                <div className="tenant-overview-header">
                  <h4>Tenant financial details</h4>
                  <select name="selectedTenantId" value={selectedTenantId} onChange={handleTenantOverviewChange}>
                    <option value="">All tenants</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name} — {tenant.unit}</option>
                    ))}
                  </select>
                </div>
                {selectedTenant ? (
                  <div className="financial-summary">
                    <div className="financial-stat card">
                      <p className="stat-label">Tenant deposit</p>
                      <h4>${tenantDeposit.toLocaleString()}</h4>
                    </div>
                    <div className="financial-stat card">
                      <p className="stat-label">Tenant outstanding</p>
                      <h4>${tenantDue.toLocaleString()}</h4>
                    </div>
                    <div className="financial-stat card">
                      <p className="stat-label">Tenant position</p>
                      <h4 className={tenantPositionStatus}>{tenantPositionLabel}</h4>
                    </div>
                  </div>
                ) : (
                  <p className="muted-text">Select a tenant to view deposit and billing position.</p>
                )}
              </div>
              <div className="payment-list">
              {payments.length === 0 ? (
                <p>No payments recorded yet.</p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="payment-card">
                    <div className="payment-summary">
                      <div>
                        <h4>{payment.type} — ${payment.amount.toLocaleString()}</h4>
                        <p>{payment.description || 'No description'}</p>
                        <p className="subtle-text">Invoice {payment.invoiceNumber || '—'}</p>
                      </div>
                      <span className={`status-badge ${payment.status === 'Paid' ? 'status-paid' : payment.status === 'Overdue' ? 'status-overdue' : payment.status === 'Due' ? 'status-due' : ''}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="payment-detail-grid">
                      <div>
                        <p className="meta-label">Tenant</p>
                        <p>{payment.tenantName || '—'}</p>
                      </div>
                      <div>
                        <p className="meta-label">Property</p>
                        <p>{payment.propertyTitle || '—'}</p>
                      </div>
                      <div>
                        <p className="meta-label">Due</p>
                        <p>{payment.dueDate || '—'}</p>
                      </div>
                      <div>
                        <p className="meta-label">Paid</p>
                        <p>{payment.paidDate || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
