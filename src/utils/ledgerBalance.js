const CREDIT_TYPES = new Set(['Rent'])

export const PM_FEE_TYPES = new Set([
  'Management',
  'Monthly',
  'Convenience',
  'Work Order',
  'Leasing',
  'Inspection',
])

const DEBIT_TYPES = new Set(['HOA', 'Insurance', 'Tax', 'Maintenance', 'Refund', ...PM_FEE_TYPES])
const SUM_CREDIT_TYPES = new Set(['Rent', 'Deposit'])
const SUM_DEBIT_TYPES = new Set(['HOA', 'Insurance', 'Tax', 'Maintenance', 'Refund', ...PM_FEE_TYPES])

export function getPaymentLedgerDelta(payment) {
  if (payment.status !== 'Paid') return 0
  if (CREDIT_TYPES.has(payment.type)) return payment.amount || 0
  if (DEBIT_TYPES.has(payment.type)) return -(payment.amount || 0)
  return 0
}

export function getPaymentLedgerDate(payment) {
  return payment.paidDate || payment.dueDate || ''
}

const OPERATION_LABELS = {
  Rent: 'Rent collection',
  Deposit: 'Tenant deposit',
  HOA: 'HOA assessment',
  Insurance: 'Insurance',
  Tax: 'Property tax',
  Management: 'Management fee',
  Monthly: 'Monthly fee',
  Convenience: 'Convenience fee',
  'Work Order': 'Work order fee',
  Leasing: 'Leasing fee',
  Inspection: 'Inspection fee',
  Maintenance: 'Maintenance',
  Refund: 'Refund',
}

export function getLedgerOperationCode(payment) {
  return OPERATION_LABELS[payment.type] || payment.type || 'Transaction'
}

export function formatLedgerDate(value) {
  if (!value) return '—'
  const parsed = new Date(value.includes('-') && !value.includes(',') ? `${value}T12:00:00` : value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getLedgerSumDirection(payment) {
  if (SUM_CREDIT_TYPES.has(payment.type)) return 'credit'
  if (SUM_DEBIT_TYPES.has(payment.type)) return 'debit'
  return 'debit'
}

export function formatLedgerSum(payment) {
  const amount = payment.amount || 0
  return getLedgerSumDirection(payment) === 'credit'
    ? `+$${amount.toLocaleString()}`
    : `-$${amount.toLocaleString()}`
}

function parseLedgerDate(value) {
  if (!value) return 0
  const iso = value.includes('-') && !value.includes(',') ? `${value}T12:00:00` : value
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

export function buildPropertyLedger(openingBalance, payments) {
  const opening = openingBalance || 0
  const sorted = [...payments].sort((a, b) => {
    const dateDiff = parseLedgerDate(getPaymentLedgerDate(a)) - parseLedgerDate(getPaymentLedgerDate(b))
    if (dateDiff !== 0) return dateDiff
    return (a.id || 0) - (b.id || 0)
  })

  let running = opening
  const entries = sorted.map((payment) => {
    const delta = getPaymentLedgerDelta(payment)
    running += delta
    return { payment, delta, balance: running }
  })

  return {
    openingBalance: opening,
    currentBalance: running,
    entries: [...entries].reverse(),
  }
}
