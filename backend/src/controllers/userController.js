import userRepository from '../repositories/userRepository.js'
import { successResponse, errorResponse } from '../utils/responseHelper.js'

export const userController = {
  async getAll(req, res) {
    try {
      const data = await userRepository.findAll()
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  },

  async getById(req, res) {
    try {
      const data = await userRepository.findById(req.params.id)
      return successResponse(res, data)
    } catch (err) {
      return errorResponse(res, err.message)
    }
  }
}

export default userController
