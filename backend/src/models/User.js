export class User {
  constructor({ id, fullName, email, password, role = 'PATIENT', status = 'ACTIVE', createdAt = new Date() }) {
    this.id = id
    this.fullName = fullName
    this.email = email
    this.password = password
    this.role = role
    this.status = status
    this.createdAt = createdAt
  }

  toJSON() {
    const { password, ...safeUser } = this
    return safeUser
  }
}

export default User
