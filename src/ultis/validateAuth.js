import { errorHandler } from './error.js'
import { BAD_REQUEST } from '../constants/http.js'
import { isValidEmail } from './regexEmail.js'

export const validateAuth = (email, password, next) => {
  // 2. Validate thông tin
  if (!email || !password) return next(errorHandler(BAD_REQUEST, 'Missing required fields'))

  if (password.length < 5) return next(errorHandler(BAD_REQUEST, 'Password must be at least 5 characters long'))

  if (!isValidEmail(email)) return next(errorHandler(BAD_REQUEST, 'Invalid email'))
}
