import { Router } from 'express'
import prescriptionController from '../controllers/prescriptionController.js'

const router = Router()

router.get('/', prescriptionController.getAll)
router.get('/:id', prescriptionController.getById)
router.post('/', prescriptionController.create)

export default router
