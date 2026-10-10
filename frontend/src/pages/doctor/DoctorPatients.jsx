import { useState } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'

const INITIAL_PATIENTS = [
  { id: 1, code: 'BN001', name: 'Nguyễn Văn An', age: 65, gender: 'Nam', phone: '0901 234 567', lastVisit: '2026-10-01', totalVisits: 4, mainDiagnosis: 'Tăng huyết áp vô căn (I10)', status: 'Đang theo dõi' },
  { id: 2, code: 'BN002', name: 'Trần Thị Mai', age: 32, gender: 'Nữ', phone: '0912 345 678', lastVisit: '2026-10-03', totalVisits: 2, mainDiagnosis: 'Viêm mũi họng cấp (J00)', status: 'Khỏi bệnh' },
  { id: 3, code: 'BN003', name: 'Lê Hoàng Long', age: 45, gender: 'Nam', phone: '0987 654 321', lastVisit: '2026-10-04', totalVisits: 3, mainDiagnosis: 'Rối loạn tuần hoàn não (G44)', status: 'Đang theo dõi' },
  { id: 4, code: 'BN004', name: 'Phạm Hương Giang', age: 28, gender: 'Nữ', phone: '0933 221 100', lastVisit: '2026-10-05', totalVisits: 1, mainDiagnosis: 'Viêm loét dạ dày (K29)', status: 'Đang dùng thuốc' },
  { id: 5, code: 'BN005', name: 'Hoàng Minh Tuấn', age: 52, gender: 'Nam', phone: '0978 112 233', lastVisit: '2026-09-28', totalVisits: 5, mainDiagnosis: 'Bệnh tim thiếu máu cục bộ', status: 'Đang theo dõi' }
]

export default function DoctorPatients() {
  const [patients] = useState(INITIAL_PATIENTS)
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DoctorLayout title="Bệnh Nhân Của Tôi" subtitle="Danh sách người bệnh đã từng được bác sĩ thăm khám và điều trị">
      
      {/* Search */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm mã bệnh nhân, họ tên hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-7 text-md-end">
            <span className="text-muted small">Tổng số bệnh nhân quản lý: <strong>{patients.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Bảng danh sách bệnh nhân */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
            <thead className="table-light">
              <tr>
                <th>Mã BN</th>
                <th>Họ và Tên</th>
                <th>Tuổi / Giới</th>
                <th>Số Điện Thoại</th>
                <th>Chẩn Đoán Chính</th>
                <th>Số Lần Khám</th>
                <th>Lần Khám Gần Nhất</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="fw-bold text-primary">{p.code}</td>
                  <td>
                    <div className="fw-semibold text-dark">{p.name}</div>
                  </td>
                  <td>{p.age} tuổi / {p.gender}</td>
                  <td>{p.phone}</td>
                  <td className="fw-medium text-dark">{p.mainDiagnosis}</td>
                  <td>
                    <span className="badge bg-light text-dark border px-2 py-1">
                      {p.totalVisits} lần
                    </span>
                  </td>
                  <td>{p.lastVisit}</td>
                  <td>
                    <span className="badge bg-primary-subtle text-primary border">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </DoctorLayout>
  )
}
