import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const tenants = db.prepare('SELECT * FROM tenants ORDER BY id DESC').all().map((tenant) => ({
    ...tenant,
    documents: tenant.documents ? JSON.parse(tenant.documents) : [],
    activity: tenant.activity ? JSON.parse(tenant.activity) : [],
  }))
  res.json(tenants)
})

router.get('/:id', (req, res) => {
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id)
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' })
  res.json({
    ...tenant,
    documents: tenant.documents ? JSON.parse(tenant.documents) : [],
    activity: tenant.activity ? JSON.parse(tenant.activity) : [],
  })
})

router.post('/', (req, res) => {
  const {
    name,
    unit,
    email,
    phone,
    taxId,
    leaseStart,
    leaseEnd,
    rent,
    status,
    nextDue,
    contract,
    cycle,
    documents,
    activity,
  } = req.body

  const stmt = db.prepare(`INSERT INTO tenants (name, unit, email, phone, taxId, leaseStart, leaseEnd, rent, status, nextDue, contract, cycle, documents, activity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const info = stmt.run(
    name,
    unit,
    email,
    phone,
    taxId,
    leaseStart,
    leaseEnd,
    rent,
    status || 'Due',
    nextDue || '',
    contract || '12 month lease',
    cycle || 'Monthly',
    JSON.stringify(documents || []),
    JSON.stringify(activity || [])
  )

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json({
    ...tenant,
    documents: JSON.parse(tenant.documents || '[]'),
    activity: JSON.parse(tenant.activity || '[]'),
  })
})

router.put('/:id', (req, res) => {
  const id = req.params.id
  const existing = db.prepare('SELECT * FROM tenants WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Tenant not found' })

  const {
    name,
    unit,
    email,
    phone,
    taxId,
    leaseStart,
    leaseEnd,
    rent,
    status,
    nextDue,
    contract,
    cycle,
    documents,
    activity,
  } = req.body

  db.prepare(`UPDATE tenants SET name = ?, unit = ?, email = ?, phone = ?, taxId = ?, leaseStart = ?, leaseEnd = ?, rent = ?, status = ?, nextDue = ?, contract = ?, cycle = ?, documents = ?, activity = ? WHERE id = ?`).run(
    name,
    unit,
    email,
    phone,
    taxId,
    leaseStart,
    leaseEnd,
    rent,
    status || 'Due',
    nextDue || '',
    contract || '12 month lease',
    cycle || 'Monthly',
    JSON.stringify(documents || []),
    JSON.stringify(activity || []),
    id
  )

  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(id)
  res.json({
    ...tenant,
    documents: JSON.parse(tenant.documents || '[]'),
    activity: JSON.parse(tenant.activity || '[]'),
  })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tenants WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router
