import api from './api'

const initialDoctors = [
  { id: 1, mabs: 1, name: 'BS. CKII. Trần Văn Hùng', hoten: 'BS. CKII. Trần Văn Hùng', title: 'Trưởng khoa Tim Mạch', department: 'Khoa Tim Mạch', chuyenkhoa: 'Khoa Tim Mạch', experience: '15+ năm', rating: 4.9, reviewsCount: 142, bio: 'Chuyên gia đầu ngành về can thiệp tim mạch, nguyên Phó trưởng khoa Bệnh viện Chợ Rẫy.' },
  { id: 2, mabs: 2, name: 'ThS. BS. Nguyễn Thị Lan', hoten: 'ThS. BS. Nguyễn Thị Lan', title: 'Phó khoa Nhi', department: 'Khoa Nhi', chuyenkhoa: 'Khoa Nhi', experience: '10+ năm', rating: 5.0, reviewsCount: 198, bio: 'Tận tâm, yêu trẻ, giàu kinh nghiệm khám và điều trị các bệnh lý hô hấp, tiêu hóa ở trẻ em.' },
  { id: 3, mabs: 3, name: 'TS. BS. Lê Hoàng Nam', hoten: 'TS. BS. Lê Hoàng Nam', title: 'Bác sĩ chuyên khoa', department: 'Khoa Thần Kinh', chuyenkhoa: 'Khoa Thần Kinh', experience: '12+ năm', rating: 4.8, reviewsCount: 88, bio: 'Chuyên gia điều trị các bệnh đau nửa đầu, rối loạn tiền đình, thần kinh cơ và đột quỵ.' },
  { id: 4, mabs: 4, name: 'BS. CKI. Phạm Minh Tuấn', hoten: 'BS. CKI. Phạm Minh Tuấn', title: 'Bác sĩ chuyên khoa', department: 'Khoa Mắt', chuyenkhoa: 'Khoa Mắt', experience: '9+ năm', rating: 4.9, reviewsCount: 110, bio: 'Phẫu thuật viên Phaco giàu kinh nghiệm, điều trị tật khúc xạ và các bệnh lý giác mạc.' },
  { id: 5, mabs: 5, name: 'ThS. BS. Vũ Đức Anh', hoten: 'ThS. BS. Vũ Đức Anh', title: 'Trưởng khoa Nha', department: 'Khoa Răng Hàm Mặt', chuyenkhoa: 'Khoa Răng Hàm Mặt', experience: '8+ năm', rating: 4.9, reviewsCount: 95, bio: 'Chuyên sâu chỉnh nha thẩm mỹ, cấy ghép Implant công nghệ cao không đau.' },
  { id: 6, mabs: 6, name: 'BS. Hoàng Kim Yến', hoten: 'BS. Hoàng Kim Yến', title: 'Bác sĩ chuyên khoa', department: 'Khoa Nội Tổng Quát', chuyenkhoa: 'Khoa Nội Tổng Quát', experience: '7+ năm', rating: 4.8, reviewsCount: 76, bio: 'Khám tầm soát sức khỏe định kỳ, điều trị các bệnh mãn tính tiểu đường, mỡ máu.' }
]

function normalizeDoctor(d) {
  if (!d) return null
  const nv = d.nhanvien || {}
  const ck = d.chuyenkhoa || {}

  const fullName = nv.hoten || d.hoten || d.name || 'Bác Sĩ'
  const deptName = typeof ck === 'string' ? ck : (ck.tenchuyenkhoa || d.chuyenkhoa || d.department || 'Khoa Mắt Kỹ Thuật Cao')
  const phone = nv.sdt || d.sdt || d.phone || '0900000000'
  const title = d.hocham ? `${d.hocham}` : (nv.chucvu || d.chucvu || d.title || 'Bác sĩ chuyên khoa')
  const years = d.kinhnghiem ? `${d.kinhnghiem}+ năm` : (d.experience || '10+ năm')

  return {
    id: d.mabs || d.id,
    mabs: d.mabs || d.id,
    manv: d.manv || nv.manv,
    mack: d.mack || ck.mack,
    name: fullName,
    hoten: fullName,
    department: deptName,
    chuyenkhoa: deptName,
    specialty: deptName,
    dept: deptName,
    title,
    phone,
    sdt: phone,
    experience: years,
    rating: d.rating || 5.0,
    reviewsCount: d.reviewsCount || 120,
    bio: d.bio || `Bác sĩ ${fullName} với ${years} kinh nghiệm chuyên sâu tại ${deptName}.`,
    desc: d.desc || d.bio || `Bác sĩ ${fullName} với ${years} kinh nghiệm chuyên sâu tại ${deptName}.`,
    img: d.img || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=250&fit=crop&crop=face',
    delay: d.delay || 100
  }
}

export const doctorService = {
  async getAll() {
    try {
      const res = await api.get('/doctors')
      const list = Array.isArray(res) ? res : (res.data || [])
      if (list.length > 0) {
        return list.map(normalizeDoctor)
      }
      return initialDoctors
    } catch (err) {
      console.warn('[doctorService] Gọi /doctors lỗi, dùng fallback:', err.message)
      return initialDoctors
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/doctors/${id}`)
      const doc = res.data || res
      return normalizeDoctor(doc)
    } catch {
      return initialDoctors.find(d => d.id === Number(id) || d.mabs === Number(id)) || null
    }
  },

  async create(data) {
    try {
      const payload = {
        hoten: data.name || data.hoten,
        mack: Number(data.mack) || 1,
        sdt: data.phone || data.sdt,
        gioitinh: data.gender || 'Nam',
        ngaysinh: data.birthday || '1985-01-01',
        sogiayphephanhnghe: data.license || `CCHN_${Date.now()}`
      }
      const res = await api.post('/doctors', payload)
      return normalizeDoctor(res.data || res)
    } catch {
      const newDoc = normalizeDoctor({ id: Date.now(), ...data })
      return newDoc
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/doctors/${id}`, data)
      return normalizeDoctor(res.data || res)
    } catch {
      return normalizeDoctor({ id: Number(id), ...data })
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/doctors/${id}`)
    } catch {
      return { success: true }
    }
  },

  async getSpecialties() {
    try {
      const res = await api.get('/specialties')
      return Array.isArray(res) ? res : (res.data || [])
    } catch {
      return [
        { mack: 1, tenchuyenkhoa: 'Khoa Tim Mạch' },
        { mack: 2, tenchuyenkhoa: 'Khoa Nhi' },
        { mack: 3, tenchuyenkhoa: 'Khoa Thần Kinh' },
        { mack: 4, tenchuyenkhoa: 'Khoa Mắt' },
        { mack: 5, tenchuyenkhoa: 'Khoa Răng Hàm Mặt' },
        { mack: 6, tenchuyenkhoa: 'Khoa Nội Tổng Quát' }
      ]
    }
  }
}

export default doctorService
