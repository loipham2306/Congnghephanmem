import api from './api'

const initialAppointments = [
  { id: 1, code: 'LH001', patientName: 'Nguyễn Văn An', phone: '0901234567', doctorName: 'BS. CKII. Trần Văn Hùng', department: 'Khoa Tim Mạch', appointmentDate: '2026-10-06', timeSlot: '09:00', status: 'CONFIRMED', notes: 'Khám kiểm tra điện tâm đồ' },
  { id: 2, code: 'LH002', patientName: 'Trần Thị Mai', phone: '0912345678', doctorName: 'ThS. BS. Nguyễn Thị Lan', department: 'Khoa Nhi', appointmentDate: '2026-10-06', timeSlot: '10:30', status: 'PENDING', notes: 'Bé ho sốt 2 ngày' },
  { id: 3, code: 'LH003', patientName: 'Lê Hoàng Long', phone: '0987654321', doctorName: 'TS. BS. Lê Hoàng Nam', department: 'Khoa Thần Kinh', appointmentDate: '2026-10-07', timeSlot: '14:00', status: 'CONFIRMED', notes: 'Đau nửa đầu mạn tính' },
  { id: 4, code: 'LH004', patientName: 'Phạm Hương Giang', phone: '0933221100', doctorName: 'ThS. BS. Vũ Đức Anh', department: 'Khoa Răng Hàm Mặt', appointmentDate: '2026-10-08', timeSlot: '15:30', status: 'COMPLETED', notes: 'Tẩy trắng răng' }
]

export const appointmentService = {
  async getAll() {
    try {
      const res = await api.get('/appointments')
      return res.data || res
    } catch {
      return initialAppointments
    }
  },

  async create(data) {
    try {
      const res = await api.post('/appointments', data)
      return res.data || res
    } catch {
      const newAppt = {
        id: Date.now(),
        code: `LH${Math.floor(100 + Math.random() * 900)}`,
        patientName: data.name || data.patientName,
        phone: data.phone,
        doctorName: data.doctorName || 'BS. CKII. Trần Văn Hùng',
        department: data.department || 'Đa Khoa',
        appointmentDate: data.date ? data.date.split('T')[0] : '2026-10-06',
        timeSlot: data.date ? data.date.split('T')[1] : '09:00',
        status: 'PENDING',
        notes: data.message || data.notes || ''
      }
      return newAppt
    }
  },

  async updateStatus(id, status) {
    try {
      const res = await api.put(`/appointments/${id}/status`, { status })
      return res.data || res
    } catch {
      return { id, status }
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/appointments/${id}`)
    } catch {
      return { success: true }
    }
  }
}

export default appointmentService
