import { Router } from 'express'
import userController from '../controllers/userController.js'
import { authenticate, authorize } from '../middlewares/authMiddleware.js'
import ROLES from '../constants/roles.js'

const router = Router()

router.get('/', userController.getAll)
router.get('/:id', userController.getById)

export default router
