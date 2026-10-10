import { useState } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'

const INITIAL_RECORDS = [
  { 
    id: 1, 
    code: 'BA001', 
    patientName: 'Nguyễn Văn An', 
    age: 65, 
    gender: 'Nam', 
    date: '2026-10-01', 
    diagnosis: 'Tăng huyết áp vô căn độ 1 (I10)', 
    symptoms: 'Đau đầu, chóng mặt khi làm việc căng thẳng, thỉnh thoảng hồi hộp', 
    treatment: 'Amlodipine 5mg, Atorvastatin 20mg. Tái khám sau 2 tuần.',
    bp: '140/90 mmHg',
    status: 'Đã hoàn thành'
  },
  { 
    id: 2, 
    code: 'BA002', 
    patientName: 'Trần Thị Mai', 
    age: 32, 
    gender: 'Nữ', 
    date: '2026-10-03', 
    diagnosis: 'Viêm mũi họng cấp tính (J00)', 
    symptoms: 'Sốt nhẹ 38 độ, ho khan, rát họng kéo dài 3 ngày', 
    treatment: 'Kháng sinh Augmentin 1g, Paracetamol 500mg, súc họng nước muối.',
    bp: '110/70 mmHg',
    status: 'Đã hoàn thành'
  },
  { 
    id: 3, 
    code: 'BA003', 
    patientName: 'Lê Hoàng Long', 
    age: 45, 
    gender: 'Nam', 
    date: '2026-10-04', 
    diagnosis: 'Rối loạn tuần hoàn não (G44)', 
    symptoms: 'Mất ngủ, hoa mắt khi thay đổi tư thế, mệt mỏi', 
    treatment: 'Ginkgo Biloba, Piracetam 800mg, tập thở dưỡng sinh.',
    bp: '125/80 mmHg',
    status: 'Đang theo dõi'
  },
  { 
    id: 4, 
    code: 'BA004', 
    patientName: 'Phạm Hương Giang', 
    age: 28, 
    gender: 'Nữ', 
    date: '2026-10-05', 
    diagnosis: 'Viêm loét dạ dày tá tràng (K29)', 
    symptoms: 'Đau tức vùng thượng vị sau khi ăn no hoặc khi đói', 
    treatment: 'Esomeprazole 40mg, Phosphalugel gói trước ăn.',
    bp: '105/65 mmHg',
    status: 'Đã hoàn thành'
  }
]

export default function DoctorMedicalRecords() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('clinic_doctor_records') || '[]')
      return [...saved, ...INITIAL_RECORDS]
    } catch {
      return INITIAL_RECORDS
    }
  })
  const [search, setSearch] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)

  const filtered = records.filter(r => 
    r.patientName.toLowerCase().includes(search.toLowerCase()) || 
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DoctorLayout title="Hồ Sơ Bệnh Án Điện Tử" subtitle="Tra cứu, theo dõi tiền sử bệnh lý và cập nhật hồ sơ khám chữa bệnh">
      
      {/* Thanh tìm kiếm & lọc */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm mã bệnh án, tên bệnh nhân, chẩn đoán..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 text-md-end">
            <span className="text-muted small me-2">Tìm thấy: <strong>{filtered.length}</strong> hồ sơ</span>
          </div>
        </div>
      </div>

      {/* Danh sách Bệnh Án */}
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
                <thead className="table-light">
                  <tr>
                    <th>Mã BA</th>
                    <th>Ngày Khám</th>
                    <th>Bệnh Nhân</th>
                    <th>Chẩn Đoán Bệnh</th>
                    <th>Huyết Áp</th>
                    <th className="text-end pe-3">Xem</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedRecord(r)}
                      className={`cursor-pointer ${selectedRecord?.id === r.id ? 'table-primary' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="fw-bold text-primary">{r.code}</td>
                      <td>{r.date}</td>
                      <td>
                        <div className="fw-semibold text-dark">{r.patientName}</div>
                        <div className="text-muted small">{r.gender}, {r.age}t</div>
                      </td>
                      <td className="fw-medium text-dark">{r.diagnosis}</td>
                      <td><span className="badge bg-light text-dark border">{r.bp}</span></td>
                      <td className="text-end pe-3">
                        <button className="btn btn-sm btn-outline-primary py-1 px-2">
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cột Chi Tiết Bệnh Án (Xem nhanh hoặc In) */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 h-100">
            {selectedRecord ? (
              <div>
                <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                  <h6 className="fw-bold text-primary mb-0 d-flex align-items-center">
                    <i className="bi bi-journal-medical me-2"></i> Chi Tiết Bệnh Án #{selectedRecord.code}
                  </h6>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
                    <i className="bi bi-printer me-1"></i> In BA
                  </button>
                </div>

                <div className="mb-3 p-2 bg-light rounded">
                  <div className="d-flex justify-content-between">
                    <strong>{selectedRecord.patientName}</strong>
                    <span className="text-muted">{selectedRecord.gender}, {selectedRecord.age} tuổi</span>
                  </div>
                  <div className="text-muted small mt-1">Ngày lập: {selectedRecord.date} • Chỉ số HA: {selectedRecord.bp}</div>
                </div>

                <div className="mb-2">
                  <span className="text-muted small fw-bold text-uppercase d-block">Triệu chứng lâm sàng:</span>
                  <div className="p-2 border rounded bg-white small text-secondary">{selectedRecord.symptoms}</div>
                </div>

                <div className="mb-2">
                  <span className="text-muted small fw-bold text-uppercase d-block">Chẩn đoán bệnh (ICD):</span>
                  <div className="p-2 border rounded bg-light-subtle small fw-bold text-primary">{selectedRecord.diagnosis}</div>
                </div>

                <div className="mb-3">
                  <span className="text-muted small fw-bold text-uppercase d-block">Phác đồ điều trị & Thuốc:</span>
                  <div className="p-2 border rounded bg-white small text-secondary">{selectedRecord.treatment}</div>
                </div>

                <div className="alert alert-info py-2 small mb-0 d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                  Hồ sơ được số hóa và ký điện tử bởi BS. CKII. Trần Văn Hùng.
                </div>
              </div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-clipboard2-pulse fs-1 text-secondary opacity-50 d-block mb-2"></i>
                Chọn một hồ sơ bệnh án bên trái để xem đầy đủ thông tin chi tiết.
              </div>
            )}
          </div>
        </div>
      </div>

    </DoctorLayout>
  )
}
