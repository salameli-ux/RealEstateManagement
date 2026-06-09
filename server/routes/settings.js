import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const settings = db.prepare('SELECT currency, taxRate FROM app_settings WHERE id = 1').get()
  const teamMembers = db.prepare('SELECT id, name, role, status FROM team_members ORDER BY name COLLATE NOCASE').all()
  const permissions = db.prepare('SELECT id, title, description, status FROM permission_roles ORDER BY id').all()
  const integrations = db
    .prepare('SELECT id, name, description, enabled FROM integrations ORDER BY id')
    .all()
    .map((row) => ({ ...row, enabled: Boolean(row.enabled) }))

  res.json({
    currency: settings?.currency || 'USD',
    taxRate: settings?.taxRate || '8.5',
    teamMembers,
    permissions,
    integrations,
  })
})

router.put('/', (req, res) => {
  const { currency, taxRate } = req.body
  if (currency !== undefined) {
    db.prepare('UPDATE app_settings SET currency = ? WHERE id = 1').run(currency)
  }
  if (taxRate !== undefined) {
    db.prepare('UPDATE app_settings SET taxRate = ? WHERE id = 1').run(String(taxRate))
  }
  const settings = db.prepare('SELECT currency, taxRate FROM app_settings WHERE id = 1').get()
  res.json(settings)
})

router.put('/integrations/:id', (req, res) => {
  const id = req.params.id
  const existing = db.prepare('SELECT * FROM integrations WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Integration not found' })

  const enabled = req.body.enabled !== undefined ? (req.body.enabled ? 1 : 0) : existing.enabled
  db.prepare('UPDATE integrations SET enabled = ? WHERE id = ?').run(enabled, id)
  const integration = db.prepare('SELECT id, name, description, enabled FROM integrations WHERE id = ?').get(id)
  res.json({ ...integration, enabled: Boolean(integration.enabled) })
})

export default router
