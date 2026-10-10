export class Prescription {
  constructor({ id, code, patientName, doctorName, date, medicines = [], notes = '', createdAt = new Date() }) {
    this.id = id
    this.code = code || `DT${Math.floor(100 + Math.random() * 900)}`
    this.patientName = patientName
    this.doctorName = doctorName
    this.date = date
    this.medicines = medicines
    this.notes = notes
    this.createdAt = createdAt
  }
}

export default Prescription
