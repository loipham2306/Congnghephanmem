import patientRepository from '../repositories/patientRepository.js'

export const patientService = {
  async getAll() {
    return await patientRepository.findAll()
  },

  async getById(id) {
    const patient = await patientRepository.findById(id)
    if (!patient) throw new Error('Không tìm thấy bệnh nhân')
    return patient
  },

  async create(data) {
    if (!data.fullName || !data.phone) {
      throw new Error('Vui lòng cung cấp họ tên và số điện thoại')
    }
    return await patientRepository.create(data)
  },

  async update(id, data) {
    const updated = await patientRepository.update(id, data)
    if (!updated) throw new Error('Không tìm thấy bệnh nhân để cập nhật')
    return updated
  },

  async delete(id) {
    const deleted = await patientRepository.delete(id)
    if (!deleted) throw new Error('Không tìm thấy bệnh nhân để xóa')
    return true
  }
}

export default patientService
