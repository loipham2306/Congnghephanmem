import HTTP_STATUS from '../constants/httpStatus.js'

export function successResponse(res, data, message = 'Thành công', status = HTTP_STATUS.OK) {
  return res.status(status).json({
    success: true,
    message,
    data
  })
}

export function errorResponse(res, message = 'Có lỗi xảy ra', status = HTTP_STATUS.BAD_REQUEST, errors = null) {
  return res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {})
  })
}

export default { successResponse, errorResponse }
