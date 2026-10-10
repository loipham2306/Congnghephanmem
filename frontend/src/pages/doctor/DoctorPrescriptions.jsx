import { useState } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'
import './doctor.css'


const INITIAL_PRESCRIPTIONS = [
  {
    id: 1,
    code: 'DT001',
    patientName: 'Nguyễn Văn An',
    age: 65,
    date: '2026-10-10',
    diagnosis: 'Tăng huyết áp vô căn (I10)',
    medicines: [
      { name: 'Amlodipine 5mg', quantity: 14, unit: 'Viên', usage: 'Ngày 1 viên sáng sau ăn' },
      { name: 'Atorvastatin 20mg', quantity: 14, unit: 'Viên', usage: 'Ngày 1 viên tối trước ngủ' }
    ],
    status: 'Đã cấp thuốc'
  },
  {
    id: 2,
    code: 'DT002',
    patientName: 'Trần Thị Mai',
    age: 32,
    date: '2026-10-09',
    diagnosis: 'Viêm mũi họng cấp tính (J00)',
    medicines: [
      { name: 'Amoxicillin 500mg', quantity: 20, unit: 'Viên', usage: 'Ngày 2 lần x 1 viên sau ăn' },
      { name: 'Paracetamol 500mg', quantity: 10, unit: 'Viên', usage: 'Uống 1 viên khi sốt trên 38.5 độ' }
    ],
    status: 'Đã cấp thuốc'
  },
  {
    id: 3,
    code: 'DT003',
    patientName: 'Lê Hoàng Long',
    age: 45,
    date: '2026-10-08',
    diagnosis: 'Thiểu năng tuần hoàn não (G44)',
    medicines: [
      { name: 'Ginkgo Biloba 80mg', quantity: 30, unit: 'Viên', usage: 'Ngày 2 lần mỗi lần 1 viên' }
    ],
    status: 'Chờ lấy thuốc'
  }
]

