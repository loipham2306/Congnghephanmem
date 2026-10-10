import prescriptionRepository from '../repositories/prescriptionRepository.js'

export const prescriptionService = {
  async getAll() {
    return await prescriptionRepository.findAll()
  },

  async getById(id) {
    const p = await prescriptionRepository.findById(id)
    if (!p) throw new Error('Không tìm thấy đơn thuốc')
    return p
  },

  async create(data) {
    return await prescriptionRepository.create(data)
  }
}

export default prescriptionService
