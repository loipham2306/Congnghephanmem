import { verifyToken } from '../utils/jwtHelper.js'
import { errorResponse } from '../utils/responseHelper.js'
import HTTP_STATUS from '../constants/httpStatus.js'
import userRepository from '../repositories/userRepository.js'

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Vui lòng đăng nhập để thực hiện hành động này', HTTP_STATUS.UNAUTHORIZED)
  }

  const token = authHeader.split(' ')[1]
  const decoded = verifyToken(token)

  if (!decoded) {
    return errorResponse(res, 'Token không hợp lệ hoặc đã hết hạn', HTTP_STATUS.UNAUTHORIZED)
  }

  const user = await userRepository.findById(decoded.id)
  if (!user) {
    return errorResponse(res, 'Tài khoản người dùng không tồn tại', HTTP_STATUS.UNAUTHORIZED)
  }

  req.user = user.toJSON()
  next()
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Bạn không có quyền thực hiện chức năng này', HTTP_STATUS.FORBIDDEN)
    }
    next()
  }
}

export default { authenticate, authorize }
