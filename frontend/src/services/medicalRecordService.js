import api from './api'

const initialRecords = [
  { id: 1, code: 'BA001', patientName: 'Nguyễn Văn An', doctorName: 'BS. CKII. Trần Văn Hùng', date: '2026-10-01', diagnosis: 'Tăng huyết áp vô căn độ 1', symptoms: 'Đau đầu, chóng mặt khi làm việc căng thẳng', treatment: 'Dùng thuốc hạ áp, giảm muối, tập thể dục nhẹ' },
  { id: 2, code: 'BA002', patientName: 'Trần Thị Mai', doctorName: 'ThS. BS. Nguyễn Thị Lan', date: '2026-10-03', diagnosis: 'Viêm mũi họng cấp', symptoms: 'Sốt nhẹ 38 độ, ho đờm, rát cổ', treatment: 'Kháng sinh nhẹ, hạ sốt, bù nước điện giải' },
  { id: 3, code: 'BA003', patientName: 'Lê Hoàng Long', doctorName: 'TS. BS. Lê Hoàng Nam', date: '2026-10-04', diagnosis: 'Rối loạn tuần hoàn não', symptoms: 'Mất ngủ, hoa mắt khi thay đổi tư thế', treatment: 'Tăng cường tuần hoàn não, nghỉ ngơi hợp lý' }
]

export const medicalRecordService = {
  async getAll() {
    try {
      const res = await api.get('/medical-records')
      return res.data || res
    } catch {
      return initialRecords
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/medical-records/${id}`)
      return res.data || res
    } catch {
      return initialRecords.find(r => r.id === Number(id)) || null
    }
  },

  async create(data) {
    try {
      const res = await api.post('/medical-records', data)
      return res.data || res
    } catch {
      return { id: Date.now(), code: `BA${Math.floor(100 + Math.random() * 900)}`, ...data }
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/medical-records/${id}`, data)
      return res.data || res
    } catch {
      return { id: Number(id), ...data }
    }
  }
}

export default medicalRecordService
