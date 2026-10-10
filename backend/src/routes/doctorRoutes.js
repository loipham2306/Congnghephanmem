import { Router } from 'express'
import doctorController from '../controllers/doctorController.js'

const router = Router()

router.get('/', doctorController.getAll)
router.get('/:id', doctorController.getById)
router.post('/', doctorController.create)
router.put('/:id', doctorController.update)
router.delete('/:id', doctorController.delete)

export default router
