import test from 'node:test'
import assert from 'node:assert'
import appointmentService from '../src/services/appointmentService.js'

test('Appointment Service - Get all appointments', async () => {
  const list = await appointmentService.getAll()
  assert.ok(Array.isArray(list))
  assert.ok(list.length > 0)
})

test('Appointment Service - Create new appointment', async () => {
  const newAppt = await appointmentService.create({
    patientName: 'Người Bệnh Mới',
    phone: '0988776655',
    doctorName: 'BS. CKII. Trần Văn Hùng',
    department: 'Khoa Tim Mạch',
    appointmentDate: '2026-10-10',
    timeSlot: '08:30'
  })

  assert.strictEqual(newAppt.patientName, 'Người Bệnh Mới')
  assert.strictEqual(newAppt.status, 'PENDING')
})
