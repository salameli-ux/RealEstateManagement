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
  return {
    ...tenant,
    isCurrent: Boolean(tenant.isCurrent),
    documents: parseJsonField(tenant.documents),
    activity: parseJsonField(tenant.activity),
    mailbox: parseJsonField(tenant.mailbox),
  }
}
