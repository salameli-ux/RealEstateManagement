import express from 'express'
import db from '../db.js'
import { formatTenant } from '../tenantFormat.js'
import { recordTenantDeposit } from '../utils/recordTenantDeposit.js'

const router = express.Router()

router.post('/', (req, res) => {
  const { tenantId, method = 'ACH', amount, paymentDate, reference, description } = req.body
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
      recurringEnabled: false,
    })

    const pmAccount = db.prepare('SELECT * FROM pm_account WHERE id = 1').get()
    const updatedTenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(tenant.id)

    res.json({
      success: true,
      method,
      amount: result.amount,
      managementFee: result.managementFee,
      payment: result.rentPayment,
      managementPayment: result.managementPayment,
      property: result.property,
      tenant: formatTenant(updatedTenant),
      depositAccount: pmAccount
        ? {
            companyName: pmAccount.companyName,
            bankName: pmAccount.bankName,
            accountType: pmAccount.accountType,
          }
        : null,
    })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Payment failed' })
  }
})

export default router
