export function formatOwnerSignInLabel(owner) {
  return owner?.ownerName || owner?.title || 'Owner'
}

export function formatTenantSignInLabel(tenant) {
  return tenant?.name || 'Tenant'
}

export function formatPmSignInLabel(pm) {
  return pm?.name || pm?.email || 'PM'
}
