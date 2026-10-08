import api from './api'

const initialInvoices = [
  { id: 1, code: 'HD001', patientName: 'Nguyễn Văn An', date: '2026-10-01', totalAmount: 450000, status: 'PAID', paymentMethod: 'Tiền mặt', items: [
    { name: 'Khám tim mạch chuyên sâu', price: 200000, quantity: 1 },
    { name: 'Đo điện tâm đồ ECG', price: 150000, quantity: 1 },
    { name: 'Tiền thuốc theo đơn DT001', price: 100000, quantity: 1 }
  ]},
  { id: 2, code: 'HD002', patientName: 'Trần Thị Mai', date: '2026-10-03', totalAmount: 320000, status: 'PAID', paymentMethod: 'Chuyển khoản', items: [
    { name: 'Khám nhi khoa', price: 150000, quantity: 1 },
    { name: 'Thuốc kháng sinh + siro', price: 170000, quantity: 1 }
  ]},
  { id: 3, code: 'HD003', patientName: 'Lê Hoàng Long', date: '2026-10-04', totalAmount: 600000, status: 'UNPAID', paymentMethod: 'Chưa thanh toán', items: [
    { name: 'Khám thần kinh chuyên sâu', price: 250000, quantity: 1 },
    { name: 'Siêu âm Doppler mạch máu', price: 350000, quantity: 1 }
  ]}
]

export const invoiceService = {
  async getAll() {
    try {
      const res = await api.get('/invoices')
      return res.data || res
    } catch {
      return initialInvoices
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/invoices/${id}`)
      return res.data || res
    } catch {
      return initialInvoices.find(inv => inv.id === Number(id)) || null
    }
  },

  async create(data) {
    try {
      const res = await api.post('/invoices', data)
      return res.data || res
    } catch {
      return { id: Date.now(), code: `HD${Math.floor(100 + Math.random() * 900)}`, ...data }
    }
  },

  async updateStatus(id, status) {
    try {
      const res = await api.put(`/invoices/${id}/status`, { status })
      return res.data || res
    } catch {
      return { id, status }
    }
  }
}

export default invoiceService
