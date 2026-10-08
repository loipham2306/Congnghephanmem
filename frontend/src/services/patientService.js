import api from './api'

const initialPatients = [
  { id: 1, code: 'BN001', fullName: 'Nguyễn Văn An', phone: '0901234567', email: 'benhnhan@gmail.com', gender: 'Nam', birthYear: 1988, address: 'Số 123 Nguyễn Huệ, Quận 1, TP.HCM', bloodGroup: 'O+', allergies: 'Không', notes: 'Khám sức khỏe tổng quát định kỳ' },
  { id: 2, code: 'BN002', fullName: 'Trần Thị Mai', phone: '0912345678', email: 'mai.tran@gmail.com', gender: 'Nữ', birthYear: 1993, address: 'Quận 3, TP.HCM', bloodGroup: 'A+', allergies: 'Penicillin', notes: 'Tiền sử dạ dày' },
  { id: 3, code: 'BN003', fullName: 'Lê Hoàng Long', phone: '0987654321', email: 'long.le@gmail.com', gender: 'Nam', birthYear: 1975, address: 'Bình Thạnh, TP.HCM', bloodGroup: 'B+', allergies: 'Không', notes: 'Tăng huyết áp nhẹ' },
  { id: 4, code: 'BN004', fullName: 'Phạm Hương Giang', phone: '0933221100', email: 'giang.pham@gmail.com', gender: 'Nữ', birthYear: 2000, address: 'Thủ Đức, TP.HCM', bloodGroup: 'AB+', allergies: 'Hải sản', notes: 'Khám răng hàm mặt' }
]

export const patientService = {
  async getAll() {
    try {
      const res = await api.get('/patients')
      return res.data || res
    } catch {
      return initialPatients
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/patients/${id}`)
      return res.data || res
    } catch {
      return initialPatients.find(p => p.id === Number(id)) || null
    }
  },

  async getByEmail(email) {
    try {
      const all = await this.getAll()
      return all.find(p => p.email?.toLowerCase() === email?.toLowerCase()) || null
    } catch {
      return initialPatients.find(p => p.email?.toLowerCase() === email?.toLowerCase()) || null
    }
  },

  async create(data) {
    try {
      const res = await api.post('/patients', data)
      return res.data || res
    } catch {
      const newPatient = { id: Date.now(), code: `BN${Math.floor(100 + Math.random() * 900)}`, ...data }
      return newPatient
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/patients/${id}`, data)
      return res.data || res
    } catch {
      return { id: Number(id), ...data }
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/patients/${id}`)
    } catch {
      return { success: true }
    }
  }
}

export default patientService
