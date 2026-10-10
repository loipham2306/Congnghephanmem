export class Invoice {
  constructor({ id, code, patientName, date, totalAmount, status = 'UNPAID', paymentMethod = 'Tiền mặt', items = [], createdAt = new Date() }) {
    this.id = id
    this.code = code || `HD${Math.floor(100 + Math.random() * 900)}`
    this.patientName = patientName
    this.date = date
    this.totalAmount = totalAmount
    this.status = status
    this.paymentMethod = paymentMethod
    this.items = items
    this.createdAt = createdAt
  }
}

export default Invoice
