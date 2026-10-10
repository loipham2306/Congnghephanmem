import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

import patientService from '../../services/patientService'
import appointmentService from '../../services/appointmentService'
import invoiceService from '../../services/invoiceService'
import { formatCurrency } from '../../utils'

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [pData, aData, iData] = await Promise.all([
          patientService.getAll(),
          appointmentService.getAll(),
          invoiceService.getAll()
        ])
        setPatients(pData)
        setAppointments(aData)
        setInvoices(iData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pendingAppointments = appointments.filter(a => a.status === 'PENDING').length
  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)

  const stats = [
    { title: 'Tổng Bệnh Nhân', value: patients.length, icon: 'bi-people-fill', color: 'primary', link: '/patients' },
    { title: 'Lịch Hẹn Hôm Nay', value: appointments.length, icon: 'bi-calendar-event-fill', color: 'info', link: '/appointments' },
    { title: 'Chờ Xác Nhận', value: pendingAppointments, icon: 'bi-hourglass-split', color: 'warning', link: '/appointments' },
    { title: 'Doanh Thu Đã Thu', value: formatCurrency(totalRevenue), icon: 'bi-cash-coin', color: 'success', link: '/invoices' },
  ]

  if (loading) {
    return (
      <AdminLayout title="Bảng Điều Khiển Tổng Quan">
        <LoadingSpinner text="Đang tải dữ liệu tổng quan..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Bảng Điều Khiển Tổng Quan">
      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <Link to={stat.link} className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 h-100 transition-hover">
                <div className="card-body p-4 d-flex align-items-center">
                  <div 
                    className={`rounded-4 bg-${stat.color}-subtle text-${stat.color} p-3 d-flex align-items-center justify-content-center me-3`}
                    style={{ width: '60px', height: '60px' }}
                  >
                    <i className={`bi ${stat.icon} fs-3`}></i>
                  </div>
                  <div>
                    <h6 className="text-muted text-uppercase mb-1 small fw-semibold" style={{ letterSpacing: '0.5px' }}>{stat.title}</h6>
                    <h3 className="fw-bold mb-0 text-dark">{stat.value}</h3>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Appointments */}
      <div className="row g-4">
        {/* Recent Appointments */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 py-3 px-4 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold m-0 text-dark">Lịch Hẹn Gần Đây</h5>
              <Link to="/appointments" className="btn btn-outline-primary btn-sm rounded-pill">
                Xem Tất Cả
              </Link>
            </div>
            <div className="table-responsive px-4 pb-3">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mã Lịch</th>
                    <th>Bệnh Nhân</th>
                    <th>Bác Sĩ</th>
                    <th>Ngày Khám</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map((a) => (
                    <tr key={a.id}>
                      <td className="fw-semibold text-primary">#{a.code || a.id}</td>
                      <td>
                        <div className="fw-bold">{a.patientName}</div>
                        <small className="text-muted">{a.phone}</small>
                      </td>
                      <td>{a.doctorName}</td>
                      <td>{a.appointmentDate}</td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions & Clinic Status */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-0 py-3 px-4">
              <h5 className="fw-bold m-0 text-dark">Thao Tác Nhanh</h5>
            </div>
            <div className="card-body p-4 pt-0 d-flex flex-column gap-2">
              <Link to="/patients" className="btn btn-primary d-flex align-items-center justify-content-between py-2 px-3 rounded-3">
                <span><i className="bi bi-person-plus me-2"></i>Thêm Bệnh Nhân</span>
                <i className="bi bi-chevron-right"></i>
              </Link>
              <Link to="/appointments" className="btn btn-outline-primary d-flex align-items-center justify-content-between py-2 px-3 rounded-3">
                <span><i className="bi bi-calendar-plus me-2"></i>Tạo Lịch Hẹn Mới</span>
                <i className="bi bi-chevron-right"></i>
              </Link>
              <Link to="/prescriptions" className="btn btn-outline-secondary d-flex align-items-center justify-content-between py-2 px-3 rounded-3">
                <span><i className="bi bi-capsule me-2"></i>Kê Đơn Thuốc</span>
                <i className="bi bi-chevron-right"></i>
              </Link>
              <Link to="/invoices" className="btn btn-outline-success d-flex align-items-center justify-content-between py-2 px-3 rounded-3">
                <span><i className="bi bi-receipt me-2"></i>Lập Hóa Đơn Khám</span>
                <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-shield-check fs-2 me-3"></i>
              <div>
                <h6 className="fw-bold mb-0">Hệ Thống Sẵn Sàng</h6>
                <small className="text-white-50">Phiên bản 2.0 - Clinic Management</small>
              </div>
            </div>
            <p className="small mb-0 opacity-75">
              Hệ thống phòng khám tích hợp đầy đủ hồ sơ bệnh án điện tử, quản lý lịch khám, đơn thuốc và thanh toán tự động.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
