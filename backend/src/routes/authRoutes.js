import { Router } from 'express'
import authController from '../controllers/authController.js'
import { validate } from '../middlewares/validateMiddleware.js'
import { validateLogin, validateRegister } from '../validators/authValidator.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/login', validate(validateLogin), authController.login)
router.post('/register', validate(validateRegister), authController.register)
router.get('/me', authenticate, authController.me)

export default router
