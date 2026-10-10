import { Router } from 'express'
import patientController from '../controllers/patientController.js'
import { validate } from '../middlewares/validateMiddleware.js'
import { validatePatient } from '../validators/patientValidator.js'

const router = Router()

router.get('/', patientController.getAll)
router.get('/:id', patientController.getById)
router.post('/', validate(validatePatient), patientController.create)
router.put('/:id', patientController.update)
router.delete('/:id', patientController.delete)

export default router
