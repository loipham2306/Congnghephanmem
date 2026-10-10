import { useState } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'

const INITIAL_APPOINTMENTS = [
  { id: 1, code: 'LH001', patientName: 'Nguyễn Văn An', phone: '0901 234 567', timeSlot: '08:00 - 08:30', date: '2026-10-10', type: 'Tái khám định kỳ', status: 'CONFIRMED', notes: 'Khám kiểm tra huyết áp và điện tim' },
  { id: 2, code: 'LH002', patientName: 'Trần Thị Mai', phone: '0912 345 678', timeSlot: '08:30 - 09:00', date: '2026-10-10', type: 'Khám mới', status: 'CONFIRMED', notes: 'Ho rát họng, khàn tiếng' },
  { id: 3, code: 'LH003', patientName: 'Lê Hoàng Long', phone: '0987 654 321', timeSlot: '09:00 - 09:30', date: '2026-10-10', type: 'Khám chuyên khoa', status: 'PENDING', notes: 'Đau đầu, chóng mặt kéo dài' },
  { id: 4, code: 'LH004', patientName: 'Phạm Hương Giang', phone: '0933 221 100', timeSlot: '10:00 - 10:30', date: '2026-10-10', type: 'Tái khám', status: 'CONFIRMED', notes: 'Theo dõi đơn thuốc viêm dạ dày' },
  { id: 5, code: 'LH005', patientName: 'Vũ Đức Minh', phone: '0978 112 233', timeSlot: '10:30 - 11:00', date: '2026-10-10', type: 'Khám mới', status: 'CANCELLED', notes: 'Bệnh nhân bận việc đột xuất xin dời lịch' },
  { id: 6, code: 'LH006', patientName: 'Đặng Thùy Dung', phone: '0944 556 677', timeSlot: '14:00 - 14:30', date: '2026-10-10', type: 'Tái khám tim mạch', status: 'CONFIRMED', notes: 'Mang theo kết quả siêu âm tim' }
]

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('2026-10-10')

  const filtered = appointments.filter(a => {
    const matchSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone.includes(searchTerm)
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    const matchDate = selectedDate ? a.date === selectedDate : true
    return matchSearch && matchStatus && matchDate
  })

  const handleUpdateStatus = (id, newStatus) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a))
  }

  return (
    <DoctorLayout title="Lịch Khám Của Tôi" subtitle="Danh sách bệnh nhân hẹn khám trước được phân công cho bác sĩ">
      
      {/* Thống kê nhanh */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-primary border-4">
            <div className="text-muted small">Tổng ca hôm nay</div>
            <div className="fw-bold fs-4 text-dark">{appointments.length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-success border-4">
            <div className="text-muted small">Đã xác nhận</div>
            <div className="fw-bold fs-4 text-success">{appointments.filter(a => a.status === 'CONFIRMED').length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-warning border-4">
            <div className="text-muted small">Chờ xác nhận</div>
            <div className="fw-bold fs-4 text-warning-emphasis">{appointments.filter(a => a.status === 'PENDING').length}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 bg-white p-3 border-start border-danger border-4">
            <div className="text-muted small">Hủy / Vắng mặt</div>
            <div className="fw-bold fs-4 text-danger">{appointments.filter(a => a.status === 'CANCELLED').length}</div>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="card border-0 shadow-sm rounded-3 bg-white p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm tên bệnh nhân hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <input 
              type="date" 
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-3">
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setSelectedDate('2026-10-10'); }}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Bảng danh sách lịch hẹn */}
      <div className="card border-0 shadow-sm rounded-3 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
            <thead className="table-light">
              <tr>
                <th style={{ width: '90px' }}>Mã hẹn</th>
                <th>Khung Giờ</th>
                <th>Bệnh Nhân</th>
                <th>Điện Thoại</th>
                <th>Phân Loại</th>
                <th>Ghi Chú Triệu Chứng</th>
                <th style={{ width: '130px' }} className="text-center">Trạng Thái</th>
                <th style={{ width: '140px' }} className="text-end pe-3">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold text-primary">{item.code}</td>
                  <td>
                    <span className="badge bg-light text-dark border px-2 py-1">
                      <i className="bi bi-clock me-1 text-primary"></i>{item.timeSlot}
                    </span>
                  </td>
                  <td>
                    <div className="fw-semibold text-dark">{item.patientName}</div>
                  </td>
                  <td>{item.phone}</td>
                  <td>
                    <span className="badge bg-info-subtle text-info border">
                      {item.type}
                    </span>
                  </td>
                  <td className="text-secondary text-truncate" style={{ maxWidth: '220px' }} title={item.notes}>
                    {item.notes}
                  </td>
                  <td className="text-center">
                    {item.status === 'CONFIRMED' && (
                      <span className="badge bg-success-subtle text-success border border-success">
                        Đã xác nhận
                      </span>
                    )}
                    {item.status === 'PENDING' && (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning">
                        Chờ xác nhận
                      </span>
                    )}
                    {item.status === 'CANCELLED' && (
                      <span className="badge bg-danger-subtle text-danger border border-danger">
                        Đã hủy
                      </span>
                    )}
                  </td>
                  <td className="text-end pe-3">
                    {item.status === 'PENDING' && (
                      <button 
                        className="btn btn-sm btn-success me-1 py-1 px-2"
                        onClick={() => handleUpdateStatus(item.id, 'CONFIRMED')}
                        title="Tiếp nhận lịch"
                      >
                        <i className="bi bi-check-lg"></i>
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-outline-danger py-1 px-2"
                      onClick={() => handleUpdateStatus(item.id, 'CANCELLED')}
                      title="Hủy lịch"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Không tìm thấy lịch hẹn nào theo điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </DoctorLayout>
  )
}
