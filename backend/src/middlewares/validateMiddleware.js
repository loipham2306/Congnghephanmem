import { errorResponse } from '../utils/responseHelper.js'
import HTTP_STATUS from '../constants/httpStatus.js'

export function validate(schema) {
  return (req, res, next) => {
    if (!schema) return next()

    const errors = schema(req.body)
    if (errors && errors.length > 0) {
      return errorResponse(res, 'Dữ liệu yêu cầu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors)
    }

    next()
  }
}

export default validate
