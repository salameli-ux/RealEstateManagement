import { getPaymentLedgerDate, PM_FEE_TYPES } from './ledgerBalance'

function parseFeeDate(value) {
  if (!value) return 0
  const iso = value.includes('-') && !value.includes(',') ? `${value}T12:00:00` : value
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
}

function getMonthKey(dateStr) {
  if (!dateStr) return null
  const iso = dateStr.includes('-') && !dateStr.includes(',') ? `${dateStr}T12:00:00` : dateStr
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function buildManagementFeeSummary(payments) {
  const feePayments = payments.filter((payment) => PM_FEE_TYPES.has(payment.type))

  const byMonth = new Map()
  for (const payment of feePayments) {
    const monthKey = getMonthKey(getPaymentLedgerDate(payment))
    if (!monthKey) continue

    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, {
        monthKey,
        monthLabel: formatMonthLabel(monthKey),
        fees: [],
        paidTotal: 0,
        total: 0,
      })
    }

    const month = byMonth.get(monthKey)
    month.fees.push(payment)
    month.total += payment.amount || 0
    if (payment.status === 'Paid') {
      month.paidTotal += payment.amount || 0
    }
  }

  const months = [...byMonth.values()].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  const entries = feePayments
    .slice()
    .sort((a, b) => parseFeeDate(getPaymentLedgerDate(b)) - parseFeeDate(getPaymentLedgerDate(a)) || (b.id || 0) - (a.id || 0))
  const paidRevenue = months.reduce((sum, month) => sum + month.paidTotal, 0)
  const totalRevenue = months.reduce((sum, month) => sum + month.total, 0)
  const pendingRevenue = totalRevenue - paidRevenue

  return { months, entries, paidRevenue, totalRevenue, pendingRevenue }
}

export function formatManagementFeeSum(payment) {
  return `+$${(payment.amount || 0).toLocaleString()}`
}
