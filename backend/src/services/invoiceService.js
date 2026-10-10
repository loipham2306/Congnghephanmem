import invoiceRepository from '../repositories/invoiceRepository.js'

export const invoiceService = {
  async getAll() {
    return await invoiceRepository.findAll()
  },

  async getById(id) {
    const inv = await invoiceRepository.findById(id)
    if (!inv) throw new Error('Không tìm thấy hóa đơn')
    return inv
  },

  async create(data) {
    return await invoiceRepository.create(data)
  },

  async updateStatus(id, status) {
    const updated = await invoiceRepository.updateStatus(id, status)
    if (!updated) throw new Error('Không tìm thấy hóa đơn')
    return updated
  }
}

export default invoiceService
