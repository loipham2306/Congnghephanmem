import medicalRecordRepository from '../repositories/medicalRecordRepository.js'

export const medicalRecordService = {
  async getAll() {
    return await medicalRecordRepository.findAll()
  },

  async getById(id) {
    const record = await medicalRecordRepository.findById(id)
    if (!record) throw new Error('Không tìm thấy hồ sơ bệnh án')
    return record
  },

  async create(data) {
    return await medicalRecordRepository.create(data)
  },

  async update(id, data) {
    return await medicalRecordRepository.update(id, data)
  }
}

export default medicalRecordService
