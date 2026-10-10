import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import StatusBadge from '../../components/common/StatusBadge'
import invoiceService from '../../services/invoiceService'
import { formatCurrency } from '../../utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await invoiceService.getAll()
        const savedInvoices = JSON.parse(localStorage.getItem('clinic_invoices') || '[]')
        setInvoices([...savedInvoices, ...data])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = invoices.filter(inv => 
    inv.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.code?.toLowerCase().includes(search.toLowerCase())
  )

  const handlePay = async (id) => {
    await invoiceService.updateStatus(id, 'PAID')
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'PAID', paymentMethod: 'Đã thanh toán tại quầy' } : i))
    try {
      const savedInvoices = JSON.parse(localStorage.getItem('clinic_invoices') || '[]')
      const updated = savedInvoices.map(i => i.id === id ? { ...i, status: 'PAID', paymentMethod: 'Đã thanh toán tại quầy' } : i)
      localStorage.setItem('clinic_invoices', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice(prev => ({ ...prev, status: 'PAID', paymentMethod: 'Đã thanh toán tại quầy' }))
    }
  }

  return (
    <AdminLayout title="Quản Lý Hóa Đơn & Thu Phí">
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Tìm theo mã HĐ, tên bệnh nhân..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Đang tải danh sách hóa đơn..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mã HĐ</th>
                    <th>Bệnh Nhân</th>
                    <th>Ngày Tạo</th>
                    <th>Tổng Tiền</th>
                    <th>Phương Thức</th>
                    <th>Trạng Thái</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id}>
                      <td className="fw-semibold text-primary">#{inv.code}</td>
                      <td className="fw-bold">{inv.patientName}</td>
                      <td>{inv.date}</td>
                      <td className="fw-bold text-success">{formatCurrency(inv.totalAmount)}</td>
                      <td>{inv.paymentMethod}</td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td className="text-end">
                        <button 
                          className="btn btn-outline-primary btn-sm me-1"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <i className="bi bi-receipt me-1"></i> Chi Tiết
                        </button>
                        {inv.status === 'UNPAID' && (
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handlePay(inv.id)}
                          >
                            <i className="bi bi-check2-circle me-1"></i> Thu Tiền
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Chi Tiết Hóa Đơn #{selectedInvoice.code}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedInvoice(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <div>
                    <strong>Khách hàng:</strong> {selectedInvoice.patientName}
                    <div className="text-muted small">Ngày xuất: {selectedInvoice.date}</div>
                  </div>
                  <div className="text-end">
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                </div>

                <div className="list-group list-group-flush mb-3">
                  {selectedInvoice.items?.map((item, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <div>{item.name}</div>
                        <small className="text-muted">SL: {item.quantity}</small>
                      </div>
                      <span className="fw-semibold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <h6 className="fw-bold m-0">Tổng Cộng:</h6>
                  <h5 className="fw-bold text-success m-0">{formatCurrency(selectedInvoice.totalAmount)}</h5>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Đóng</button>
                <button type="button" className="btn btn-primary" onClick={() => window.print()}>In Hóa Đơn</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
