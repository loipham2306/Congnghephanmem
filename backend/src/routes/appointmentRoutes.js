import { Router } from 'express'
import appointmentController from '../controllers/appointmentController.js'
import { validate } from '../middlewares/validateMiddleware.js'
import { validateAppointment } from '../validators/appointmentValidator.js'

const router = Router()

router.get('/', appointmentController.getAll)
router.get('/:id', appointmentController.getById)
router.post('/', validate(validateAppointment), appointmentController.create)
router.put('/:id/status', appointmentController.updateStatus)
router.delete('/:id', appointmentController.delete)

export default router
