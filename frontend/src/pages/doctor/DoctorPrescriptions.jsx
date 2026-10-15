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
  const [showPrintModal, setShowPrintModal] = useState(false)
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
                    <th className="text-end pe-3">Xem & In</th>
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
                      <td className="text-truncate" style={{ maxWidth: '140px' }}>{p.diagnosis}</td>
                      <td>
                        <span className={`badge ${p.status === 'Đã cấp thuốc' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'} border`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-primary py-1 px-2.5 d-inline-flex align-items-center gap-1 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActivePrescription(p)
                            setShowPrintModal(true)
                          }}
                          title="Xem và In Toa Thuốc"
                        >
                          <i className="bi bi-printer"></i>
                          <span>Xem/In</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bản in toa thuốc điện tử mẫu */}
        <div className="col-12 col-lg-6 prescription-print-col">
          <div className="card border shadow-sm rounded-3 bg-white p-4 prescription-print-document">
            
            {/* Thanh công cụ xem trước và in bên cột phải */}
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom no-print">
              <div>
                <span className="fw-bold text-dark d-flex align-items-center">
                  <i className="bi bi-file-earmark-medical-fill text-primary me-2"></i>
                  Toa Thuốc #{activePrescription.code}
                </span>
              </div>
              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                  onClick={() => setShowPrintModal(true)}
                >
                  <i className="bi bi-eye me-1"></i> Xem Chi Tiết
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-primary d-flex align-items-center fw-semibold"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i> In Toa
                </button>
              </div>
            </div>
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
              <button className="btn btn-primary btn-sm px-4 fw-semibold" onClick={() => window.print()}>
                <i className="bi bi-printer me-1"></i> In Toa Thuốc Này (Ctrl + P)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL XEM TRƯỚC VÀ IN TOA THUỐC ĐIỆN TỬ ================= */}
      {showPrintModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-start overflow-y-auto p-3 p-md-4"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 2100, backdropFilter: 'blur(4px)' }}
        >
          {/* Header thanh công cụ modal */}
          <div className="bg-white rounded-3 shadow-sm px-4 py-3 mb-3 d-flex align-items-center justify-content-between w-100 no-print" style={{ maxWidth: '820px' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                <i className="bi bi-printer-fill fs-5"></i>
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">Xem Trước & In Toa Thuốc</h5>
                <span className="text-muted small">Mã: <strong>{activePrescription.code}</strong> • Bệnh nhân: <strong>{activePrescription.patientName}</strong></span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-primary d-flex align-items-center px-3 fw-semibold shadow-sm"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1.5"></i> In Toa Thuốc (Ctrl + P)
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary px-3"
                onClick={() => setShowPrintModal(false)}
              >
                <i className="bi bi-x-lg me-1"></i> Đóng
              </button>
            </div>
          </div>

          {/* Khung giấy A4 xem trước */}
          <div className="prescription-paper-preview mb-4">
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15pt', textTransform: 'uppercase' }}>PHÒNG KHÁM ĐA KHOA PHÚ LỢI BẢO</div>
              <div style={{ fontSize: '10pt', color: '#444' }}>Địa chỉ: 123 Nguyễn Tri Phương, Phường 7, Quận 5, TP.HCM • Hotline: (028) 3838 9999</div>
              <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '14px 0 6px 0', textTransform: 'uppercase' }}>ĐƠN THUỐC ĐIỆN TỬ</h2>
              <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>
                Mã đơn: {activePrescription.code} • Ngày: {activePrescription.date}
              </div>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '11pt', lineHeight: '1.6' }}>
              <div>Họ và tên bệnh nhân: <strong>{activePrescription.patientName}</strong> • Tuổi: <strong>{activePrescription.age}</strong></div>
              <div>Chẩn đoán: <strong>{activePrescription.diagnosis}</strong></div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th style={{ width: '35px', textAlign: 'center' }}>STT</th>
                  <th>Tên Thuốc / Hàm Lượng</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Số Lượng</th>
                  <th>Cách Dùng & Liều Lượng</th>
                </tr>
              </thead>
              <tbody>
                {activePrescription.medicines.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{m.quantity} {m.unit}</td>
                    <td>{m.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Khung Bảng Kê Viện Phí & Mã VietQR */}
            <div style={{ border: '1.5px solid #111', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, paddingRight: '16px', fontSize: '10.5pt', lineHeight: '1.7' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '11pt', textTransform: 'uppercase', marginBottom: '4px', color: '#175cdd' }}>
                    PHIẾU THU VIỆN PHÍ & TIỀN THUỐC
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1. Tiền công khám chuyên khoa:</span>
                    <strong>150.000 đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2. Tiền thuốc theo đơn ({activePrescription.medicines.length} loại):</span>
                    <strong>120.000 đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #555', marginTop: '6px', paddingTop: '6px', fontSize: '11.5pt' }}>
                    <span style={{ fontWeight: 'bold' }}>TỔNG CỘNG PHẢI THU:</span>
                    <strong style={{ color: '#b91c1c', fontSize: '12.5pt' }}>270.000 đ</strong>
                  </div>
                  <div style={{ fontSize: '8.5pt', color: '#444', marginTop: '4px', fontStyle: 'italic' }}>
                    * Quét mã VietQR bằng App Ngân Hàng hoặc thanh toán tiền mặt tại Quầy Thu Ngân.
                  </div>
                </div>

                <div style={{ width: '130px', textAlign: 'center', borderLeft: '1px solid #ccc', paddingLeft: '12px' }}>
                  <img 
                    src={`https://api.vietqr.io/image/970422-02838389999-compact2.jpg?amount=270000&addInfo=TT%20VIEN%20PHI%20${activePrescription.code}&accountName=PHONG%20KHAM%20PHU%20LOI%20BAO`}
                    alt="VietQR"
                    style={{ width: '95px', height: '95px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px', padding: '2px', background: '#fff' }}
                  />
                  <div style={{ fontSize: '8pt', fontWeight: 'bold', marginTop: '2px' }}>MB BANK: 02838389999</div>
                  <div style={{ fontSize: '7pt', color: '#555' }}>PK PHÚ LỢI BẢO</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '24px' }}>
              <div style={{ fontSize: '9pt', fontStyle: 'italic', maxWidth: '320px', lineHeight: '1.5' }}>
                * Tái khám mang theo đơn này.<br />
                * Giờ uống thuốc tuân thủ hướng dẫn của bác sĩ điều trị.
              </div>
              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
                <div style={{ fontWeight: 'bold', margin: '4px 0 55px 0' }}>Bác sĩ khám bệnh</div>
                <div style={{ fontWeight: 'bold', fontSize: '11.5pt' }}>BS. CKII. Trần Văn Hùng</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </DoctorLayout>
  )
}
