import { Router } from 'express'
import authRoutes from './authRoutes.js'
import patientRoutes from './patientRoutes.js'
import doctorRoutes from './doctorRoutes.js'
import appointmentRoutes from './appointmentRoutes.js'
import medicalRecordRoutes from './medicalRecordRoutes.js'
import prescriptionRoutes from './prescriptionRoutes.js'
import invoiceRoutes from './invoiceRoutes.js'
import userRoutes from './userRoutes.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

router.use('/auth', authRoutes)
router.use('/patients', patientRoutes)
router.use('/doctors', doctorRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/medical-records', medicalRecordRoutes)
router.use('/prescriptions', prescriptionRoutes)
router.use('/invoices', invoiceRoutes)
router.use('/users', userRoutes)

export default router
