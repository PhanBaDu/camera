import { OK } from '../constants/http.js'
import User from '../models/user.model.js'

export const findUserId = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    res.status(OK).json({
      success: true,
      statusCode: OK,
      data: user
    })
  } catch (error) {
    next(error)
  }
}