export default function DoctorPrescriptions() {
  const [prescriptions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('clinic_doctor_prescriptions') || '[]')
      return [...saved, ...INITIAL_PRESCRIPTIONS]
    } catch {
      return INITIAL_PRESCRIPTIONS
    }
  })
  const [search, setSearch] = useState('')
  const [activePrescription, setActivePrescription] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('clinic_doctor_prescriptions') || '[]')
      return saved[0] || INITIAL_PRESCRIPTIONS[0]
    } catch {
      return INITIAL_PRESCRIPTIONS[0]
    }
  })

  const filtered = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DoctorLayout title="Kê Đơn Thuốc Điện Tử" subtitle="Quản lý và xuất đơn thuốc điện tử chuẩn Bộ Y Tế">
      
      {/* Tìm kiếm */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3 no-print">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm mã toa thuốc, tên bệnh nhân..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-6 text-md-end">
            <span className="badge bg-success-subtle text-success border px-3 py-2">
              <i className="bi bi-check-circle me-1"></i> Liên thông Dược Quốc Gia
            </span>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Danh sách các đơn thuốc */}
        <div className="col-12 col-lg-6 no-print">
          <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
                <thead className="table-light">
                  <tr>
                    <th>Mã Toa</th>
                    <th>Ngày Kê</th>
                    <th>Bệnh Nhân</th>
                    <th>Chẩn Đoán</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => setActivePrescription(p)}
                      className={`cursor-pointer ${activePrescription?.id === p.id ? 'table-primary' : ''}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="fw-bold text-primary">{p.code}</td>
                      <td>{p.date}</td>
                      <td>
                        <div className="fw-semibold text-dark">{p.patientName}</div>
                        <div className="text-muted small">{p.age} tuổi</div>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '160px' }}>{p.diagnosis}</td>
                      <td>
                        <span className={`badge ${p.status === 'Đã cấp thuốc' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'} border`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bản in toa thuốc điện tử mẫu */}
        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm rounded-3 bg-white p-4 prescription-print-document">
            <div className="border-bottom pb-3 mb-3 text-center">
              <div className="fw-bold text-primary" style={{ fontSize: '16px' }}>PHÒNG KHÁM ĐA KHOA PHÚ LỢI BẢO</div>
              <div className="text-muted small">Địa chỉ: 123 Nguyễn Tri Phương, Phường 7, Quận 5, TP.HCM</div>
              <div className="text-muted small">Điện thoại: (028) 3838 9999</div>
              <h5 className="fw-bold text-dark mt-3 mb-1 text-uppercase">ĐƠN THUỐC ĐIỆN TỬ</h5>
              <div className="text-muted small">Mã đơn: <strong>{activePrescription.code}</strong> • Ngày: {activePrescription.date}</div>
            </div>

            <div className="mb-3 small">
              <div className="row g-2">
                <div className="col-8">Họ và tên: <strong>{activePrescription.patientName}</strong></div>
                <div className="col-4">Tuổi: <strong>{activePrescription.age}</strong></div>
                <div className="col-12">Chẩn đoán: <strong>{activePrescription.diagnosis}</strong></div>
              </div>
            </div>

            {/* Chi tiết thuốc */}
            <div className="table-responsive mb-3">
              <table className="table table-bordered table-sm align-middle" style={{ fontSize: '13px' }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '35px' }} className="text-center">#</th>
                    <th>Tên thuốc & Hàm lượng</th>
                    <th style={{ width: '80px' }} className="text-center">Số lượng</th>
                  </tr>
                </thead>
                <tbody>
                  {activePrescription.medicines.map((m, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{idx + 1}</td>
                      <td>
                        <div className="fw-semibold text-dark">{m.name}</div>
                        <div className="text-muted" style={{ fontSize: '11.5px' }}>↳ <em>{m.usage}</em></div>
                      </td>
                      <td className="text-center fw-bold">{m.quantity} {m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Khung Bảng Kê Viện Phí & Mã VietQR */}
            <div className="border rounded p-2.5 mb-3 bg-light" style={{ fontSize: '11px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <div className="fw-bold text-uppercase text-primary mb-1">Phiếu Thu Viện Phí & Tiền Thuốc</div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>1. Tiền công khám chuyên khoa:</span>
                    <strong>150.000 đ</strong>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>2. Tiền thuốc theo đơn ({activePrescription.medicines.length} loại):</span>
                    <strong>120.000 đ</strong>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-1 mt-1 fw-bold text-danger" style={{ fontSize: '12px' }}>
                    <span>TỔNG CỘNG PHẢI THU:</span>
                    <span>270.000 đ</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: '9.5px', fontStyle: 'italic', marginTop: '2px' }}>
                    * Quét mã QR chuyển khoản hoặc nộp tiền mặt tại Quầy Thu Ngân.
                  </div>
                </div>
                <div style={{ width: '105px', textAlign: 'center', borderLeft: '1px solid #ddd', paddingLeft: '8px' }}>
                  <img 
                    src={`https://api.vietqr.io/image/970422-02838389999-compact2.jpg?amount=270000&addInfo=TT%20VIEN%20PHI%20${activePrescription.code}&accountName=PHONG%20KHAM%20PHU%20LOI%20BAO`}
                    alt="VietQR"
                    style={{ width: '85px', height: '85px', objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: '9px', fontWeight: 'bold' }}>MB BANK: 02838389999</div>
                  <div style={{ fontSize: '8px', color: '#666' }}>PK PHÚ LỢI BẢO</div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-end mt-4 pt-3 border-top">
              <div className="small text-muted">
                <em>* Tái khám mang theo đơn này.</em><br />
                <em>* Giờ uống thuốc tuân thủ hướng dẫn.</em>
              </div>
              <div className="text-center">
                <div className="small text-muted mb-4">Bác sĩ khám bệnh</div>
                <div className="fw-bold text-dark">BS. CKII. Trần Văn Hùng</div>
              </div>
            </div>

            <div className="mt-4 pt-2 text-center border-top no-print">
              <button className="btn btn-primary btn-sm px-4" onClick={() => window.print()}>
                <i className="bi bi-printer me-1"></i> In Toa Thuốc Này
              </button>
            </div>
          </div>
        </div>
      </div>

    </DoctorLayout>
  )
}
