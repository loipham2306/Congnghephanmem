import authService from '../services/authService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import HTTP_STATUS from '../constants/httpStatus.js'

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      return successResponse(res, result, 'Đăng nhập thành công')
    } catch (err) {
      return errorResponse(res, err.message, HTTP_STATUS.UNAUTHORIZED)
    }
  },

  async register(req, res, next) {
    try {
      const user = await authService.register(req.body)
      return successResponse(res, user, 'Đăng ký thành công', HTTP_STATUS.CREATED)
    } catch (err) {
      return errorResponse(res, err.message, HTTP_STATUS.BAD_REQUEST)
    }
  },

  async me(req, res) {
    return successResponse(res, req.user, 'Lấy thông tin người dùng thành công')
  }
}

export default authController
