function parseJsonField(value, fallback = []) {
  if (!value) return fallback
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function formatProperty(property) {
  if (!property) return null
  const { currentTenantCount, ...rest } = property
  return {
    ...rest,
    currentTenantCount,
    hasCurrentTenant: Number(currentTenantCount) > 0,
    ownerDocuments: parseJsonField(property.ownerDocuments),
    ownerMailbox: parseJsonField(property.ownerMailbox),
    managementFeePercent: Number(property.managementFeePercent ?? 10),
  }
}
