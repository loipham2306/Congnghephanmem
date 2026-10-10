import Prescription from '../models/Prescription.js'

let prescriptions = [
  new Prescription({ id: 1, code: 'DT001', patientName: 'Nguyễn Văn An', doctorName: 'BS. CKII. Trần Văn Hùng', date: '2026-10-01', medicines: [
    { name: 'Amlodipine 5mg', quantity: 30, unit: 'viên', usage: 'Uống 1 viên vào buổi sáng' }
  ], notes: 'Tái khám sau 1 tháng' })
]

export const prescriptionRepository = {
  async findAll() {
    return prescriptions
  },

  async findById(id) {
    return prescriptions.find(p => p.id === Number(id)) || null
  },

  async create(data) {
    const p = new Prescription({ id: Date.now(), ...data })
    prescriptions.unshift(p)
    return p
  }
}

export default prescriptionRepository
