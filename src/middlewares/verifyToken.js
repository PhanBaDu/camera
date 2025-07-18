import jwt from 'jsonwebtoken'
import { UNAUTHORIZED } from '../constants/http.js'
import { JWT_SECRET } from '../constants/env.js'
import Session from '../models/session.model.js'
import { errorHandler } from '../ultis/error.js'
import User from '../models/user.model.js'

export const verifyToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken
    if (!accessToken) return next(errorHandler(UNAUTHORIZED, 'Missing access token'))

    const decoded = jwt.verify(accessToken, JWT_SECRET)

    const session = await Session.findById(decoded.sessionId)
    if (!session) return next(errorHandler(UNAUTHORIZED, 'Invalid session'))

    const user = await User.findById(session.userId)
    if (!user) return next(errorHandler(UNAUTHORIZED, 'Invalid user'))

    req.sessionId = session._id
    req.userId = session.userId
    req.role = user.role
    next()
  } catch (error) {
    return next(errorHandler(UNAUTHORIZED, error.message === 'jwt expired' ? 'Token expired' : 'Invalid token'))
  }
}
