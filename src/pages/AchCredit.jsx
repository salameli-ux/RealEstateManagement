import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { fetchTenants, fetchPayments, fetchProperties, submitRentTransfer } from '../services/api'

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

export default function AchCredit() {
  const [searchParams] = useSearchParams()
  const [tenants, setTenants] = useState([])
  const [properties, setProperties] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [payMethod, setPayMethod] = useState('ACH')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [ledgerPropertyId, setLedgerPropertyId] = useState(null)
  const [error, setError] = useState('')
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [depositForm, setDepositForm] = useState({
    depositType: 'Rent',
    amount: '',
    paymentDate: todayIso(),
    reference: '',
    description: '',
  })

  const listTenants = useMemo(() => {
    const current = tenants.filter((tenant) => tenant.propertyId && tenant.isCurrent !== false)
    if (current.length) return current
    return tenants.filter((tenant) => tenant.propertyId)
  }, [tenants])

  useEffect(() => {
    Promise.all([
      fetchTenants(),
      fetchPayments().catch(() => []),
      fetchProperties().catch(() => []),
    ])
      .then(([tenantData, paymentData, propertyData]) => {
        setTenants(tenantData)
        setPayments(paymentData)
        setProperties(propertyData)

        const queryId = searchParams.get('tenantId')
        const fromQuery = tenantData.find((tenant) => String(tenant.id) === String(queryId))
        const firstPayable = tenantData.find((tenant) => tenant.propertyId && tenant.isCurrent !== false)
          || tenantData.find((tenant) => tenant.propertyId)
        const first = fromQuery || firstPayable
        if (first) setSelectedTenantId(String(first.id))
      })
      .catch((err) => {
        console.error('Failed to load ACH/Credit page', err)
        setError('Unable to load tenants.')
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  const selectedTenant = listTenants.find((tenant) => String(tenant.id) === String(selectedTenantId))
    || tenants.find((tenant) => String(tenant.id) === String(selectedTenantId))
  const selectedProperty = properties.find((property) => Number(property.id) === Number(selectedTenant?.propertyId))

  const suggestedAmount = useMemo(() => {
    if (!selectedTenant) return 0
    const duePayments = payments.filter(
      (payment) =>
        Number(payment.tenantId) === Number(selectedTenant.id) &&
        ['Due', 'Overdue', 'Pending'].includes(payment.status) &&
        payment.type === 'Rent'
    )
    if (duePayments.length) {
      return duePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    }
    return parseMoney(selectedTenant.rent)
  }, [payments, selectedTenant])

  useEffect(() => {
    if (!selectedTenant) return
    setDepositForm({
      depositType: 'Rent',
      amount: suggestedAmount ? String(suggestedAmount) : '',
      paymentDate: todayIso(),
      reference: `INV-ACH-${selectedTenant.name.split(' ')[0].toUpperCase()}-${todayIso().replace(/-/g, '')}`,
      description: `Rent deposit — ${selectedTenant.unit || selectedTenant.name}`,
    })
    setError('')
  }, [selectedTenantId, suggestedAmount, selectedTenant])

  useEffect(() => {
    setSuccessMessage('')
    setLedgerPropertyId(null)
  }, [selectedTenantId])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setDepositForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePay = async (event) => {
    event.preventDefault()
    if (!selectedTenant) return
    setSubmitting(true)
    setError('')
    setSuccessMessage('')
    setLedgerPropertyId(null)
    try {
      const result = await submitRentTransfer({
        tenantId: selectedTenant.id,
        method: payMethod,
        amount: Number(depositForm.amount),
        paymentDate: depositForm.paymentDate,
        reference: depositForm.reference,
        description: depositForm.description,
      })
      setSuccessMessage(
        `Deposit done — $${result.amount.toLocaleString()} recorded for ${result.tenant?.name || selectedTenant.name}.${
          result.managementFee ? ` Management fee $${result.managementFee.toLocaleString()} (10%) transferred to PM account.` : ''
        }`
      )
      setLedgerPropertyId(result.property?.id || selectedTenant.propertyId)
      setTenants((prev) => prev.map((tenant) => (tenant.id === result.tenant.id ? result.tenant : tenant)))
      setPayments(await fetchPayments())
    } catch (err) {
      const message = err.message || 'Payment failed.'
      setError(message === 'Not Found' ? 'Payment API not available — restart the server (npm run server) and try again.' : message)
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

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>ACH / Credit</h2>
          <p>Demo mode — enter amount and submit. No bank or card details required; payment is recorded immediately.</p>
        </div>
      </div>

      <div className="ach-page-layout">
        <aside className="ach-tenant-list-pane properties-list-pane">
          <div className="ach-list-heading">Tenants</div>
          <div className="contact-group ach-tenant-contact-list">
            {listTenants.length === 0 ? (
              <div className="ach-list-empty">No tenants linked to a property yet.</div>
            ) : (
              listTenants.map((tenant) => {
                const isActive = String(tenant.id) === String(selectedTenantId)
                return (
                  <button
                    key={tenant.id}
                    type="button"
                    className={`contact-row ach-tenant-row${isActive ? ' active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => setSelectedTenantId(String(tenant.id))}
                  >
                    <div className="contact-row-body">
                      <span className="contact-row-title">{tenant.name}</span>
                      <span className="contact-row-subtitle">
                        {tenant.unit}{tenant.rent ? ` · $${parseMoney(tenant.rent).toLocaleString()}/mo` : ''}
                      </span>
                    </div>
                    <span className={`status-badge ${tenant.status === 'Paid' ? 'status-paid' : tenant.status === 'Due' ? 'status-due' : 'status-overdue'}`}>
                      {tenant.status}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        <div className="ach-detail-pane">
          {!selectedTenant ? (
            <div className="ach-page-empty">Select a tenant from the list on the left.</div>
          ) : (
            <form className="ach-deposit-flow" onSubmit={handlePay}>
              {successMessage ? (
                <div className="ach-deposit-done" role="status">
                  <strong>Deposit done</strong>
                  <p>{successMessage}</p>
                  {ledgerPropertyId ? (
                    <Link to={`/properties/${ledgerPropertyId}`}>View owner ledger →</Link>
                  ) : null}
                </div>
              ) : null}

              <div className="card ach-deposit-slip">
                <div className="ach-deposit-slip-header">
                  <div>
                    <h3>Deposit slip</h3>
                    <p>{selectedTenant.name} · {selectedProperty?.address || selectedTenant.unit}</p>
                  </div>
                  <span className="ach-demo-badge">Demo</span>
                </div>

                <div className="ach-deposit-section">
                  <h4>Deposit details</h4>
                  <div className="ach-deposit-grid">
                    <div className="ach-deposit-field">
                      <label htmlFor="depositType">Deposit type</label>
                      <select id="depositType" name="depositType" value={depositForm.depositType} onChange={handleFormChange}>
                        <option value="Rent">Rent</option>
                        <option value="Deposit">Security deposit</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <DepositField label="Amount" value={depositForm.amount} readOnly={false} name="amount" onChange={handleFormChange} type="number" id="amount" />
                    <DepositField label="Payment date" value={depositForm.paymentDate} readOnly={false} name="paymentDate" onChange={handleFormChange} type="date" id="paymentDate" />
                    <DepositField label="Reference / invoice" value={depositForm.reference} readOnly={false} name="reference" onChange={handleFormChange} id="reference" />
                    <DepositField label="Memo / comment" value={depositForm.description} readOnly={false} name="description" onChange={handleFormChange} placeholder="Rent deposit — Unit 12B" id="description" />
                    <DepositField label="Owner ledger property" value={selectedProperty?.address || '—'} />
                  </div>
                </div>

              </div>

              <div className="card ach-pay-panel">
                <p className="ach-submit-note">Demo: submit simulates a completed {payMethod === 'Credit' ? 'credit card' : 'ACH'} deposit and posts rent to the owner ledger.</p>
                <div className="tenant-tabs" role="tablist">
                  <button className={`tenant-tab ${payMethod === 'ACH' ? 'active' : ''}`} type="button" onClick={() => setPayMethod('ACH')}>ACH transfer</button>
                  <button className={`tenant-tab ${payMethod === 'Credit' ? 'active' : ''}`} type="button" onClick={() => setPayMethod('Credit')}>Credit card</button>
                </div>

                {error ? <p className="form-error">{error}</p> : null}

                <button className="primary-button ach-submit-button" type="submit" disabled={submitting || !depositForm.amount}>
                  {submitting ? 'Processing...' : payMethod === 'Credit' ? 'Submit credit deposit' : 'Submit deposit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
