import Invoice from '../models/Invoice.js'

let invoices = [
  new Invoice({ id: 1, code: 'HD001', patientName: 'Nguyễn Văn An', date: '2026-10-01', totalAmount: 450000, status: 'PAID', paymentMethod: 'Tiền mặt', items: [{ name: 'Khám tim mạch', price: 450000, quantity: 1 }] }),
  new Invoice({ id: 2, code: 'HD002', patientName: 'Trần Thị Mai', date: '2026-10-03', totalAmount: 320000, status: 'PAID', paymentMethod: 'Chuyển khoản', items: [{ name: 'Khám nhi', price: 320000, quantity: 1 }] })
]

export const invoiceRepository = {
  async findAll() {
    return invoices
  },

  async findById(id) {
    return invoices.find(i => i.id === Number(id)) || null
  },

  async create(data) {
    const inv = new Invoice({ id: Date.now(), ...data })
    invoices.unshift(inv)
    return inv
  },

  async updateStatus(id, status) {
    const inv = invoices.find(i => i.id === Number(id))
    if (!inv) return null
    inv.status = status
    return inv
  }
}

export default invoiceRepository
