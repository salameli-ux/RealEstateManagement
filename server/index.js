import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import propertiesRouter from './routes/properties.js'
import tenantsRouter from './routes/tenants.js'
import paymentsRouter from './routes/payments.js'
import pmAccountRouter from './routes/pmAccount.js'
import rentTransferRouter from './routes/rentTransfer.js'
import tenantPaymentsRouter from './routes/tenantPayments.js'
import reportsRouter from './routes/reports.js'
import insightsRouter from './routes/insights.js'
import settingsRouter from './routes/settings.js'
import jwt from 'jsonwebtoken'

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' })

  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.originalUrl.startsWith('/api')) {
    console.log('API REQUEST:', req.method, req.path, req.originalUrl, 'origin=', req.headers.origin)
  }
  next()
})
app.use('/api/auth', authRouter)
app.use('/api/properties', authenticateToken, propertiesRouter)
app.use('/api/tenants', authenticateToken, tenantsRouter)
app.use('/api/payments', authenticateToken, paymentsRouter)
app.use('/api/pm-account', authenticateToken, pmAccountRouter)
app.use('/api/rent-transfer', authenticateToken, rentTransferRouter)
app.use('/api/tenant-payments', authenticateToken, tenantPaymentsRouter)
app.use('/api/reports', authenticateToken, reportsRouter)
app.use('/api/insights', authenticateToken, insightsRouter)
app.use('/api/settings', authenticateToken, settingsRouter)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const port = 4000
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
