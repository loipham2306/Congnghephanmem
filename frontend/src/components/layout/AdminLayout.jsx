import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'

export default function AdminLayout({ children, title = 'Hệ Thống Quản Lý' }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { path: '/dashboard', label: 'Tổng Quan', icon: 'bi-speedometer2' },
    { path: '/appointments', label: 'Lịch Hẹn', icon: 'bi-calendar-check' },
    { path: '/patients', label: 'Bệnh Nhân', icon: 'bi-people' },
    { path: '/doctors-manage', label: 'Bác Sĩ', icon: 'bi-person-badge' },
    { path: '/medical-records', label: 'Hồ Sơ Bệnh Án', icon: 'bi-clipboard2-pulse' },
    { path: '/prescriptions', label: 'Đơn Thuốc', icon: 'bi-capsule' },
    { path: '/invoices', label: 'Hóa Đơn', icon: 'bi-receipt' },
    { path: '/users', label: 'Tài Khoản', icon: 'bi-shield-lock' },
  ]

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      {/* Sidebar */}
      <aside 
        className="bg-white border-end d-flex flex-column"
        style={{
          width: sidebarOpen ? '260px' : '70px',
          transition: 'width 0.25s ease',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 1000
        }}
      >
        {/* Brand */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <Link to="/" className="d-flex align-items-center text-decoration-none text-primary fw-bold">
            <i className="bi bi-hospital fs-4 me-2"></i>
            {sidebarOpen && <span className="fs-5">Clinic Admin</span>}
          </Link>
          <button 
            className="btn btn-sm btn-light border-0" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Thu gọn / Mở rộng"
          >
            <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex-grow-1 overflow-auto">
          <ul className="nav nav-pills flex-column gap-1">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link d-flex align-items-center py-2 px-3 rounded ${
                      isActive ? 'bg-primary text-white' : 'text-secondary hover-bg-light'
                    }`
                  }
                >
                  <i className={`bi ${item.icon} fs-5 ${sidebarOpen ? 'me-3' : 'mx-auto'}`}></i>
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer info */}
        <div className="p-3 border-top">
          <Link to="/" className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center">
            <i className="bi bi-house-door me-2"></i>
            {sidebarOpen && <span>Về Trang Chủ</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-vw-0">
        {/* Top Navbar */}
        <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
          <h5 className="m-0 text-dark fw-bold">{title}</h5>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
              <i className="bi bi-circle-fill me-1" style={{ fontSize: '8px' }}></i> Hệ thống hoạt động
            </span>
            <div className="d-flex align-items-center gap-2">
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '36px', height: '36px' }}
              >
                AD
              </div>
              <div className="d-none d-sm-block text-start">
                <div className="fw-semibold text-dark small">Admin Clinic</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>Quản trị viên</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-4 flex-grow-1">
          {children}
        </main>
      </div>
    </div>
  )
}
