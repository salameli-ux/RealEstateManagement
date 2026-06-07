import express from 'express'
import db from '../db.js'

const router = express.Router()

const mapPayment = (payment) => ({
  ...payment,
  tenantName: payment.tenantId ? db.prepare('SELECT name FROM tenants WHERE id = ?').get(payment.tenantId)?.name : null,
  propertyTitle: payment.propertyId ? db.prepare('SELECT title FROM properties WHERE id = ?').get(payment.propertyId)?.title : null,
})

router.get('/', (req, res) => {
  const payments = db.prepare('SELECT * FROM payments ORDER BY dueDate DESC, createdAt DESC').all().map(mapPayment)
  res.json(payments)
})

router.get('/:id', (req, res) => {
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id)
  if (!payment) return res.status(404).json({ error: 'Payment not found' })
  res.json(mapPayment(payment))
})

router.post('/', (req, res) => {
  const { invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description } = req.body
  const stmt = db.prepare('INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const defaultInvoice = invoiceNumber || `INV-${Date.now()}`
  const info = stmt.run(
    defaultInvoice,
    tenantId || null,
    propertyId || null,
    amount || 0,
    currency || 'USD',
    type || 'Rent',
    status || 'Pending',
    dueDate || null,
    paidDate || null,
    description || ''
  )
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(mapPayment(payment))
})

router.put('/:id', (req, res) => {
  const id = req.params.id
  const existing = db.prepare('SELECT * FROM payments WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Payment not found' })

  const { invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description } = req.body
  db.prepare('UPDATE payments SET invoiceNumber = ?, tenantId = ?, propertyId = ?, amount = ?, currency = ?, type = ?, status = ?, dueDate = ?, paidDate = ?, description = ? WHERE id = ?').run(
    invoiceNumber || existing.invoiceNumber,
    tenantId || null,
    propertyId || null,
    amount || 0,
    currency || 'USD',
    type || 'Rent',
    status || 'Pending',
    dueDate || null,
    paidDate || null,
    description || '',
    id
  )
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id)
  res.json(mapPayment(payment))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router
