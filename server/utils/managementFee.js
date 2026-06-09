export const DEFAULT_MANAGEMENT_FEE_PERCENT = 10

export function resolveManagementFeePercent(property) {
  const percent = Number(property?.managementFeePercent)
  if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
    return percent
  }
  return DEFAULT_MANAGEMENT_FEE_PERCENT
}

export function calculateManagementFee(amount, percent) {
  const payAmount = Math.round(Number(amount))
  const feePercent = resolveManagementFeePercent({ managementFeePercent: percent })
  return Math.round(payAmount * (feePercent / 100))
}

export function formatManagementFeePercent(percent) {
  const value = Number(percent)
  if (!Number.isFinite(value)) return `${DEFAULT_MANAGEMENT_FEE_PERCENT}%`
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`
}
