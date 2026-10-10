import { Router } from 'express'
import invoiceController from '../controllers/invoiceController.js'

const router = Router()

router.get('/', invoiceController.getAll)
router.get('/:id', invoiceController.getById)
router.post('/', invoiceController.create)
router.put('/:id/status', invoiceController.updateStatus)

export default router
