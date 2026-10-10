import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.jpg'
import '../../pages/doctor/doctor.css'

export default function DoctorLayout({ 
  children, 
  title = 'Bàn Khám Bệnh', 
  subtitle = 'Phân hệ Bác sĩ khám chữa bệnh',
  waitingCount = 4
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  // Đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Đóng drawer khi đổi kích thước màn hình lên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setMobileDrawerOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const doctorNavItems = [
    {
      path: '/doctor/ban-kham',
      label: 'Bàn Khám Bệnh',
      icon: 'bi-heart-pulse-fill',
      badge: waitingCount > 0 ? `${waitingCount} chờ` : null,
      badgeColor: 'bg-warning text-dark'
    },
    {
      path: '/doctor/lich-kham',
      label: 'Lịch Khám Của Tôi',
      icon: 'bi-calendar2-check-fill',
      badge: 'Hôm nay',
      badgeColor: 'bg-primary-subtle text-primary'
    },
    {
      path: '/doctor/benh-an',
      label: 'Hồ Sơ Bệnh Án',
      icon: 'bi-clipboard2-pulse-fill'
    },
    {
      path: '/doctor/ke-don',
      label: 'Kê Đơn Thuốc',
      icon: 'bi-capsule-pill'
    },
    {
      path: '/doctor/benh-nhan',
      label: 'Bệnh Nhân Của Tôi',
      icon: 'bi-people-fill'
    },
    {
      path: '/doctor/lich-truc',
      label: 'Lịch Trực & Ca Làm',
      icon: 'bi-clock-history'
    }
  ]

  const doctorName = user?.fullName || 'BS. CKII. Trần Văn Hùng'
  const doctorDepartment = 'Khoa Tim Mạch & Nội Khoa'
  const clinicRoom = 'Phòng Khám Nội 01 (P.102)'

  return (
    <div className="doctor-portal-wrapper">
      
      {/* ================= TOPBAR / HEADER CỐ ĐỊNH ================= */}
      <header className="doctor-topbar">
        
        {/* Trái: Toggle & Thương hiệu Phòng khám */}
        <div className="doctor-topbar-left">
          {/* Nút mở menu trên Mobile */}
          <button
            type="button"
            className="btn btn-light d-lg-none border px-2 py-1 text-primary"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Mở menu bác sĩ"
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          {/* Nút thu gọn / mở rộng trên Desktop */}
          <button
            type="button"
            className="btn btn-light d-none d-lg-inline-flex align-items-center justify-content-center border-0 text-muted p-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
            style={{ width: '36px', height: '36px', borderRadius: '8px' }}
          >
            <i className={`bi ${sidebarOpen ? 'bi-text-indent-left' : 'bi-text-indent-right'} fs-5`}></i>
          </button>

          {/* Logo & Nhận diện Phòng khám */}
          <Link to="/" className="doctor-topbar-brand">
            <img 
              src={logo} 
              alt="Logo Phú Lợi Bảo" 
              style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px' }} 
            />
            <div className="d-flex flex-column text-start">
              <span className="text-secondary fw-semibold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.8px', lineHeight: '1.1' }}>
                Phòng Khám
              </span>
              <div className="fw-bold lh-1" style={{ fontSize: '16px', letterSpacing: '0.2px', marginTop: '2px' }}>
                <span style={{ color: '#1f60d0' }}>Phú Lợi</span>{' '}
                <span style={{ color: '#18a94f' }}>Bảo</span>
              </div>
              <span className="text-muted fw-medium" style={{ fontSize: '9.5px', marginTop: '2px', letterSpacing: '0.3px' }}>
                Cổng Bác Sĩ & Điều Trị
              </span>
            </div>
          </Link>

          {/* Link nhanh về Website công khai */}
          <Link 
            to="/" 
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-outline-primary d-none d-xl-inline-flex align-items-center ms-2 py-1 px-2"
            style={{ fontSize: '12px', borderRadius: '6px' }}
            title="Mở cổng thông tin công cộng trong tab mới"
          >
            <i className="bi bi-globe me-1"></i> Xem Website
          </Link>
        </div>

        {/* Giữa: Thông tin Vị trí làm việc của Bác sĩ */}
        <div className="doctor-topbar-center">
          <div className="d-flex align-items-center text-primary fw-semibold">
            <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
            <span>{clinicRoom}</span>
          </div>
          <span className="text-muted">|</span>
          <div className="d-flex align-items-center text-secondary">
            <i className="bi bi-clock-fill me-1 text-warning"></i>
            <span>Ca sáng: 07:30 - 11:30</span>
          </div>
          <span className="text-muted">|</span>
          <div className="text-success fw-bold font-monospace">
            {currentTime.toLocaleTimeString('vi-VN')}
          </div>
        </div>

        {/* Phải: Thông báo, Thông tin Bác sĩ, Đăng xuất */}
        <div className="doctor-topbar-right">
          
          {/* Chuông thông báo ca chờ */}
          <div className="dropdown position-relative">
            <button 
              className="btn btn-light position-relative p-2 border-0 text-secondary"
              style={{ width: '38px', height: '38px', borderRadius: '50%' }}
              title="Thông báo hàng đợi"
            >
              <i className="bi bi-bell-fill fs-5"></i>
              {waitingCount > 0 && (
                <span 
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '10px' }}
                >
                  {waitingCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile Bác sĩ */}
          <div className="d-flex align-items-center ps-2 border-start">
            <div 
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{ 
                width: '38px', 
                height: '38px', 
                background: 'linear-gradient(135deg, #175cdd, #10b981)',
                fontSize: '14px'
              }}
            >
              BS
            </div>
            <div className="d-none d-sm-flex flex-column text-start ms-2 me-2">
              <span className="fw-bold text-dark text-truncate" style={{ fontSize: '13.5px', maxWidth: '160px' }}>
                {doctorName}
              </span>
              <span className="text-muted" style={{ fontSize: '11px' }}>
                {doctorDepartment}
              </span>
            </div>

            {/* Nút Đăng Xuất Nhanh */}
            <button 
              onClick={handleLogout}
              className="btn btn-sm btn-outline-danger ms-1 d-flex align-items-center p-1 px-2"
              style={{ borderRadius: '6px', fontSize: '12px' }}
              title="Đăng xuất khỏi phiên làm việc"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              <span className="d-none d-md-inline">Thoát</span>
            </button>
          </div>

        </div>
      </header>

      {/* ================= KHUNG NỘI DUNG CHÍNH (SIDEBAR + CONTENT) ================= */}
      <div className="doctor-body-container">
        
        {/* SIDEBAR DESKTOP */}
        <aside className={`doctor-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
          {/* Card Bác sĩ thu nhỏ ở đầu Sidebar */}
          {sidebarOpen ? (
            <div className="p-3 border-bottom bg-light-subtle">
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                  style={{ width: '42px', height: '42px' }}
                >
                  <i className="bi bi-person-badge fs-4"></i>
                </div>
                <div className="overflow-hidden">
                  <div className="fw-bold text-dark text-truncate" style={{ fontSize: '13.5px' }}>
                    {doctorName}
                  </div>
                  <div className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0" style={{ fontSize: '10.5px' }}>
                    <i className="bi bi-check-circle-fill me-1"></i> Đang trực khám
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-3 text-center border-bottom" title={doctorName}>
              <i className="bi bi-person-badge fs-4 text-primary"></i>
            </div>
          )}

          {/* Danh Sách Menu Nghiệp Vụ */}
          <nav className="doctor-sidebar-nav">
            <div className="text-uppercase text-muted px-2 py-1 fw-bold" style={{ fontSize: '10.5px', letterSpacing: '0.6px', display: sidebarOpen ? 'block' : 'none' }}>
              Nghiệp Vụ Khám Bệnh
            </div>
            {doctorNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `doctor-nav-link ${isActive ? 'active' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <i className={`bi ${item.icon} fs-5 ${sidebarOpen ? 'me-3' : 'mx-auto'}`}></i>
                {sidebarOpen && (
                  <span className="flex-grow-1 text-truncate">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <span className={`badge ${item.badgeColor} ms-auto`} style={{ fontSize: '11px' }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Chân Sidebar */}
          <div className="p-2 border-top bg-light">
            <Link 
              to="/" 
              className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center py-2"
              style={{ fontSize: '12.5px', borderRadius: '6px' }}
            >
              <i className={`bi bi-house-door ${sidebarOpen ? 'me-2' : ''}`}></i>
              {sidebarOpen && <span>Về Trang Chủ</span>}
            </Link>
          </div>
        </aside>

        {/* SIDEBAR DRAWER DÀNH CHO MOBILE / TABLET (< 992px) */}
        {mobileDrawerOpen && (
          <div 
            className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1050 }}
            onClick={() => setMobileDrawerOpen(false)}
          >
            <div 
              className="bg-white h-100 d-flex flex-column shadow-lg"
              style={{ width: '280px', maxWidth: '85%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white text-dark">
                <div className="d-flex align-items-center gap-2">
                  <img src={logo} alt="Logo" style={{ width: '34px', height: '34px', borderRadius: '4px' }} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: '14px', lineHeight: '1.2' }}>
                      <span style={{ color: '#1f60d0' }}>Phú Lợi</span>{' '}
                      <span style={{ color: '#18a94f' }}>Bảo</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '10.5px' }}>Phân Hệ Bác Sĩ</div>
                  </div>
                </div>
                <button 
                  className="btn btn-sm btn-close" 
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* Thông tin bác sĩ */}
              <div className="p-3 border-bottom bg-light">
                <div className="fw-bold text-dark">{doctorName}</div>
                <div className="text-muted small">{doctorDepartment}</div>
                <div className="text-primary small fw-semibold mt-1">
                  <i className="bi bi-geo-alt-fill me-1 text-danger"></i> {clinicRoom}
                </div>
              </div>

              {/* Navigation list */}
              <nav className="p-2 flex-grow-1 overflow-auto">
                <div className="d-flex flex-column gap-1">
                  {doctorNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={({ isActive }) => `doctor-nav-link ${isActive ? 'active' : ''}`}
                    >
                      <i className={`bi ${item.icon} fs-5 me-3`}></i>
                      <span className="flex-grow-1">{item.label}</span>
                      {item.badge && (
                        <span className={`badge ${item.badgeColor} ms-auto`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </nav>

              <div className="p-3 border-top d-flex flex-column gap-2">
                <Link 
                  to="/" 
                  className="btn btn-outline-secondary btn-sm w-100"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <i className="bi bi-house-door me-2"></i> Về Trang Chủ
                </Link>
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm w-100"
                >
                  <i className="bi bi-box-arrow-right me-2"></i> Đăng Xuất
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= KHÔNG GIAN NỘI DUNG CHÍNH (MAIN CONTENT) ================= */}
        <main className="doctor-main-content">
          
          {/* Header phụ của từng trang */}
          <div className="doctor-page-header">
            <div>
              <h1 className="h5 fw-bold text-dark mb-0 d-flex align-items-center">
                <i className="bi bi-hospital text-primary me-2"></i>
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted small mb-0 mt-1">{subtitle}</p>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                <i className="bi bi-activity me-1"></i> Phòng khám mở cửa
              </span>
            </div>
          </div>

          {/* Children component nội dung trang */}
          <div className="doctor-page-body">
            {children}
          </div>

        </main>
      </div>

      {/* ================= FOOTER / STATUS BAR CỐ ĐỊNH CHÂN TRANG ================= */}
      <footer className="doctor-statusbar">
        <div className="d-flex align-items-center text-truncate me-2">
          <span className="fw-semibold text-dark me-2">© 2026 Phòng Khám Phú Lợi Bảo</span>
          <span className="d-none d-md-inline text-muted me-2">•</span>
          <span className="d-none d-md-inline">
            <i className="bi bi-telephone-inbound text-primary me-1"></i> Hotline nội bộ: <strong>102</strong> (Tiếp đón) - <strong>105</strong> (Kho Dược)
          </span>
        </div>

        <div className="d-flex align-items-center gap-3 flex-shrink-0">
          <span className="d-none d-sm-inline badge bg-light text-secondary border">
            HIS v2.4.0 • Doctor Edition
          </span>
          <span className="text-success fw-semibold d-flex align-items-center">
            <span className="spinner-grow spinner-grow-sm text-success me-1" style={{ width: '8px', height: '8px' }}></span>
            <span className="d-none d-sm-inline">Máy chủ kết nối: </span> Bàn khám 102
          </span>
        </div>
      </footer>

    </div>
  )
}
