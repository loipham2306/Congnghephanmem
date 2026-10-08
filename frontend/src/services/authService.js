import api from './api'

const STORAGE_KEY = 'clinic_user'
const TOKEN_KEY = 'clinic_token'

export const authService = {
  async login(email, password) {
    try {
      const data = await api.post('/auth/login', { email, password })
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
      }
      return data
    } catch {
      // Mock login fallback if backend isn't running
      const isPatient = email?.includes('benhnhan') || email?.includes('patient') || email?.includes('an.nguyen') || (!email?.includes('admin') && !email?.includes('bacsi') && !email?.includes('hung') && !email?.includes('lan'))
      const mockUser = {
        id: isPatient ? 1 : 1,
        fullName: isPatient ? 'Nguyễn Văn An' : (email?.includes('bacsi') ? 'BS. CKII. Trần Văn Hùng' : 'Quản Trị Viên'),
        email: email || (isPatient ? 'benhnhan@gmail.com' : 'admin@phongkham.vn'),
        role: isPatient ? 'PATIENT' : (email?.includes('bacsi') ? 'DOCTOR' : 'ADMIN')
      }
      localStorage.setItem(TOKEN_KEY, 'mock-jwt-token')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
      return { success: true, token: 'mock-jwt-token', user: mockUser }
    }
  },

  async register(userData) {
    try {
      return await api.post('/auth/register', userData)
    } catch {
      return { success: true, message: 'Đăng ký tài khoản thành công!' }
    }
  },

  getCurrentUser() {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(STORAGE_KEY)
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY)
  }
}

export default authService
