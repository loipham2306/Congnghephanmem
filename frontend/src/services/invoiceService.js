import api from './api'

const initialInvoices = [
  { id: 1, mahd: 1, code: 'HD001', patientName: 'Nguyễn Văn An', date: '2026-10-01', totalAmount: 450000, status: 'PAID', trangthaithanhtoan: 'DaThanhToan', paymentMethod: 'Tiền mặt', phuongthuctt: 'TienMat', items: [
    { name: 'Khám tim mạch chuyên sâu', tendichvu: 'Khám tim mạch chuyên sâu', price: 200000, dongia: 200000, quantity: 1, soluong: 1 },
    { name: 'Đo điện tâm đồ ECG', tendichvu: 'Đo điện tâm đồ ECG', price: 150000, dongia: 150000, quantity: 1, soluong: 1 },
    { name: 'Tiền thuốc theo đơn DT001', tendichvu: 'Tiền thuốc theo đơn DT001', price: 100000, dongia: 100000, quantity: 1, soluong: 1 }
  ]},
  { id: 2, mahd: 2, code: 'HD002', patientName: 'Trần Thị Mai', date: '2026-10-03', totalAmount: 320000, status: 'PAID', trangthaithanhtoan: 'DaThanhToan', paymentMethod: 'Chuyển khoản', phuongthuctt: 'ChuyenKhoan', items: [
    { name: 'Khám nhi khoa', tendichvu: 'Khám nhi khoa', price: 150000, dongia: 150000, quantity: 1, soluong: 1 },
    { name: 'Thuốc kháng sinh + siro', tendichvu: 'Thuốc kháng sinh + siro', price: 170000, dongia: 170000, quantity: 1, soluong: 1 }
  ]},
  { id: 3, mahd: 3, code: 'HD003', patientName: 'Lê Hoàng Long', date: '2026-10-04', totalAmount: 600000, status: 'UNPAID', trangthaithanhtoan: 'ChuaThanhToan', paymentMethod: 'Chưa thanh toán', phuongthuctt: 'ChuaThanhToan', items: [
    { name: 'Khám thần kinh chuyên sâu', tendichvu: 'Khám thần kinh chuyên sâu', price: 250000, dongia: 250000, quantity: 1, soluong: 1 },
    { name: 'Siêu âm Doppler mạch máu', tendichvu: 'Siêu âm Doppler mạch máu', price: 350000, dongia: 350000, quantity: 1, soluong: 1 }
  ]}
]

function normalizeInvoice(inv) {
  if (!inv) return null

  const isPaid = inv.trangthaithanhtoan === 'DaThanhToan' || inv.status === 'PAID'
  const dateStr = inv.ngaylap ? (typeof inv.ngaylap === 'string' ? inv.ngaylap.split('T')[0] : new Date(inv.ngaylap).toISOString().split('T')[0]) : (inv.date || '2026-10-01')

  const items = (inv.chitiethoadon || inv.items || []).map((it, idx) => ({
    id: it.macthd || idx + 1,
    name: it.dichvu?.tendichvu || it.thuoc?.tenthuoc || it.tendichvu || it.name || 'Dịch vụ/Thuốc',
    price: Number(it.dongia || it.price || 0),
    dongia: Number(it.dongia || it.price || 0),
    quantity: Number(it.soluong || it.quantity || 1),
    soluong: Number(it.soluong || it.quantity || 1),
    subtotal: Number(it.thanhtien || (Number(it.dongia || it.price || 0) * Number(it.soluong || it.quantity || 1)))
  }))

  const methodMap = {
    TienMat: 'Tiền mặt',
    ChuyenKhoan: 'Chuyển khoản (VietQR)',
    TheThanhToan: 'Thẻ thanh toán (POS)',
    ViDienTu: 'Ví điện tử'
  }

  return {
    id: inv.mahd || inv.id,
    mahd: inv.mahd || inv.id,
    malsk: inv.malsk,
    mabn: inv.mabn,
    code: inv.code || `HD${String(inv.mahd || inv.id).padStart(3, '0')}`,
    patientName: inv.benhnhan?.hoten || inv.patientName || 'Bệnh Nhân',
    phone: inv.benhnhan?.sdt || inv.phone || '',
    date: dateStr,
    ngaylap: dateStr,
    totalAmount: Number(inv.tongtien || inv.totalAmount || 0),
    tongtien: Number(inv.tongtien || inv.totalAmount || 0),
    status: isPaid ? 'PAID' : 'UNPAID',
    trangthaithanhtoan: inv.trangthaithanhtoan || (isPaid ? 'DaThanhToan' : 'ChuaThanhToan'),
    paymentMethod: methodMap[inv.phuongthuctt] || inv.paymentMethod || (isPaid ? 'Chuyển khoản' : 'Chưa thanh toán'),
    phuongthuctt: inv.phuongthuctt || 'TienMat',
    items
  }
}

export const invoiceService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/invoices', params)
      const list = Array.isArray(res) ? res : (res.data || [])
      if (list.length > 0) {
        return list.map(normalizeInvoice)
      }
      return initialInvoices
    } catch (err) {
      console.warn('[invoiceService] Gọi /invoices lỗi, dùng fallback:', err.message)
      return initialInvoices
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/invoices/${id}`)
      return normalizeInvoice(res.data || res)
    } catch {
      return initialInvoices.find(inv => inv.id === Number(id) || inv.mahd === Number(id)) || null
    }
  },

  async updatePayment(id, paymentData = {}) {
    try {
      const payload = {
        phuongthuctt: paymentData.phuongthuctt || (paymentData.paymentMethod === 'Tiền mặt' ? 'TienMat' : 'ChuyenKhoan'),
        trangthaithanhtoan: 'DaThanhToan'
      }
      const res = await api.put(`/invoices/${id}/payment`, payload)
      return normalizeInvoice(res.data || res)
    } catch {
      const found = initialInvoices.find(inv => inv.id === Number(id))
      if (found) {
        found.status = 'PAID'
        found.paymentMethod = paymentData.paymentMethod || 'Chuyển khoản'
      }
      return { id, status: 'PAID', ...paymentData }
    }
  },

  async updateStatus(id, status) {
    return this.updatePayment(id, { paymentMethod: status === 'PAID' ? 'Chuyển khoản' : 'Tiền mặt' })
  }
}

export default invoiceService
