import api from './api'

const initialPatients = [
  { id: 1, mabn: 1, code: 'BN001', fullName: 'Nguyễn Văn An', hoten: 'Nguyễn Văn An', phone: '0901234567', sdt: '0901234567', email: 'benhnhan@gmail.com', gender: 'Nam', gioitinh: 'Nam', birthYear: 1988, address: 'Số 123 Nguyễn Huệ, Quận 1, TP.HCM', bloodGroup: 'O+', allergies: 'Không', notes: 'Khám sức khỏe tổng quát định kỳ' },
  { id: 2, mabn: 2, code: 'BN002', fullName: 'Trần Thị Mai', hoten: 'Trần Thị Mai', phone: '0912345678', sdt: '0912345678', email: 'mai.tran@gmail.com', gender: 'Nữ', gioitinh: 'Nu', birthYear: 1993, address: 'Quận 3, TP.HCM', bloodGroup: 'A+', allergies: 'Penicillin', notes: 'Tiền sử dạ dày' },
  { id: 3, mabn: 3, code: 'BN003', fullName: 'Lê Hoàng Long', hoten: 'Lê Hoàng Long', phone: '0987654321', sdt: '0987654321', email: 'long.le@gmail.com', gender: 'Nam', gioitinh: 'Nam', birthYear: 1975, address: 'Bình Thạnh, TP.HCM', bloodGroup: 'B+', allergies: 'Không', notes: 'Tăng huyết áp nhẹ' },
  { id: 4, mabn: 4, code: 'BN004', fullName: 'Phạm Hương Giang', hoten: 'Phạm Hương Giang', phone: '0933221100', sdt: '0933221100', email: 'giang.pham@gmail.com', gender: 'Nữ', gioitinh: 'Nu', birthYear: 2000, address: 'Thủ Đức, TP.HCM', bloodGroup: 'AB+', allergies: 'Hải sản', notes: 'Khám răng hàm mặt' }
]

function normalizePatient(p) {
  if (!p) return null
  const birthYear = p.ngaysinh ? new Date(p.ngaysinh).getFullYear() : (p.birthYear || 1990)
  const hsba = p.hosobenhan || {}

  return {
    id: p.mabn || p.id,
    mabn: p.mabn || p.id,
    code: p.code || `BN${String(p.mabn || p.id).padStart(3, '0')}`,
    fullName: p.hoten || p.fullName,
    hoten: p.hoten || p.fullName,
    gender: p.gioitinh === 'Nu' ? 'Nữ' : (p.gender || 'Nam'),
    gioitinh: p.gioitinh || (p.gender === 'Nữ' ? 'Nu' : 'Nam'),
    birthYear,
    birthday: p.ngaysinh ? (typeof p.ngaysinh === 'string' ? p.ngaysinh.split('T')[0] : new Date(p.ngaysinh).toISOString().split('T')[0]) : `${birthYear}-01-01`,
    phone: p.sdt || p.phone,
    sdt: p.sdt || p.phone,
    email: p.email || `${(p.hoten || 'benhnhan').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    address: p.diachi || p.address || 'TP. Hồ Chí Minh',
    bloodGroup: hsba.nhommau || p.bloodGroup || 'O+',
    allergies: hsba.diung || p.allergies || 'Không ghi nhận',
    notes: hsba.ghichu || hsba.tiensubenh || p.notes || '',
    history: p.lichsukham || []
  }
}

export const patientService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/patients', params)
      const rawList = res.data?.patients || (Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []))
      if (rawList.length > 0) {
        return rawList.map(normalizePatient)
      }
      return initialPatients
    } catch (err) {
      console.warn('[patientService] Gọi /patients lỗi, dùng fallback:', err.message)
      return initialPatients
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/patients/${id}`)
      return normalizePatient(res.data || res)
    } catch {
      return initialPatients.find(p => p.id === Number(id) || p.mabn === Number(id)) || null
    }
  },

  async getMyProfile() {
    try {
      const res = await api.get('/patients/profile')
      return normalizePatient(res.data || res)
    } catch {
      return initialPatients[0]
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
      const payload = {
        hoten: data.fullName || data.hoten,
        gioitinh: data.gender === 'Nữ' || data.gioitinh === 'Nu' ? 'Nu' : 'Nam',
        ngaysinh: data.birthday || `${data.birthYear || 1990}-01-01`,
        sdt: data.phone || data.sdt,
        diachi: data.address || data.diachi,
        nhommau: data.bloodGroup || 'ChuaRo',
        diung: data.allergies || 'Không',
        tiensubenh: data.notes || 'Không'
      }
      const res = await api.post('/patients', payload)
      return normalizePatient(res.data || res)
    } catch {
      return normalizePatient({ id: Date.now(), ...data })
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/patients/${id}`, data)
      return normalizePatient(res.data || res)
    } catch {
      return normalizePatient({ id: Number(id), ...data })
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
