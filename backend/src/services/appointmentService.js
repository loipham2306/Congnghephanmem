import appointmentRepository from '../repositories/appointmentRepository.js'

export const appointmentService = {
  async getAll() {
    return await appointmentRepository.findAll()
  },

  async getById(id) {
    const a = await appointmentRepository.findById(id)
    if (!a) throw new Error('Không tìm thấy lịch hẹn')
    return a
  },

  async create(data) {
    if (!data.patientName || !data.phone) {
      throw new Error('Họ tên và số điện thoại là bắt buộc')
    }
    return await appointmentRepository.create(data)
  },

  async updateStatus(id, status) {
    const updated = await appointmentRepository.update(id, { status })
    if (!updated) throw new Error('Không tìm thấy lịch hẹn')
    return updated
  },

  async delete(id) {
    return await appointmentRepository.delete(id)
  }
}

export default appointmentService
