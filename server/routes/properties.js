import express from 'express'
import db from '../db.js'
import { formatTenant } from '../tenantFormat.js'

const router = express.Router()

router.get('/', (req, res) => {
  const properties = db
    .prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM tenants t WHERE t.propertyId = p.id AND t.isCurrent = 1) AS currentTenantCount
      FROM properties p
      ORDER BY p.id DESC
    `)
    .all()
    .map(({ currentTenantCount, ...property }) => ({
      ...property,
      currentTenantCount,
      hasCurrentTenant: currentTenantCount > 0,
    }))
  res.json(properties)
})

router.get('/:id/tenants', (req, res) => {
  const property = db.prepare('SELECT id FROM properties WHERE id = ?').get(req.params.id)
  if (!property) return res.status(404).json({ error: 'Property not found' })
  const tenants = db
    .prepare('SELECT * FROM tenants WHERE propertyId = ? ORDER BY isCurrent DESC, leaseEnd DESC, id DESC')
    .all(req.params.id)
  res.json(tenants.map(formatTenant))
})

router.get('/:id', (req, res) => {
  const row = db
    .prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM tenants t WHERE t.propertyId = p.id AND t.isCurrent = 1) AS currentTenantCount
      FROM properties p
      WHERE p.id = ?
    `)
    .get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Property not found' })
  const { currentTenantCount, ...property } = row
  res.json({ ...property, currentTenantCount, hasCurrentTenant: currentTenantCount > 0 })
})

router.post('/', (req, res) => {
  const {
    title,
    address,
    imageUrl,
    type,
    price,
    purchasePrice,
    purchaseDate,
    currentValue,
    zillowEstimate,
    yield: roiYield,
    status,
    rent,
    beds,
    baths,
    ownerName,
    ownerTaxId,
  } = req.body

  const stmt = db.prepare(`INSERT INTO properties (title, address, imageUrl, type, price, purchasePrice, purchaseDate, currentValue, zillowEstimate, yield, status, rent, beds, baths, ownerName, ownerTaxId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const info = stmt.run(
    title,
    address,
    imageUrl,
    type,
    price || 0,
    purchasePrice || 0,
    purchaseDate || '',
    currentValue || 0,
    zillowEstimate || 0,
    roiYield || 0,
    status || 'Available',
    rent || 0,
    beds || 0,
    baths || 0,
    ownerName || '',
    ownerTaxId || ''
  )
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(property)
})

router.put('/:id', (req, res) => {
  const id = req.params.id
  const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Property not found' })

  const {
    title,
    address,
    imageUrl,
    type,
    price,
    purchasePrice,
    purchaseDate,
    currentValue,
    zillowEstimate,
    yield: roiYield,
    status,
    rent,
    beds,
    baths,
    ownerName,
    ownerTaxId,
  } = req.body

  db.prepare(`UPDATE properties SET title = ?, address = ?, imageUrl = ?, type = ?, price = ?, purchasePrice = ?, purchaseDate = ?, currentValue = ?, zillowEstimate = ?, yield = ?, status = ?, rent = ?, beds = ?, baths = ?, ownerName = ?, ownerTaxId = ? WHERE id = ?`).run(
    title,
    address,
    imageUrl,
    type,
    price || 0,
    purchasePrice || 0,
    purchaseDate || '',
    currentValue || 0,
    zillowEstimate || 0,
    roiYield || 0,
    status || 'Available',
    rent || 0,
    beds || 0,
    baths || 0,
    ownerName || '',
    ownerTaxId || '',
    id
  )

  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(id)
  res.json(property)
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router
