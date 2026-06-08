import express from 'express'
import db from '../db.js'
import { formatTenant } from '../tenantFormat.js'

const router = express.Router()

router.post('/', (req, res) => {
  const { tenantId, method = 'ACH', amount, paymentDate, reference, description } = req.body
  if (!tenantId) return res.status(400).json({ error: 'tenantId is required' })

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId)
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' })

  if (!tenant.propertyId) {
    return res.status(400).json({ error: 'Tenant is not linked to a property' })
  }

  const pmAccount = db.prepare('SELECT * FROM pm_account WHERE id = 1').get()

  const parsedRent = Number(String(tenant.rent || '').replace(/\D/g, ''))
  const payAmount = Number(amount) || parsedRent
  if (!payAmount) return res.status(400).json({ error: 'Deposit amount is required' })

  const today = new Date().toISOString().slice(0, 10)
  const paidDate = paymentDate || today
  const transferLabel = method === 'Credit' ? 'Credit card' : 'ACH'
  const invoiceNumber = reference?.trim() || `INV-ACH-${Date.now()}`
  const paymentDescription =
    description?.trim() ||
    `${transferLabel} rent deposit to PM — ${tenant.name}`

  db.prepare(`UPDATE payments SET status = 'Cancelled'
    WHERE tenantId = ? AND type = 'Rent' AND status IN ('Due', 'Overdue', 'Pending')`).run(tenantId)

  const info = db
    .prepare(`INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      invoiceNumber,
      tenant.id,
      tenant.propertyId,
      payAmount,
      'USD',
      'Rent',
      'Paid',
      paidDate,
      paidDate,
      paymentDescription
    )

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(info.lastInsertRowid)
  const property = db.prepare('SELECT id, title, address FROM properties WHERE id = ?').get(tenant.propertyId)

  const activity = tenant.activity ? JSON.parse(tenant.activity) : []
  activity.unshift(`${paidDate} — ${transferLabel} deposit of $${payAmount.toLocaleString()} posted to owner ledger`)
  db.prepare('UPDATE tenants SET status = ?, activity = ? WHERE id = ?').run('Paid', JSON.stringify(activity.slice(0, 20)), tenant.id)

  const updatedTenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenant.id)

  res.json({
    success: true,
    method,
    amount: payAmount,
    payment,
    property,
    tenant: formatTenant(updatedTenant),
    depositAccount: pmAccount
      ? {
          companyName: pmAccount.companyName,
          bankName: pmAccount.bankName,
          accountType: pmAccount.accountType,
        }
      : null,
  })
})

export default router
