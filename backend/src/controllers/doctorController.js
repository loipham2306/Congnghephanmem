import doctorService from '../services/doctorService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import HTTP_STATUS from '../constants/httpStatus.js'

export const doctorController = {
  async getAll(req, res) {
    try {
      const data = await doctorService.getAll()
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async getById(req, res) {
    try {
      const data = await doctorService.getById(req.params.id)
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message, HTTP_STATUS.NOT_FOUND)
    }
  },

  async create(req, res) {
    try {
      const data = await doctorService.create(req.body)
      return successResponse(res, data, 'Thêm bác sĩ thành công', HTTP_STATUS.CREATED)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async update(req, res) {
    try {
      const data = await doctorService.update(req.params.id, req.body)
      return successResponse(res, data, 'Cập nhật bác sĩ thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async delete(req, res) {
    try {
      await doctorService.delete(req.params.id)
      return successResponse(res, null, 'Xóa bác sĩ thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  }
}

export default doctorController
