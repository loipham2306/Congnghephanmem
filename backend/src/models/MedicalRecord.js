export class MedicalRecord {
  constructor({ id, code, patientName, doctorName, date, diagnosis, symptoms, treatment, createdAt = new Date() }) {
    this.id = id
    this.code = code || `BA${Math.floor(100 + Math.random() * 900)}`
    this.patientName = patientName
    this.doctorName = doctorName
    this.date = date
    this.diagnosis = diagnosis
    this.symptoms = symptoms
    this.treatment = treatment
    this.createdAt = createdAt
  }
}

export default MedicalRecord
