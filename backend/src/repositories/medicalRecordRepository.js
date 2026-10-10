import MedicalRecord from '../models/MedicalRecord.js'

let records = [
  new MedicalRecord({ id: 1, code: 'BA001', patientName: 'Nguyễn Văn An', doctorName: 'BS. CKII. Trần Văn Hùng', date: '2026-10-01', diagnosis: 'Tăng huyết áp vô căn độ 1', symptoms: 'Đau đầu, chóng mặt khi làm việc', treatment: 'Dùng thuốc hạ áp' }),
  new MedicalRecord({ id: 2, code: 'BA002', patientName: 'Trần Thị Mai', doctorName: 'ThS. BS. Nguyễn Thị Lan', date: '2026-10-03', diagnosis: 'Viêm mũi họng cấp', symptoms: 'Sốt nhẹ 38 độ, ho đờm', treatment: 'Kháng sinh nhẹ' })
]

export const medicalRecordRepository = {
  async findAll() {
    return records
  },

  async findById(id) {
    return records.find(r => r.id === Number(id)) || null
  },

  async create(data) {
    const record = new MedicalRecord({ id: Date.now(), ...data })
    records.unshift(record)
    return record
  },

  async update(id, data) {
    const idx = records.findIndex(r => r.id === Number(id))
    if (idx === -1) return null
    records[idx] = { ...records[idx], ...data }
    return records[idx]
  }
}

export default medicalRecordRepository
