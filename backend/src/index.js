// Load environment variables FIRST before any other imports
import './config/env.js'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'express-async-errors'

import vendorRoutes from './routes/vendors.js'
import stockRoutes from './routes/stock.js'
import expenseRoutes from './routes/expenses.js'
import chequeRoutes from './routes/cheques.js'
import salesRoutes from './routes/sales.js'
import uploadRoutes from './routes/upload.js'
import reportRoutes from './routes/reports.js'
import settingsRoutes from './routes/settings.js'
import categoriesRoutes from './routes/categories.js'
import emailRoutes from './routes/email.js'
import employeeRoutes from './routes/employees.js'
import auditLogRoutes from './routes/audit-log.js'

import { errorHandler } from './middleware/errorHandler.js'
import { initializeCronJobs } from './services/cronJobs.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors({
  origin: '*',
  credentials: false
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/vendors', vendorRoutes)
app.use('/api/stock', stockRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/cheques', chequeRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/audit-log', auditLogRoutes)

// Error handling middleware
app.use(errorHandler)

// Initialize cron jobs
initializeCronJobs()

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📧 Cron jobs initialized`)
})

export default app
