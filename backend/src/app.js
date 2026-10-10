import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import corsOptions from './config/cors.js'
import apiRoutes from './routes/index.js'
import errorHandler from './middlewares/errorHandler.js'
import HTTP_STATUS from './constants/httpStatus.js'

dotenv.config()

const app = express()

// Global Middlewares
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'Clinic Management API',
    version: '1.0.0',
    description: 'Hệ thống Quản lý Phòng khám',
    docs: '/api/health'
  })
})

// Mount API routes
app.use('/api', apiRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`
  })
})

// Global Error Handler
app.use(errorHandler)

export default app
