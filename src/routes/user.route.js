import { Router } from 'express'
import { findUserId } from '../controllers/user.controller.js'
import { verifyToken } from '../middlewares/verifyToken.js'

const router = Router()

router.get('/', verifyToken, findUserId)

export default router
