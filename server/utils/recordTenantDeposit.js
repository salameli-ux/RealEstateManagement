import {
  calculateManagementFee,
  formatManagementFeePercent,
  resolveManagementFeePercent,
} from './managementFee.js'

function parseActivity(tenant) {
  try {
    return tenant.activity ? JSON.parse(tenant.activity) : []
  } catch {
    return []
  }
}

export function recordTenantDeposit(db, {
  tenant,
  amount,
  method = 'ACH',
  paymentDate,
  reference,
  description,
  recurringEnabled = false,
  recurringCycle = 'Monthly',
  recurringDay = null,
}) {
  if (!tenant?.propertyId) {
    throw new Error('Tenant is not linked to a property')
  }

  const property = db.prepare('SELECT id, title, address, managementFeePercent FROM properties WHERE id = ?').get(tenant.propertyId)
  if (!property) {
    throw new Error('Property not found for this tenant')
  }

  const payAmount = Math.round(Number(amount))
  if (!Number.isFinite(payAmount) || payAmount <= 0) {
    throw new Error('Deposit amount is required')
  }

  const feePercent = resolveManagementFeePercent(property)
  const feeLabel = formatManagementFeePercent(feePercent)
  const today = new Date().toISOString().slice(0, 10)
  const paidDate = paymentDate || today
  const transferLabel = method === 'Credit' ? 'Credit card' : 'ACH'
  const stamp = Date.now()
  const rentInvoice = reference?.trim() || `INV-TNT-${tenant.id}-${stamp}`
  const mgmtInvoice = `INV-MGMT-${tenant.id}-${stamp}`
  const mgmtAmount = calculateManagementFee(payAmount, feePercent)

  const rentDescription =
    description?.trim() ||
    `${transferLabel} rent deposit — ${tenant.name}`

  db.prepare(`UPDATE payments SET status = 'Cancelled'
    WHERE tenantId = ? AND type = 'Rent' AND status IN ('Due', 'Overdue', 'Pending')`).run(tenant.id)

  const requestInfo = db.prepare(`
    INSERT INTO tenant_payment_requests (
      tenantId, propertyId, amount, method, paymentDate, reference, description,
      recurringEnabled, recurringCycle, recurringDay, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tenant.id,
    tenant.propertyId,
    payAmount,
    method,
    paidDate,
    rentInvoice,
    rentDescription,
    recurringEnabled ? 1 : 0,
    recurringEnabled ? recurringCycle : null,
    recurringEnabled ? recurringDay : null,
    'Completed'
  )

  const rentInfo = db.prepare(`
    INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    rentInvoice,
    tenant.id,
    tenant.propertyId,
    payAmount,
    'USD',
    'Rent',
    'Paid',
    paidDate,
    paidDate,
    rentDescription
  )

  const mgmtInfo = db.prepare(`
    INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    mgmtInvoice,
    tenant.id,
    tenant.propertyId,
    mgmtAmount,
    'USD',
    'Management',
    'Paid',
    paidDate,
    paidDate,
    `Property management fee (${feeLabel}) — ${tenant.name}`
  )

  const activity = parseActivity(tenant)
  activity.unshift(
    `${paidDate} — ${transferLabel} deposit of $${payAmount.toLocaleString()} posted to owner ledger`,
    `${paidDate} — Management fee $${mgmtAmount.toLocaleString()} (${feeLabel}) transferred to PM account`
  )
  db.prepare('UPDATE tenants SET status = ?, activity = ? WHERE id = ?').run(
    'Paid',
    JSON.stringify(activity.slice(0, 25)),
    tenant.id
  )

  const request = db.prepare('SELECT * FROM tenant_payment_requests WHERE id = ?').get(requestInfo.lastInsertRowid)
  const rentPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(rentInfo.lastInsertRowid)
  const managementPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(mgmtInfo.lastInsertRowid)

  return {
    amount: payAmount,
    managementFee: mgmtAmount,
    managementFeePercent: feePercent,
    method,
    request,
    rentPayment,
    managementPayment,
    property,
  }
}
