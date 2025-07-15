import User from '../models/user.model.js'
import Session from '../models/session.model.js'
import { errorHandler } from '../ultis/error.js'
import { CONFLICT, NOT_FOUND, OK, SALT_ROUNDS, UNAUTHORIZED } from '../constants/http.js'
import bcrypt from 'bcrypt'
import { validateAuth } from '../ultis/validateAuth.js'
import jwt from 'jsonwebtoken'
import { JWT_REFRESH_TOKEN_SECRET, JWT_SECRET, NODE_ENV } from '../constants/env.js'
import { fifteenMinutesFromNow, thirtyDaysFromNow } from '../ultis/date.js'

export const signup = async (req, res, next) => {
  try {
    // 1. Lấy thông tin từ body
    const { email, password } = req.body

    // 2. Validate thông tin
    validateAuth(email, password, next)

    // 3. Kiểm tra xem user đã tồn tại chưa
    const user = await User.findOne({ email })
    if (user) return next(errorHandler(CONFLICT, 'User already exists'))

    // 4. Hash password
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 5. Tạo user mới
    const newUser = new User({
      email: email,
      password: hashedPassword
    })
    await newUser.save()

    res.status(OK).json({
      success: true,
      statusCode: OK,
      message: 'User created successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const signin = async (req, res, next) => {
  try {
    // 1. Lấy thông tin từ body
    const { email, password } = req.body
    const userAgent = req.headers['user-agent']

    // 2. Validate thông tin
    validateAuth(email, password, next)

    // 3. Kiểm tra xem user đã tồn tại chưa
    const user = await User.findOne({ email })
    if (!user) return next(errorHandler(NOT_FOUND, 'Incorrect account or password'))

    // 4. So sánh password
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) return next(errorHandler(UNAUTHORIZED, 'Incorrect account or password'))

    // 5. Tạo session
    // const session = new Session({
    //   userId: user._id,
    //   userAgent: req.headers['user-agent']
    // })
    // await session.save()
    const session = await Session.create({
      userId: user._id,
      userAgent: req.headers['user-agent']
    })

    // 6. Tạo token
    const accessToken = jwt.sign({ userId: user._id, role: user.role, sessionId: session._id }, JWT_SECRET, {
      expiresIn: '20s'
    })
    const refreshToken = jwt.sign({ sessionId: session._id }, JWT_REFRESH_TOKEN_SECRET, { expiresIn: '30d' })

    res
      .status(OK)
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production', // dev = false ==> product = true
        expires: fifteenMinutesFromNow()
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        expires: thirtyDaysFromNow(),
        path: '/api/auth/refresh'
      })
      .json({
        success: true,
        statusCode: OK,
        message: 'User signed in successfully'
      })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return next(errorHandler(UNAUTHORIZED, 'Unauthorized'))

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET)
    if (!decoded) return next(errorHandler(UNAUTHORIZED, 'Unauthorized'))

    const session = await Session.findById(decoded.sessionId)
    if (!session) return next(errorHandler(UNAUTHORIZED, 'Unauthorized'))

    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) return next(errorHandler(UNAUTHORIZED, 'Session expired'))

    // ---
    // 1. Tạo newToken
    const newAccessToken = jwt.sign({ userId: req.userId, role: req.role, sessionId: session._id }, JWT_SECRET, {
      expiresIn: '20s'
    })
    // 2. Tạo newRefreshToken
    const newRefreshToken = jwt.sign({ sessionId: session._id }, JWT_REFRESH_TOKEN_SECRET, { expiresIn: '30d' })

    res
      .status(OK)
      .cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production', // dev = false ==> product = true
        expires: fifteenMinutesFromNow()
      })
      .cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        expires: thirtyDaysFromNow(),
        path: '/api/auth/refresh'
      })
      .json({
        success: true,
        statusCode: OK,
        message: 'New access token successfully'
      })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res, next) => {
  try {
    await Session.findByIdAndDelete(req.sessionId)
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(OK).json({
      success: true,
      statusCode: OK,
      message: 'User logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}
