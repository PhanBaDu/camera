import { OK } from '../constants/http.js'
import User from '../models/user.model.js'

export const findUserId = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    const { password, ...rest } = user._doc
    res.status(OK).json({
      success: true,
      statusCode: OK,
      data: rest
    })
  } catch (error) {
    next(error)
  }
}
