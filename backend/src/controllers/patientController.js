import patientService from '../services/patientService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'
import HTTP_STATUS from '../constants/httpStatus.js'

export const patientController = {
  async getAll(req, res) {
    try {
      const data = await patientService.getAll()
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async getById(req, res) {
    try {
      const data = await patientService.getById(req.params.id)
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message, HTTP_STATUS.NOT_FOUND)
    }
  },

  async create(req, res) {
    try {
      const data = await patientService.create(req.body)
      return successResponse(res, data, 'Thêm bệnh nhân thành công', HTTP_STATUS.CREATED)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async update(req, res) {
    try {
      const data = await patientService.update(req.params.id, req.body)
      return successResponse(res, data, 'Cập nhật thông tin thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async delete(req, res) {
    try {
      await patientService.delete(req.params.id)
      return successResponse(res, null, 'Xóa bệnh nhân thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  }
}

export default patientController
