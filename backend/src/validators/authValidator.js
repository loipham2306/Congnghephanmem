export function validateLogin(data) {
  const errors = []
  if (!data.email || !data.email.includes('@')) {
    errors.push({ field: 'email', message: 'Email không hợp lệ' })
  }
  if (!data.password || data.password.length < 6) {
    errors.push({ field: 'password', message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  }
  return errors
}

export function validateRegister(data) {
  const errors = validateLogin(data)
  if (!data.fullName || data.fullName.trim() === '') {
    errors.push({ field: 'fullName', message: 'Họ và tên không được để trống' })
  }
  return errors
}

export default { validateLogin, validateRegister }
