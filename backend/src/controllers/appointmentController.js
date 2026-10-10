import appointmentService from '../services/appointmentService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import HTTP_STATUS from '../constants/httpStatus.js'

export const appointmentController = {
  async getAll(req, res) {
    try {
      const data = await appointmentService.getAll()
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async getById(req, res) {
    try {
      const data = await appointmentService.getById(req.params.id)
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message, HTTP_STATUS.NOT_FOUND)
    }
  },

  async create(req, res) {
    try {
      const data = await appointmentService.create(req.body)
      return successResponse(res, data, 'Đặt lịch khám thành công', HTTP_STATUS.CREATED)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body
      const data = await appointmentService.updateStatus(req.params.id, status)
      return successResponse(res, data, 'Cập nhật trạng thái lịch khám thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async delete(req, res) {
    try {
      await appointmentService.delete(req.params.id)
      return successResponse(res, null, 'Hủy lịch khám thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  }
}

export default appointmentController
