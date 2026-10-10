import Patient from '../models/Patient.js'

let patients = [
  new Patient({ id: 1, code: 'BN001', fullName: 'Nguyễn Văn An', phone: '0901234567', email: 'an.nguyen@gmail.com', gender: 'Nam', birthYear: 1988, address: 'Quận 1, TP.HCM', bloodGroup: 'O+', allergies: 'Không', notes: 'Khám định kỳ' }),
  new Patient({ id: 2, code: 'BN002', fullName: 'Trần Thị Mai', phone: '0912345678', email: 'mai.tran@gmail.com', gender: 'Nữ', birthYear: 1993, address: 'Quận 3, TP.HCM', bloodGroup: 'A+', allergies: 'Penicillin', notes: 'Tiền sử dạ dày' }),
  new Patient({ id: 3, code: 'BN003', fullName: 'Lê Hoàng Long', phone: '0987654321', email: 'long.le@gmail.com', gender: 'Nam', birthYear: 1975, address: 'Bình Thạnh, TP.HCM', bloodGroup: 'B+', allergies: 'Không', notes: 'Tăng huyết áp nhẹ' }),
  new Patient({ id: 4, code: 'BN004', fullName: 'Phạm Hương Giang', phone: '0933221100', email: 'giang.pham@gmail.com', gender: 'Nữ', birthYear: 2000, address: 'Thủ Đức, TP.HCM', bloodGroup: 'AB+', allergies: 'Hải sản', notes: 'Khám răng hàm mặt' })
]

export const patientRepository = {
  async findAll() {
    return patients
  },

  async findById(id) {
    return patients.find(p => p.id === Number(id)) || null
  },

  async create(data) {
    const patient = new Patient({ id: Date.now(), ...data })
    patients.unshift(patient)
    return patient
  },

  async update(id, data) {
    const idx = patients.findIndex(p => p.id === Number(id))
    if (idx === -1) return null
    patients[idx] = { ...patients[idx], ...data }
    return patients[idx]
  },

  async delete(id) {
    const initialLen = patients.length
    patients = patients.filter(p => p.id !== Number(id))
    return patients.length < initialLen
  }
}

export default patientRepository
