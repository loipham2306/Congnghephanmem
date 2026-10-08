import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import medicalRecordService from '../../services/medicalRecordService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function MedicalRecordList() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await medicalRecordService.getAll()
        setRecords(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = records.filter(r => 
    r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
    r.code?.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Hồ Sơ Bệnh Án Điện Tử (EMR)">
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Tìm theo tên bệnh nhân, chẩn đoán, mã BA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Đang tải hồ sơ bệnh án..." />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mã BA</th>
                    <th>Bệnh Nhân</th>
                    <th>Bác Sĩ Điều Trị</th>
                    <th>Ngày Khám</th>
                    <th>Chẩn Đoán</th>
                    <th className="text-end">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td className="fw-semibold text-primary">#{r.code}</td>
                      <td className="fw-bold">{r.patientName}</td>
                      <td>{r.doctorName}</td>
                      <td>{r.date}</td>
                      <td><span className="badge bg-light text-dark border">{r.diagnosis}</span></td>
                      <td className="text-end">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setSelectedRecord(r)}
                        >
                          <i className="bi bi-eye me-1"></i> Xem Hồ Sơ
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

      {/* Record Modal */}
      {selectedRecord && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Chi Tiết Bệnh Án #{selectedRecord.code}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <small className="text-muted d-block">Bệnh Nhân</small>
                    <span className="fw-bold fs-6">{selectedRecord.patientName}</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Bác Sĩ Phụ Trách</small>
                    <span className="fw-bold fs-6">{selectedRecord.doctorName}</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Ngày Khám</small>
                    <span>{selectedRecord.date}</span>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted d-block">Chẩn Đoán Sơ Bộ</small>
                    <span className="text-primary fw-semibold">{selectedRecord.diagnosis}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-dark">Triệu chứng lâm sàng</h6>
                  <p className="bg-light p-3 rounded-3 small">{selectedRecord.symptoms}</p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-dark">Hướng điều trị & Chỉ định</h6>
                  <p className="bg-light p-3 rounded-3 small">{selectedRecord.treatment}</p>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
