import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import prescriptionService from '../../services/prescriptionService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPrescription, setSelectedPrescription] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await prescriptionService.getAll()
        setPrescriptions(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = prescriptions.filter(p => 
    p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase()) ||
    p.doctorName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Quản Lý Đơn Thuốc">
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Tìm theo tên bệnh nhân, mã đơn thuốc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Đang tải danh sách đơn thuốc..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Bệnh Nhân</th>
                    <th>Bác Sĩ Kê Đơn</th>
                    <th>Ngày Kê Đơn</th>
                    <th>Số Lượng Thuốc</th>
                    <th className="text-end">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td className="fw-semibold text-primary">#{p.code}</td>
                      <td className="fw-bold">{p.patientName}</td>
                      <td>{p.doctorName}</td>
                      <td>{p.date}</td>
                      <td><span className="badge bg-secondary">{p.medicines?.length || p.totalMedicines || 0} loại thuốc</span></td>
                      <td className="text-end">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setSelectedPrescription(p)}
                        >
                          <i className="bi bi-file-earmark-medical me-1"></i> Xem Đơn
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Chi Tiết Đơn Thuốc #{selectedPrescription.code}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedPrescription(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-2 mb-3">
                  <div className="col-md-6"><strong>Bệnh nhân:</strong> {selectedPrescription.patientName}</div>
                  <div className="col-md-6"><strong>Bác sĩ:</strong> {selectedPrescription.doctorName}</div>
                  <div className="col-md-6"><strong>Ngày kê:</strong> {selectedPrescription.date}</div>
                </div>

                <div className="table-responsive mb-3">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Tên Thuốc</th>
                        <th>Số Lượng</th>
                        <th>Cách Dùng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.medicines?.map((m, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td className="fw-semibold text-primary">{m.name}</td>
                          <td>{m.quantity} {m.unit}</td>
                          <td>{m.usage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedPrescription.notes && (
                  <div className="alert alert-warning py-2 small mb-0">
                    <strong>Lời dặn của bác sĩ:</strong> {selectedPrescription.notes}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPrescription(null)}>Đóng</button>
                <button type="button" className="btn btn-primary" onClick={() => window.print()}>In Đơn Thuốc</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
