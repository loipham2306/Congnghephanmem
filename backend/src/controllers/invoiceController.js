import invoiceService from '../services/invoiceService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'

export const invoiceController = {
  async getAll(req, res) {
    try {
      const data = await invoiceService.getAll()
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async getById(req, res) {
    try {
      const data = await invoiceService.getById(req.params.id)
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async create(req, res) {
    try {
      const data = await invoiceService.create(req.body)
      return successResponse(res, data, 'Lập hóa đơn thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body
      const data = await invoiceService.updateStatus(req.params.id, status)
      return successResponse(res, data, 'Cập nhật trạng thái hóa đơn thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  }
}

export default invoiceController
