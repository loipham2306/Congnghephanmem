import api from './api'

const initialDoctors = [
  { id: 1, name: 'BS. CKII. Trần Văn Hùng', title: 'Trưởng khoa Tim Mạch', department: 'Khoa Tim Mạch', experience: '15+ năm', rating: 4.9, reviewsCount: 142, bio: 'Chuyên gia đầu ngành về can thiệp tim mạch, nguyên Phó trưởng khoa Bệnh viện Chợ Rẫy.' },
  { id: 2, name: 'ThS. BS. Nguyễn Thị Lan', title: 'Phó khoa Nhi', department: 'Khoa Nhi', experience: '10+ năm', rating: 5.0, reviewsCount: 198, bio: 'Tận tâm, yêu trẻ, giàu kinh nghiệm khám và điều trị các bệnh lý hô hấp, tiêu hóa ở trẻ em.' },
  { id: 3, name: 'TS. BS. Lê Hoàng Nam', title: 'Bác sĩ chuyên khoa', department: 'Khoa Thần Kinh', experience: '12+ năm', rating: 4.8, reviewsCount: 88, bio: 'Chuyên gia điều trị các bệnh đau nửa đầu, rối loạn tiền đình, thần kinh cơ và đột quỵ.' },
  { id: 4, name: 'BS. CKI. Phạm Minh Tuấn', title: 'Bác sĩ chuyên khoa', department: 'Khoa Mắt', experience: '9+ năm', rating: 4.9, reviewsCount: 110, bio: 'Phẫu thuật viên Phaco giàu kinh nghiệm, điều trị tật khúc xạ và các bệnh lý giác mạc.' },
  { id: 5, name: 'ThS. BS. Vũ Đức Anh', title: 'Trưởng khoa Nha', department: 'Khoa Răng Hàm Mặt', experience: '8+ năm', rating: 4.9, reviewsCount: 95, bio: 'Chuyên sâu chỉnh nha thẩm mỹ, cấy ghép Implant công nghệ cao không đau.' },
  { id: 6, name: 'BS. Hoàng Kim Yến', title: 'Bác sĩ chuyên khoa', department: 'Khoa Nội Tổng Quát', experience: '7+ năm', rating: 4.8, reviewsCount: 76, bio: 'Khám tầm soát sức khỏe định kỳ, điều trị các bệnh mãn tính tiểu đường, mỡ máu.' }
]

export const doctorService = {
  async getAll() {
    try {
      const res = await api.get('/doctors')
      return res.data || res
    } catch {
      return initialDoctors
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/doctors/${id}`)
      return res.data || res
    } catch {
      return initialDoctors.find(d => d.id === Number(id)) || null
    }
  },

  async create(data) {
    try {
      const res = await api.post('/doctors', data)
      return res.data || res
    } catch {
      return { id: Date.now(), ...data }
    }
  },

  async update(id, data) {
    try {
      const res = await api.put(`/doctors/${id}`, data)
      return res.data || res
    } catch {
      return { id: Number(id), ...data }
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/doctors/${id}`)
    } catch {
      return { success: true }
    }
  }
}

export default doctorService
