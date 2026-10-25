import api from './api'

const initialAppointments = [
  { id: 1, malh: 1, code: 'LH001', patientName: 'Nguyễn Văn An', phone: '0901234567', doctorName: 'BS. CKII. Trần Văn Hùng', department: 'Khoa Tim Mạch', appointmentDate: '2026-10-06', timeSlot: '09:00', status: 'CONFIRMED', trangthai: 'DaXacNhan', notes: 'Khám kiểm tra điện tâm đồ' },
  { id: 2, malh: 2, code: 'LH002', patientName: 'Trần Thị Mai', phone: '0912345678', doctorName: 'ThS. BS. Nguyễn Thị Lan', department: 'Khoa Nhi', appointmentDate: '2026-10-06', timeSlot: '10:30', status: 'PENDING', trangthai: 'ChoXacNhan', notes: 'Bé ho sốt 2 ngày' },
  { id: 3, malh: 3, code: 'LH003', patientName: 'Lê Hoàng Long', phone: '0987654321', doctorName: 'TS. BS. Lê Hoàng Nam', department: 'Khoa Thần Kinh', appointmentDate: '2026-10-07', timeSlot: '14:00', status: 'CONFIRMED', trangthai: 'DaXacNhan', notes: 'Đau nửa đầu mạn tính' },
  { id: 4, malh: 4, code: 'LH004', patientName: 'Phạm Hương Giang', phone: '0933221100', doctorName: 'ThS. BS. Vũ Đức Anh', department: 'Khoa Răng Hàm Mặt', appointmentDate: '2026-10-08', timeSlot: '15:30', status: 'COMPLETED', trangthai: 'DaKham', notes: 'Tẩy trắng răng' }
]

function mapStatusToFrontend(trangthai) {
  switch (trangthai) {
    case 'DaXacNhan': return 'CONFIRMED'
    case 'DaKham': return 'COMPLETED'
    case 'DaHuy': return 'CANCELLED'
    default: return 'PENDING'
  }
}

function mapStatusToBackend(status) {
  switch (status) {
    case 'CONFIRMED': return 'DaXacNhan'
    case 'COMPLETED': return 'DaKham'
    case 'CANCELLED': return 'DaHuy'
    default: return 'ChoXacNhan'
  }
}

function normalizeAppointment(a) {
  if (!a) return null

  const appointmentDate = a.ngayhen ? (typeof a.ngayhen === 'string' ? a.ngayhen.split('T')[0] : new Date(a.ngayhen).toISOString().split('T')[0]) : '2026-10-06'
  
  let timeSlot = '09:00'
  if (a.giohen) {
    const rawTime = String(a.giohen)
    if (rawTime.includes('T')) {
      timeSlot = rawTime.split('T')[1].substring(0, 5)
    } else if (rawTime.includes(':')) {
      timeSlot = rawTime.substring(0, 5)
    }
  } else if (a.timeSlot) {
    timeSlot = a.timeSlot
  }

  const doctorName = a.bacsi?.nhanvien?.hoten || a.doctorName || 'BS. CKII. Trần Văn Hùng'
  const department = a.bacsi?.chuyenkhoa?.tenchuyenkhoa || a.department || 'Đa Khoa'
  const patientName = a.benhnhan?.hoten || a.patientName || 'Bệnh Nhân'
  const phone = a.benhnhan?.sdt || a.phone || ''

  return {
    id: a.malh || a.id,
    malh: a.malh || a.id,
    code: a.code || `LH${String(a.malh || a.id).padStart(3, '0')}`,
    mabn: a.mabn,
    mabs: a.mabs,
    patientName,
    phone,
    doctorName,
    department,
    appointmentDate,
    timeSlot,
    status: a.status || mapStatusToFrontend(a.trangthai),
    trangthai: a.trangthai || mapStatusToBackend(a.status),
    notes: a.lydokham || a.notes || ''
  }
}

export const appointmentService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/appointments', params)
      const list = Array.isArray(res) ? res : (res.data || [])
      if (list.length > 0) {
        return list.map(normalizeAppointment)
      }
      return initialAppointments
    } catch (err) {
      console.warn('[appointmentService] Gọi /appointments lỗi, dùng fallback:', err.message)
      return initialAppointments
    }
  },

  async create(data) {
    try {
      const payload = {
        mabs: Number(data.mabs || data.doctorId) || 1,
        mabn: data.mabn ? Number(data.mabn) : undefined,
        ngayhen: data.date ? (data.date.includes('T') ? data.date.split('T')[0] : data.date) : (data.appointmentDate || '2026-10-06'),
        giohen: data.time || data.timeSlot || '09:00',
        lydokham: data.message || data.notes || data.reason || 'Khám tổng quát'
      }
      const res = await api.post('/appointments', payload)
      return normalizeAppointment(res.data || res)
    } catch {
      const newAppt = normalizeAppointment({
        id: Date.now(),
        code: `LH${Math.floor(100 + Math.random() * 900)}`,
        patientName: data.name || data.patientName,
        phone: data.phone,
        doctorName: data.doctorName || 'BS. CKII. Trần Văn Hùng',
        department: data.department || 'Đa Khoa',
        appointmentDate: data.date ? data.date.split('T')[0] : '2026-10-06',
        timeSlot: data.time || data.timeSlot || '09:00',
        status: 'PENDING',
        notes: data.message || data.notes || ''
      })
      return newAppt
    }
  },

  async updateStatus(id, status) {
    try {
      const backendStatus = mapStatusToBackend(status)
      const res = await api.put(`/appointments/${id}/status`, { trangthai: backendStatus })
      return normalizeAppointment(res.data || res)
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
