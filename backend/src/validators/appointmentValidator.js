export function validateAppointment(data) {
  const errors = []
  if (!data.patientName && !data.name) {
    errors.push({ field: 'patientName', message: 'Tên bệnh nhân không được để trống' })
  }
  if (!data.phone) {
    errors.push({ field: 'phone', message: 'Số điện thoại không được để trống' })
  }
  return errors
}

export default { validateAppointment }
