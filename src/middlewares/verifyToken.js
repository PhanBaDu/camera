import jwt from 'jsonwebtoken'
import { UNAUTHORIZED } from '../constants/http.js'
import { JWT_SECRET } from '../constants/env.js'
import Session from '../models/session.model.js'
import { errorHandler } from '../ultis/error.js'
import User from '../models/user.model.js'

export const verifyToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken
    if (!accessToken) return next(errorHandler(UNAUTHORIZED, 'Unauthorized'))

    const decoded = jwt.verify(accessToken, JWT_SECRET)
    if (!decoded) return next(errorHandler(UNAUTHORIZED, 'Unauthorized'))

    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) return next(errorHandler(UNAUTHORIZED, 'Session expired'))

    const session = await Session.findById(decoded.sessionId)
    if (!session) return next(errorHandler(UNAUTHORIZED, 'Unauthorized'))

    const user = await User.findById(session.userId)
    if (!user) return next(errorHandler(UNAUTHORIZED, 'Unauthorized'))

    req.sessionId = session._id
    req.userId = session.userId
    req.role = user.role
    next()
  } catch (error) {
    next(error)
  }
}
