const CREDIT_TYPES = new Set(['Rent'])
const DEBIT_TYPES = new Set(['HOA', 'Insurance', 'Tax', 'Management', 'Maintenance', 'Refund'])

export function getPaymentLedgerDelta(payment) {
  if (payment.status !== 'Paid') return 0
  if (CREDIT_TYPES.has(payment.type)) return payment.amount || 0
  if (DEBIT_TYPES.has(payment.type)) return -(payment.amount || 0)
  return 0
}

export function getPaymentLedgerDate(payment) {
  return payment.paidDate || payment.dueDate || ''
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
