import express from 'express'
import db from '../db.js'
import { formatTenant } from '../tenantFormat.js'
import { formatProperty } from '../propertyFormat.js'

const router = express.Router()

const parseStoredJson = (value, fallback = []) => {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

router.get('/', (req, res) => {
  const properties = db
    .prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM tenants t WHERE t.propertyId = p.id AND t.isCurrent = 1) AS currentTenantCount
      FROM properties p
      ORDER BY p.address COLLATE NOCASE, p.id
    `)
    .all()
    .map(formatProperty)
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
  res.json(formatProperty(row))
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
    ownerDocuments,
    ownerMailbox,
  } = req.body

  const stmt = db.prepare(`INSERT INTO properties (title, address, imageUrl, type, price, purchasePrice, purchaseDate, currentValue, zillowEstimate, yield, status, rent, beds, baths, ownerName, ownerTaxId, ownerDocuments, ownerMailbox) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
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
    ownerTaxId || '',
    JSON.stringify(ownerDocuments || []),
    JSON.stringify(ownerMailbox || [])
  )
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(formatProperty({ ...property, currentTenantCount: 0 }))
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
    ownerDocuments,
    ownerMailbox,
  } = req.body

  db.prepare(`UPDATE properties SET title = ?, address = ?, imageUrl = ?, type = ?, price = ?, purchasePrice = ?, purchaseDate = ?, currentValue = ?, zillowEstimate = ?, yield = ?, status = ?, rent = ?, beds = ?, baths = ?, ownerName = ?, ownerTaxId = ?, ownerDocuments = ?, ownerMailbox = ? WHERE id = ?`).run(
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
    JSON.stringify(ownerDocuments ?? parseStoredJson(existing.ownerDocuments)),
    JSON.stringify(ownerMailbox ?? parseStoredJson(existing.ownerMailbox)),
    id
  )

  const row = db
    .prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM tenants t WHERE t.propertyId = p.id AND t.isCurrent = 1) AS currentTenantCount
      FROM properties p
      WHERE p.id = ?
    `)
    .get(id)
  res.json(formatProperty(row))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router
