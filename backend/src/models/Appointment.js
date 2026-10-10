export class Appointment {
  constructor({ id, code, patientName, phone, doctorName, department, appointmentDate, timeSlot, status = 'PENDING', notes, createdAt = new Date() }) {
    this.id = id
    this.code = code || `LH${Math.floor(100 + Math.random() * 900)}`
    this.patientName = patientName
    this.phone = phone
    this.doctorName = doctorName
    this.department = department
    this.appointmentDate = appointmentDate
    this.timeSlot = timeSlot
    this.status = status
    this.notes = notes || ''
    this.createdAt = createdAt
  }
}

export default Appointment
