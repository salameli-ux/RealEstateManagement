import express from 'express'
import db from '../db.js'
import { formatTenant } from '../tenantFormat.js'
import { recordTenantDeposit } from '../utils/recordTenantDeposit.js'

const router = express.Router()

const mapRequest = (row) => ({
  ...row,
  recurringEnabled: Boolean(row.recurringEnabled),
})

router.get('/:tenantId', (req, res) => {
  const tenant = db.prepare('SELECT id, name FROM tenants WHERE id = ?').get(req.params.tenantId)
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' })

  const requests = db
    .prepare('SELECT * FROM tenant_payment_requests WHERE tenantId = ? ORDER BY id DESC')
    .all(tenant.id)
    .map(mapRequest)

  const payments = db
    .prepare(`SELECT * FROM payments WHERE tenantId = ? AND status != 'Cancelled' ORDER BY id DESC LIMIT 20`)
    .all(tenant.id)

  res.json({ requests, payments })
})

router.post('/', (req, res) => {
  const {
    tenantId,
    method = 'ACH',
    amount,
    paymentDate,
    reference,
    description,
    recurringEnabled = false,
    recurringCycle = 'Monthly',
    recurringDay,
  } = req.body

  if (!tenantId) return res.status(400).json({ error: 'tenantId is required' })

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenantId)
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' })

  try {
    const result = recordTenantDeposit(db, {
      tenant,
      amount,
      method,
      paymentDate,
      reference,
      description,
      recurringEnabled: Boolean(recurringEnabled),
      recurringCycle,
      recurringDay: recurringDay ? Number(recurringDay) : null,
    })

    const updatedTenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenant.id)

    res.json({
      success: true,
      ...result,
      tenant: formatTenant(updatedTenant),
    })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Payment failed' })
  }
})

export default router
