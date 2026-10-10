import User from '../models/User.js'
import { hashPassword } from '../utils/hashHelper.js'

let users = [
  new User({ id: 1, fullName: 'Quản Trị Viên', email: 'admin@phongkham.vn', password: hashPassword('123456'), role: 'ADMIN' }),
  new User({ id: 2, fullName: 'BS. Trần Văn Hùng', email: 'hung.tran@phongkham.vn', password: hashPassword('123456'), role: 'DOCTOR' }),
  new User({ id: 3, fullName: 'BS. Nguyễn Thị Lan', email: 'lan.nguyen@phongkham.vn', password: hashPassword('123456'), role: 'DOCTOR' }),
  new User({ id: 4, fullName: 'Lê Thu Trang', email: 'trang.le@phongkham.vn', password: hashPassword('123456'), role: 'STAFF' }),
  new User({ id: 5, fullName: 'Nguyễn Văn An', email: 'benhnhan@gmail.com', password: hashPassword('123456'), role: 'PATIENT' }),
  new User({ id: 6, fullName: 'Nguyễn Văn An', email: 'benhnhan@phongkham.vn', password: hashPassword('123456'), role: 'PATIENT' })
]

export const userRepository = {
  async findAll() {
    return users.map(u => u.toJSON())
  },

  async findById(id) {
    const user = users.find(u => u.id === Number(id))
    return user || null
  },

  async findByEmail(email) {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    return user || null
  },

  async create(userData) {
    const newUser = new User({
      id: Date.now(),
      ...userData,
      password: hashPassword(userData.password)
    })
    users.push(newUser)
    return newUser.toJSON()
  }
}

export default userRepository
