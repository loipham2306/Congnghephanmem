import { Router } from 'express'
import medicalRecordController from '../controllers/medicalRecordController.js'

const router = Router()

router.get('/', medicalRecordController.getAll)
router.get('/:id', medicalRecordController.getById)
router.post('/', medicalRecordController.create)

export default router
