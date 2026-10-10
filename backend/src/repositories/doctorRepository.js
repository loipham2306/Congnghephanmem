import Doctor from '../models/Doctor.js'

let doctors = [
  new Doctor({ id: 1, name: 'BS. CKII. Trần Văn Hùng', title: 'Trưởng khoa Tim Mạch', department: 'Khoa Tim Mạch', experience: '15+ năm', rating: 4.9, reviewsCount: 142, bio: 'Chuyên gia đầu ngành về can thiệp tim mạch.' }),
  new Doctor({ id: 2, name: 'ThS. BS. Nguyễn Thị Lan', title: 'Phó khoa Nhi', department: 'Khoa Nhi', experience: '10+ năm', rating: 5.0, reviewsCount: 198, bio: 'Tận tâm, giàu kinh nghiệm khám chữa bệnh cho trẻ nhỏ.' }),
  new Doctor({ id: 3, name: 'TS. BS. Lê Hoàng Nam', title: 'Bác sĩ chuyên khoa', department: 'Khoa Thần Kinh', experience: '12+ năm', rating: 4.8, reviewsCount: 88, bio: 'Chuyên gia điều trị đau nửa đầu, đột quỵ.' }),
  new Doctor({ id: 4, name: 'BS. CKI. Phạm Minh Tuấn', title: 'Bác sĩ chuyên khoa', department: 'Khoa Mắt', experience: '9+ năm', rating: 4.9, reviewsCount: 110, bio: 'Phẫu thuật viên Phaco giàu kinh nghiệm.' }),
  new Doctor({ id: 5, name: 'ThS. BS. Vũ Đức Anh', title: 'Trưởng khoa Nha', department: 'Khoa Răng Hàm Mặt', experience: '8+ năm', rating: 4.9, reviewsCount: 95, bio: 'Chuyên sâu chỉnh nha thẩm mỹ, cấy ghép Implant.' })
]

export const doctorRepository = {
  async findAll() {
    return doctors
  },

  async findById(id) {
    return doctors.find(d => d.id === Number(id)) || null
  },

  async create(data) {
    const doctor = new Doctor({ id: Date.now(), ...data })
    doctors.push(doctor)
    return doctor
  },

  async update(id, data) {
    const idx = doctors.findIndex(d => d.id === Number(id))
    if (idx === -1) return null
    doctors[idx] = { ...doctors[idx], ...data }
    return doctors[idx]
  },

  async delete(id) {
    doctors = doctors.filter(d => d.id !== Number(id))
    return true
  }
}

export default doctorRepository
