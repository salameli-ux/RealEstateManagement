import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const TOKEN_EXPIRES = '8h'

const createToken = (user) => jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = createToken(user)
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const info = db.prepare('INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)').run(name, email, passwordHash, 'user')
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(info.lastInsertRowid)
  const token = createToken(user)
  res.status(201).json({ token, user })
})

router.get('/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' })
  const token = auth.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    res.json({ user: payload })
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
})

export default router
