import medicalRecordService from '../services/medicalRecordService.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'

export const medicalRecordController = {
  async getAll(req, res) {
    try {
      const data = await medicalRecordService.getAll()
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async getById(req, res) {
    try {
      const data = await medicalRecordService.getById(req.params.id)
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async create(req, res) {
    try {
      const data = await medicalRecordService.create(req.body)
      return successResponse(res, data, 'Tạo hồ sơ bệnh án thành công')
    } catch (err) {
      return errorResponse(res, err.message)
    }
  }
}

export default medicalRecordController
