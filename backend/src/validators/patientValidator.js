export function validatePatient(data) {
  const errors = []
  if (!data.fullName || data.fullName.trim() === '') {
    errors.push({ field: 'fullName', message: 'Họ tên bệnh nhân là bắt buộc' })
  }
  if (!data.phone || data.phone.trim() === '') {
    errors.push({ field: 'phone', message: 'Số điện thoại bệnh nhân là bắt buộc' })
  }
  return errors
}

export default { validatePatient }
