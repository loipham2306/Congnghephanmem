import prescriptionService from '../services/prescriptionService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'

export const prescriptionController = {
  async getAll(req, res) {
    try {
      const data = await prescriptionService.getAll()
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async getById(req, res) {
    try {
      const data = await prescriptionService.getById(req.params.id)
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async create(req, res) {
    try {
      const data = await prescriptionService.create(req.body)
      return successResponse(res, data, 'Kê đơn thuốc thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  }
}

export default prescriptionController
