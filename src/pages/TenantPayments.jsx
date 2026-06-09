import { useEffect, useMemo, useRef, useState } from 'react'
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

function DepositField({ label, value, readOnly = true, name, onChange, type = 'text', placeholder, id, options }) {
  const isAmount = name === 'amount'
  return (
    <div className="ach-deposit-field">
      <label htmlFor={id || name}>{label}</label>
      {readOnly ? (
        <div className="ach-deposit-value">{value || '—'}</div>
      ) : options ? (
        <select id={id || name} name={name} value={value} onChange={onChange}>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          id={id || name}
          name={name}
          type={isAmount ? 'text' : type}
          inputMode={isAmount ? 'numeric' : undefined}
          value={value}
          onChange={onChange}
          onWheel={isAmount ? (event) => event.currentTarget.blur() : undefined}
          placeholder={placeholder}
          required={isAmount}
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
  const [creditForm, setCreditForm] = useState({
    cardName: '',
    cardNumber: '',
    cardExp: '',
    cardCvv: '',
  })
  const [achForm, setAchForm] = useState({
    accountHolder: '',
    bankName: '',
    accountType: 'Checking',
    routingNumber: '',
    accountNumber: '',
  })
  const amountInitializedRef = useRef(false)
  const lastTenantIdRef = useRef(null)

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

    const switchedTenant = lastTenantIdRef.current !== tenant.id
    if (switchedTenant) {
      lastTenantIdRef.current = tenant.id
      amountInitializedRef.current = false
    }

    setDepositForm((prev) => ({
      ...prev,
      paymentDate: todayIso(),
      reference:
        switchedTenant || !prev.reference
          ? `INV-TNT-${tenant.name.split(' ')[0].toUpperCase()}-${todayIso().replace(/-/g, '')}`
          : prev.reference,
      description:
        switchedTenant || !prev.description
          ? `Rent deposit — ${tenant.unit || tenant.name}`
          : prev.description,
      amount:
        !amountInitializedRef.current && suggestedAmount
          ? String(suggestedAmount)
          : prev.amount,
    }))

    if (suggestedAmount) {
      amountInitializedRef.current = true
    }
  }, [tenant, suggestedAmount])

  useEffect(() => {
    if (!tenant) return
    setCreditForm({
      cardName: tenant.bank?.bankAccountHolder || tenant.name || '',
      cardNumber: '',
      cardExp: tenant.bank?.cardExp || '',
      cardCvv: '',
    })
    setAchForm({
      accountHolder: tenant.bank?.bankAccountHolder || tenant.name || '',
      bankName: tenant.bank?.bankName || '',
      accountType: tenant.bank?.bankAccountType || 'Checking',
      routingNumber: '',
      accountNumber: '',
    })
  }, [tenant?.id])

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

  const handleCreditChange = (event) => {
    const { name, value } = event.target
    setCreditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAchChange = (event) => {
    const { name, value } = event.target
    setAchForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePay = async (event) => {
    event.preventDefault()
    if (!tenant) return
    if (payMethod === 'Credit') {
      const missingCard = !creditForm.cardName.trim()
        || !creditForm.cardNumber.trim()
        || !creditForm.cardExp.trim()
        || !creditForm.cardCvv.trim()
      if (missingCard) {
        setError('Enter credit card details.')
        return
      }
    } else {
      const missingAch = !achForm.accountHolder.trim()
        || !achForm.bankName.trim()
        || !achForm.routingNumber.trim()
        || !achForm.accountNumber.trim()
      if (missingAch) {
        setError('Enter bank account details.')
        return
      }
    }
    setSubmitting(true)
    setError('')
    setSuccessMessage('')
    try {
      const result = await submitTenantPayment({
        tenantId: tenant.id,
        method: payMethod,
        amount: parseMoney(depositForm.amount),
        paymentDate: depositForm.paymentDate,
        reference: depositForm.reference,
        description: depositForm.description,
        recurringEnabled: depositForm.recurringEnabled,
        recurringCycle: depositForm.recurringCycle,
        recurringDay: depositForm.recurringEnabled ? Number(depositForm.recurringDay) : null,
      })
      const feeLabel = result.managementFeePercent != null
        ? `${result.managementFeePercent}%`
        : 'contract rate'
      const feeNote = result.managementFee
        ? ` A ${feeLabel} Management Fee ($${result.managementFee.toLocaleString()}) was transferred to the PM account.`
        : ''
      setSuccessMessage(
        `Payment of $${result.amount.toLocaleString()} posted to the owner ledger.${feeNote}`
      )
      setTenant(result.tenant)
      const refreshed = await fetchTenantPayments(tenant.id)
      setRequests(refreshed.requests || [])
      setPayments(refreshed.payments || [])
      setDepositForm((prev) => ({
        ...prev,
        amount: String(parseMoney(result.tenant?.rent) || result.amount),
      }))
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
      <div className="ach-detail-pane tenant-payments-page">
        <form className="ach-deposit-flow" onSubmit={handlePay}>
          {successMessage ? (
            <div className="ach-deposit-done" role="status">
              <strong>Payment recorded</strong>
              <p>{successMessage}</p>
            </div>
          ) : null}

          <div className="tenant-payment-form-grid">
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
                <DepositField label="Amount" value={depositForm.amount} readOnly={false} name="amount" onChange={handleFormChange} id="amount" />
                <DepositField label="Payment date" value={depositForm.paymentDate} readOnly={false} name="paymentDate" onChange={handleFormChange} type="date" id="paymentDate" />
                <DepositField label="Reference / invoice" value={depositForm.reference} readOnly={false} name="reference" onChange={handleFormChange} id="reference" />
                <DepositField label="Memo / comment" value={depositForm.description} readOnly={false} name="description" onChange={handleFormChange} placeholder="Rent deposit" id="description" />
                <DepositField label="Property" value={property?.address || tenant.unit || '—'} />
              </div>
            </div>

            <div className="ach-deposit-section">
              <h4>Recurring payments</h4>
              <p className="muted-text">Saved now — auto-pay coming soon.</p>
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
                    {' '}Enable recurring payment
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

            <div className="card tenant-pay-bubble">
              <fieldset className="tenant-pay-method">
                <legend className="visually-hidden">Payment method</legend>
                <label className="tenant-pay-radio">
                  <input
                    type="radio"
                    name="payMethod"
                    value="ACH"
                    checked={payMethod === 'ACH'}
                    onChange={() => {
                      setPayMethod('ACH')
                      setError('')
                    }}
                  />
                  ACH transfer
                </label>
                <label className="tenant-pay-radio">
                  <input
                    type="radio"
                    name="payMethod"
                    value="Credit"
                    checked={payMethod === 'Credit'}
                    onChange={() => {
                      setPayMethod('Credit')
                      setError('')
                    }}
                  />
                  Credit card
                </label>
              </fieldset>

              {payMethod === 'ACH' ? (
                <div className="tenant-pay-method-fields">
                  <DepositField
                    label="Account holder"
                    value={achForm.accountHolder}
                    readOnly={false}
                    name="accountHolder"
                    onChange={handleAchChange}
                    id="accountHolder"
                    placeholder="Kelly Rivera"
                  />
                  <DepositField
                    label="Bank name"
                    value={achForm.bankName}
                    readOnly={false}
                    name="bankName"
                    onChange={handleAchChange}
                    id="bankName"
                    placeholder="Bank of America"
                  />
                  <DepositField
                    label="Account type"
                    value={achForm.accountType}
                    readOnly={false}
                    name="accountType"
                    onChange={handleAchChange}
                    id="accountType"
                    options={['Checking', 'Savings']}
                  />
                  <DepositField
                    label="Routing number"
                    value={achForm.routingNumber}
                    readOnly={false}
                    name="routingNumber"
                    onChange={handleAchChange}
                    id="routingNumber"
                    placeholder="063100277"
                  />
                  <DepositField
                    label="Account number"
                    value={achForm.accountNumber}
                    readOnly={false}
                    name="accountNumber"
                    onChange={handleAchChange}
                    id="accountNumber"
                    placeholder="4890127890"
                  />
                </div>
              ) : (
                <div className="tenant-pay-method-fields">
                  <DepositField
                    label="Name on card"
                    value={creditForm.cardName}
                    readOnly={false}
                    name="cardName"
                    onChange={handleCreditChange}
                    id="cardName"
                    placeholder="Kelly Rivera"
                  />
                  <DepositField
                    label="Card number"
                    value={creditForm.cardNumber}
                    readOnly={false}
                    name="cardNumber"
                    onChange={handleCreditChange}
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                  />
                  <DepositField
                    label="Expiration"
                    value={creditForm.cardExp}
                    readOnly={false}
                    name="cardExp"
                    onChange={handleCreditChange}
                    id="cardExp"
                    placeholder="MM/YY"
                  />
                  <DepositField
                    label="CVV"
                    value={creditForm.cardCvv}
                    readOnly={false}
                    name="cardCvv"
                    onChange={handleCreditChange}
                    id="cardCvv"
                    placeholder="123"
                  />
                </div>
              )}

              {error ? <p className="form-error">{error}</p> : null}

              <button className="primary-button ach-submit-button" type="submit" disabled={submitting || !depositForm.amount}>
                {submitting ? 'Processing...' : 'Submit payment'}
              </button>
            </div>
          </div>
        </form>

        <div className="card tenant-payment-history">
          <h3 className="ach-list-heading">Payment history</h3>
          {requests.length === 0 && payments.length === 0 ? (
            <p className="ach-list-empty">No payments submitted yet.</p>
          ) : (
            <>
              {requests.length > 0 ? (
                <div className="tenant-payment-history-section">
                  <h4 className="ach-list-heading">Your payment requests</h4>
                  <div className="contact-group tenant-history-list">
                    {requests.map((item) => (
                      <div key={item.id} className="contact-row tenant-history-row">
                        <div className="contact-row-body">
                          <span className="contact-row-title">
                            ${item.amount.toLocaleString()} · {item.paymentDate || '—'}
                            {item.recurringEnabled ? ` · Recurring ${item.recurringCycle?.toLowerCase() || ''}` : ''}
                          </span>
                        </div>
                        <span className={`status-badge ${item.status === 'Completed' ? 'status-paid' : 'status-due'}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {payments.length > 0 ? (
                <div className="tenant-payment-history-section">
                  <h4 className="ach-list-heading">Ledger entries</h4>
                  <div className="contact-group tenant-history-list">
                    {payments.map((payment) => (
                      <div key={payment.id} className="contact-row tenant-history-row">
                        <div className="contact-row-body">
                          <span className="contact-row-title">
                            {payment.type} — ${payment.amount.toLocaleString()}
                            {payment.paymentDate || payment.paidDate ? ` · ${payment.paidDate || payment.paymentDate}` : ''}
                          </span>
                        </div>
                        <span className={`status-badge ${
                          payment.status === 'Paid'
                            ? 'status-paid'
                            : payment.status === 'Overdue'
                              ? 'status-overdue'
                              : 'status-due'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
