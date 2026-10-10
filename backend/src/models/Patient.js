export class Patient {
  constructor({ id, code, fullName, phone, email, gender, birthYear, address, bloodGroup, allergies, notes, createdAt = new Date() }) {
    this.id = id
    this.code = code || `BN${Math.floor(100 + Math.random() * 900)}`
    this.fullName = fullName
    this.phone = phone
    this.email = email
    this.gender = gender || 'Nam'
    this.birthYear = birthYear
    this.address = address
    this.bloodGroup = bloodGroup || 'O+'
    this.allergies = allergies || 'Không'
    this.notes = notes || ''
    this.createdAt = createdAt
  }
}

export default Patient
