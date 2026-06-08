export function maskNumber(value) {
  if (!value) return '—'
  const digits = String(value).replace(/\D/g, '')
  if (digits.length <= 4) return digits
  return `••••${digits.slice(-4)}`
}

export function formatPmAccount(account) {
  if (!account) return null
  const { routingNumber, accountNumber, ...rest } = account
  return {
    ...rest,
    routingMasked: maskNumber(routingNumber),
    accountMasked: maskNumber(accountNumber),
  }
}

export function formatTenantBank(tenant) {
  if (!tenant) return null
  return {
    bankName: tenant.bankName || '',
    bankAccountType: tenant.bankAccountType || '',
    bankAccountHolder: tenant.bankAccountHolder || tenant.name || '',
    bankRoutingMasked: maskNumber(tenant.bankRoutingNumber),
    bankAccountMasked: maskNumber(tenant.bankAccountNumber),
    cardBrand: tenant.cardBrand || '',
    cardLast4: tenant.cardLast4 || '',
    cardExp:
      tenant.cardExpMonth && tenant.cardExpYear
        ? `${tenant.cardExpMonth}/${tenant.cardExpYear}`
        : '',
  }
}
