import HTTP_STATUS from '../constants/httpStatus.js'
import { errorResponse } from '../utils/responseHelper.js'

export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err.stack || err.message)

  const status = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
  const message = err.message || 'Lỗi hệ thống nội bộ'

  return errorResponse(res, message, status, process.env.NODE_ENV === 'development' ? err.stack : undefined)
}

export default errorHandler
