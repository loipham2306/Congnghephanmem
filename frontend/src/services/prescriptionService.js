import api from './api'

const initialPrescriptions = [
  { id: 1, code: 'DT001', patientName: 'Nguyễn Văn An', doctorName: 'BS. CKII. Trần Văn Hùng', date: '2026-10-01', totalMedicines: 3, medicines: [
    { name: 'Amlodipine 5mg', quantity: 30, unit: 'viên', usage: 'Uống 1 viên vào buổi sáng sau ăn' },
    { name: 'Panadol Extra', quantity: 10, unit: 'viên', usage: 'Uống khi đau đầu' },
    { name: 'Vitamin C 500mg', quantity: 20, unit: 'viên', usage: 'Uống 1 viên sau ăn trưa' }
  ], notes: 'Tái khám sau 1 tháng mang theo sổ' },
  { id: 2, code: 'DT002', patientName: 'Trần Thị Mai', doctorName: 'ThS. BS. Nguyễn Thị Lan', date: '2026-10-03', totalMedicines: 2, medicines: [
    { name: 'Augmentin 625mg', quantity: 14, unit: 'viên', usage: 'Uống 1 viên x 2 lần/ngày sau ăn' },
    { name: 'Siro Prospan', quantity: 1, unit: 'chai', usage: 'Uống 5ml x 3 lần/ngày' }
  ], notes: 'Uống nhiều nước ấm, súc họng nước muối' }
]

export const prescriptionService = {
  async getAll() {
    try {
      const res = await api.get('/prescriptions')
      return res.data || res
    } catch {
      return initialPrescriptions
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/prescriptions/${id}`)
      return res.data || res
    } catch {
      return initialPrescriptions.find(p => p.id === Number(id)) || null
    }
  },

  async create(data) {
    try {
      const res = await api.post('/prescriptions', data)
      return res.data || res
    } catch {
      return { id: Date.now(), code: `DT${Math.floor(100 + Math.random() * 900)}`, ...data }
    }
  }
}

export default prescriptionService
