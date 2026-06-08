import express from 'express'
import db from '../db.js'
import { formatPmAccount } from '../bankFormat.js'

const router = express.Router()

router.get('/', (req, res) => {
  const account = db.prepare('SELECT * FROM pm_account WHERE id = 1').get()
  if (!account) return res.status(404).json({ error: 'PM account not configured' })
  res.json(formatPmAccount(account))
})

export default router
