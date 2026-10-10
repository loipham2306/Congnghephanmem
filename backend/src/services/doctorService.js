import doctorRepository from '../repositories/doctorRepository.js'

export const doctorService = {
  async getAll() {
    return await doctorRepository.findAll()
  },

  async getById(id) {
    const doc = await doctorRepository.findById(id)
    if (!doc) throw new Error('Không tìm thấy bác sĩ')
    return doc
  },

  async create(data) {
    return await doctorRepository.create(data)
  },

  async update(id, data) {
    return await doctorRepository.update(id, data)
  },

  async delete(id) {
    return await doctorRepository.delete(id)
  }
}

export default doctorService
