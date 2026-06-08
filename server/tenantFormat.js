import { formatTenantBank } from './bankFormat.js'

function parseJsonField(value, fallback = []) {
  if (!value) return fallback
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function formatTenant(tenant) {
  if (!tenant) return null
  const {
    bankRoutingNumber,
    bankAccountNumber,
    cardExpMonth,
    cardExpYear,
    ...safeTenant
  } = tenant
  return {
    ...safeTenant,
    isCurrent: Boolean(tenant.isCurrent),
    documents: parseJsonField(tenant.documents),
    activity: parseJsonField(tenant.activity),
    mailbox: parseJsonField(tenant.mailbox),
    bank: formatTenantBank(tenant),
  }
}
