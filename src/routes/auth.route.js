import { Router } from 'express'
import { signup, signin, refreshToken, logout } from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'

const router = Router()

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/refresh', refreshToken)
router.post('/logout', verifyToken, logout)

export default router
