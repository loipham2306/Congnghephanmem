import Appointment from '../models/Appointment.js'

let appointments = [
  new Appointment({ id: 1, code: 'LH001', patientName: 'Nguyễn Văn An', phone: '0901234567', doctorName: 'BS. CKII. Trần Văn Hùng', department: 'Khoa Tim Mạch', appointmentDate: '2026-10-06', timeSlot: '09:00', status: 'CONFIRMED', notes: 'Khám điện tâm đồ' }),
  new Appointment({ id: 2, code: 'LH002', patientName: 'Trần Thị Mai', phone: '0912345678', doctorName: 'ThS. BS. Nguyễn Thị Lan', department: 'Khoa Nhi', appointmentDate: '2026-10-06', timeSlot: '10:30', status: 'PENDING', notes: 'Bé ho sốt' }),
  new Appointment({ id: 3, code: 'LH003', patientName: 'Lê Hoàng Long', phone: '0987654321', doctorName: 'TS. BS. Lê Hoàng Nam', department: 'Khoa Thần Kinh', appointmentDate: '2026-10-07', timeSlot: '14:00', status: 'CONFIRMED', notes: 'Đau đầu' }),
  new Appointment({ id: 4, code: 'LH004', patientName: 'Phạm Hương Giang', phone: '0933221100', doctorName: 'ThS. BS. Vũ Đức Anh', department: 'Khoa Răng Hàm Mặt', appointmentDate: '2026-10-08', timeSlot: '15:30', status: 'COMPLETED', notes: 'Tẩy trắng răng' })
]

export const appointmentRepository = {
  async findAll() {
    return appointments
  },

  async findById(id) {
    return appointments.find(a => a.id === Number(id)) || null
  },

  async create(data) {
    const appt = new Appointment({ id: Date.now(), ...data })
    appointments.unshift(appt)
    return appt
  },

  async update(id, data) {
    const idx = appointments.findIndex(a => a.id === Number(id))
    if (idx === -1) return null
    appointments[idx] = { ...appointments[idx], ...data }
    return appointments[idx]
  },

  async delete(id) {
    appointments = appointments.filter(a => a.id !== Number(id))
    return true
  }
}

export default appointmentRepository
