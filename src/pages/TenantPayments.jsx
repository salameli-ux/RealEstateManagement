import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../auth/AuthProvider'
import {
  fetchTenant,
  fetchTenantPayments,
  submitTenantPayment,
  fetchProperties,
} from '../services/api'

function parseMoney(value) {
  const amount = Number(String(value || '').replace(/\D/g, ''))
  return Number.isNaN(amount) ? 0 : amount
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function DepositField({ label, value, readOnly = true, name, onChange, type = 'text', placeholder, id }) {
  return (
    <div className="ach-deposit-field">
      <label htmlFor={id || name}>{label}</label>
      {readOnly ? (
        <div className="ach-deposit-value">{value || '—'}</div>
      ) : (
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={name === 'amount'}
        />
      )}
    </div>
  )
}

export default function TenantPayments() {
  const { session } = useAuth()
  const [tenant, setTenant] = useState(null)
  const [property, setProperty] = useState(null)
  const [requests, setRequests] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [payMethod, setPayMethod] = useState('ACH')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [depositForm, setDepositForm] = useState({
    amount: '',
    paymentDate: todayIso(),
    reference: '',
    description: '',
    recurringEnabled: false,
    recurringCycle: 'Monthly',
    recurringDay: '1',
  })

  useEffect(() => {
    if (!session?.entityId) return
    setLoading(true)
    Promise.all([
      fetchTenant(session.entityId),
      fetchTenantPayments(session.entityId),
      fetchProperties().catch(() => []),
    ])
      .then(([tenantData, paymentData, propertyData]) => {
        setTenant(tenantData)
        setRequests(paymentData.requests || [])
        setPayments(paymentData.payments || [])
        const linked = propertyData.find((item) => Number(item.id) === Number(tenantData.propertyId))
        setProperty(linked || null)
      })
      .catch(() => setError('Unable to load payment details.'))
      .finally(() => setLoading(false))
  }, [session?.entityId])

  const suggestedAmount = useMemo(() => {
    if (!tenant) return 0
    const duePayments = payments.filter(
      (payment) =>
        ['Due', 'Overdue', 'Pending'].includes(payment.status) &&
        payment.type === 'Rent'
    )
    if (duePayments.length) {
      return duePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    }
    return parseMoney(tenant.rent)
  }, [payments, tenant])

  useEffect(() => {
    if (!tenant) return
    setDepositForm((prev) => ({
      ...prev,
      amount: suggestedAmount ? String(suggestedAmount) : prev.amount,
      paymentDate: todayIso(),
      reference: prev.reference || `INV-TNT-${tenant.name.split(' ')[0].toUpperCase()}-${todayIso().replace(/-/g, '')}`,
      description: prev.description || `Rent deposit — ${tenant.unit || tenant.name}`,
    }))
  }, [tenant, suggestedAmount])

  if (!session || session.role !== 'tenant') {
    return <Navigate to="/" replace />
  }

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target
    setDepositForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handlePay = async (event) => {
    event.preventDefault()
    if (!tenant) return
    setSubmitting(true)
    setError('')
    setSuccessMessage('')
    try {
      const result = await submitTenantPayment({
        tenantId: tenant.id,
        method: payMethod,
        amount: Number(depositForm.amount),
        paymentDate: depositForm.paymentDate,
        reference: depositForm.reference,
        description: depositForm.description,
        recurringEnabled: depositForm.recurringEnabled,
        recurringCycle: depositForm.recurringCycle,
        recurringDay: depositForm.recurringEnabled ? Number(depositForm.recurringDay) : null,
      })
      const feeNote = result.managementFee
        ? ` A 10% management fee ($${result.managementFee.toLocaleString()}) was transferred to the PM account.`
        : ''
      setSuccessMessage(
        `Payment of $${result.amount.toLocaleString()} posted to the owner ledger.${feeNote}`
      )
      setTenant(result.tenant)
      const refreshed = await fetchTenantPayments(tenant.id)
      setRequests(refreshed.requests || [])
      setPayments(refreshed.payments || [])
    } catch (err) {
      setError(err.message || 'Payment failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="ach-page-empty">Loading payment details...</div>
      </MainLayout>
    )
  }

  if (!tenant) {
    return (
      <MainLayout>
        <div className="ach-page-empty">{error || 'Profile not found.'}</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>Payments</h2>
          <p>Submit rent deposits and set up recurring payments for {tenant.name}.</p>
        </div>
      </div>

      <div className="ach-detail-pane tenant-payments-page">
        <form className="ach-deposit-flow" onSubmit={handlePay}>
          {successMessage ? (
            <div className="ach-deposit-done" role="status">
              <strong>Payment recorded</strong>
              <p>{successMessage}</p>
            </div>
          ) : null}

          <div className="card ach-deposit-slip">
            <div className="ach-deposit-slip-header">
              <div>
                <h3>Deposit slip</h3>
                <p>{tenant.name} · {property?.address || tenant.unit}</p>
              </div>
              <span className="ach-demo-badge">Demo</span>
            </div>

            <div className="ach-deposit-section">
              <h4>Deposit details</h4>
              <div className="ach-deposit-grid">
                <DepositField label="Amount" value={depositForm.amount} readOnly={false} name="amount" onChange={handleFormChange} type="number" id="amount" />
                <DepositField label="Payment date" value={depositForm.paymentDate} readOnly={false} name="paymentDate" onChange={handleFormChange} type="date" id="paymentDate" />
                <DepositField label="Reference / invoice" value={depositForm.reference} readOnly={false} name="reference" onChange={handleFormChange} id="reference" />
                <DepositField label="Memo / comment" value={depositForm.description} readOnly={false} name="description" onChange={handleFormChange} placeholder="Rent deposit" id="description" />
                <DepositField label="Property" value={property?.address || tenant.unit || '—'} />
              </div>
            </div>

            <div className="ach-deposit-section">
              <h4>Recurring payments</h4>
              <p className="muted-text">Saved to your account now — automatic processing will be enabled soon.</p>
              <div className="ach-deposit-grid">
                <div className="ach-deposit-field ach-recurring-toggle">
                  <label htmlFor="recurringEnabled">
                    <input
                      id="recurringEnabled"
                      name="recurringEnabled"
                      type="checkbox"
                      checked={depositForm.recurringEnabled}
                      onChange={handleFormChange}
                    />
                    {' '}Enable recurring rent payment
                  </label>
                </div>
                {depositForm.recurringEnabled ? (
                  <>
                    <div className="ach-deposit-field">
                      <label htmlFor="recurringCycle">Frequency</label>
                      <select id="recurringCycle" name="recurringCycle" value={depositForm.recurringCycle} onChange={handleFormChange}>
                        <option value="Monthly">Monthly</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                    </div>
                    {depositForm.recurringCycle === 'Monthly' ? (
                      <div className="ach-deposit-field">
                        <label htmlFor="recurringDay">Day of month</label>
                        <input
                          id="recurringDay"
                          name="recurringDay"
                          type="number"
                          min="1"
                          max="28"
                          value={depositForm.recurringDay}
                          onChange={handleFormChange}
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card ach-pay-panel">
            <p className="ach-submit-note">
              Demo: submit simulates a completed {payMethod === 'Credit' ? 'credit card' : 'ACH'} deposit.
              Rent is credited to the owner ledger; 10% is transferred to the PM account.
            </p>
            <div className="tenant-tabs" role="tablist">
              <button className={`tenant-tab ${payMethod === 'ACH' ? 'active' : ''}`} type="button" onClick={() => setPayMethod('ACH')}>ACH transfer</button>
              <button className={`tenant-tab ${payMethod === 'Credit' ? 'active' : ''}`} type="button" onClick={() => setPayMethod('Credit')}>Credit card</button>
            </div>

            {error ? <p className="form-error">{error}</p> : null}

            <button className="primary-button ach-submit-button" type="submit" disabled={submitting || !depositForm.amount}>
              {submitting ? 'Processing...' : payMethod === 'Credit' ? 'Submit credit payment' : 'Submit payment'}
            </button>
          </div>
        </form>

        <div className="card tenant-payment-history">
          <h3>Payment history</h3>
          {requests.length === 0 && payments.length === 0 ? (
            <p className="muted-text">No payments submitted yet.</p>
          ) : (
            <>
              {requests.length > 0 ? (
                <div className="tenant-payment-history-section">
                  <h4>Your payment requests</h4>
                  <ul className="tenant-payment-request-list">
                    {requests.map((item) => (
                      <li key={item.id} className="tenant-payment-request-item">
                        <div>
                          <strong>${item.amount.toLocaleString()}</strong>
                          <span className="subtle-text"> · {item.paymentDate || '—'}</span>
                          {item.recurringEnabled ? (
                            <span className="pill">Recurring {item.recurringCycle?.toLowerCase() || ''}</span>
                          ) : null}
                        </div>
                        <span className={`status-badge ${item.status === 'Completed' ? 'status-paid' : ''}`}>{item.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {payments.length > 0 ? (
                <div className="tenant-payment-history-section">
                  <h4>Ledger entries</h4>
                  <ul className="tenant-payment-request-list">
                    {payments.map((payment) => (
                      <li key={payment.id} className="tenant-payment-request-item">
                        <div>
                          <strong>{payment.type}</strong> — ${payment.amount.toLocaleString()}
                          <p className="subtle-text">{payment.description || payment.invoiceNumber}</p>
                        </div>
                        <span className={`status-badge ${payment.status === 'Paid' ? 'status-paid' : ''}`}>{payment.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
