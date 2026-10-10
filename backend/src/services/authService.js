import userRepository from '../repositories/userRepository.js'
import { comparePassword } from '../utils/hashHelper.js'
import { generateToken } from '../utils/jwtHelper.js'

export const authService = {
  async login(email, password) {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác')
    }

    const isValid = comparePassword(password, user.password)
    if (!isValid) {
      throw new Error('Email hoặc mật khẩu không chính xác')
    }

    const safeUser = user.toJSON()
    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    return { token, user: safeUser }
  },

  async register(userData) {
    const existing = await userRepository.findByEmail(userData.email)
    if (existing) {
      throw new Error('Email đã được sử dụng')
    }

    return await userRepository.create(userData)
  }
}

export default authService
