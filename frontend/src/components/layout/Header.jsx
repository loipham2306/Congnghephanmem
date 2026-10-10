import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.jpg'

export default function Header() {
  const { user, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileNavOpen(false)
    setUserMenuOpen(false)
  }, [location])

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header id="header" className={`header fixed-top ${scrolled ? 'scrolled' : ''}`}>
      {/* Top Bar */}
      <div className="topbar d-flex align-items-center dark-background">
        <div className="container">
          <div className="topbar-inner">
            <div className="contact-info d-flex align-items-center">
              <i className="bi bi-envelope d-flex align-items-center">
                <a href="mailto:lienhe@phongkham.vn">lienhe@phongkham.vn</a>
              </i>
              <i className="bi bi-phone d-flex align-items-center ms-4">
                <span>+84 28 3838 9999</span>
              </i>
            </div>
            <div className="social-links d-none d-md-flex align-items-center">
              <a href="#!" className="twitter" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#!" className="facebook" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#!" className="instagram" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="#!" className="linkedin" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>

      {/* Branding & Nav */}
      <div className="branding d-flex align-items-center">
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="logo d-flex align-items-center" aria-label="Trang chủ">
              <img src={logo} alt="Logo Phòng Khám Phú Lợi Bảo" className="brand-logo" />
              <div className="brand-text">
                <span className="brand-title-top">Phòng Khám</span>
                <span className="brand-title-bottom">
                  <span className="brand-blue">Phú Lợi</span>
                  <span className="brand-space" aria-hidden="true"> </span>
                  <span className="brand-green">Bảo</span>
                </span>
                <span className="brand-slogan">Tận tâm • Uy tín • Trách nhiệm</span>
              </div>
            </Link>

            <nav id="navmenu" className={`navmenu ${mobileNavOpen ? 'active' : ''}`}>
              <ul>
                <li>
                  <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                    Trang Chủ
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/gioi-thieu" className={({ isActive }) => isActive ? 'active' : ''}>
                    Giới Thiệu
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/khoa-phong" className={({ isActive }) => isActive ? 'active' : ''}>
                    Khoa Phòng
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dich-vu" className={({ isActive }) => isActive ? 'active' : ''}>
                    Dịch Vụ
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bac-si" className={({ isActive }) => isActive ? 'active' : ''}>
                    Bác Sĩ
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dat-lich-kham" className={({ isActive }) => isActive ? 'active' : ''}>
                    Đặt Lịch Khám
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/lien-he" className={({ isActive }) => isActive ? 'active' : ''}>
                    Liên Hệ
                  </NavLink>
                </li>

                {user ? (
                  <li className="position-relative ms-2 user-dropdown-container" ref={userMenuRef}>
                    <button
                      type="button"
                      className="btn-user-trigger d-flex align-items-center"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      aria-expanded={userMenuOpen}
                      title="Tài khoản cá nhân"
                    >
                      <div className="user-avatar-badge">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="d-flex flex-column text-start ms-2 me-1 user-name-box d-none d-sm-flex">
                        <span className="user-display-name text-truncate">
                          {user.fullName || 'Tài khoản'}
                        </span>
                        <span className="user-role-label">
                          {user.role === 'ADMIN' ? 'Quản Trị Viên' : user.role === 'DOCTOR' ? 'Bác Sĩ' : 'Bệnh Nhân'}
                        </span>
                      </div>
                      <i className={`bi bi-chevron-down ms-1 dropdown-chevron ${userMenuOpen ? 'open' : ''}`}></i>
                    </button>

                    {/* Dropdown Menu Box */}
                    {userMenuOpen && (
                      <div className="pk-user-dropdown-menu shadow-lg">
                        {/* Header Inside Dropdown */}
                        <div className="dropdown-user-header">
                          <div className="dropdown-user-header-inner">
                            <div className="user-avatar-lg">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="dropdown-user-info">
                              <h4 className="dropdown-user-name">
                                {user.fullName || 'Người Dùng'}
                              </h4>
                              <p className="dropdown-user-email">
                                {user.email}
                              </p>
                              <div style={{ marginTop: '4px' }}>
                                <span
                                  className={`pk-portal-badge ${
                                    user.role === 'ADMIN'
                                      ? 'pk-portal-badge-danger'
                                      : user.role === 'DOCTOR'
                                      ? 'pk-portal-badge-success'
                                      : 'pk-portal-badge-primary'
                                  }`}
                                  style={{ fontSize: '11px', padding: '2px 8px' }}
                                >
                                  <i className={`bi ${user.role === 'ADMIN' ? 'bi-shield-lock-fill' : user.role === 'DOCTOR' ? 'bi-heart-pulse-fill' : 'bi-person-check-fill'}`} style={{ marginRight: '4px' }}></i>
                                  {user.role === 'ADMIN' ? 'Quản Trị Viên' : user.role === 'DOCTOR' ? 'Bác Sĩ' : 'Bệnh Nhân'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Menu Items */}
                        <div className="dropdown-user-body">
                          <Link
                            to="/ho-so-ca-nhan?tab=records"
                            className="dropdown-user-item text-decoration-none"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="icon-wrapper text-primary bg-primary-subtle">
                              <i className="bi bi-journal-medical"></i>
                            </div>
                            <div style={{ marginLeft: '12px' }}>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                Sổ Khám & Bệnh Án
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                Theo dõi lịch sử khám bệnh
                              </div>
                            </div>
                          </Link>

                          <Link
                            to="/ho-so-ca-nhan?tab=appointments"
                            className="dropdown-user-item text-decoration-none"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="icon-wrapper text-success bg-success-subtle">
                              <i className="bi bi-calendar-check"></i>
                            </div>
                            <div style={{ marginLeft: '12px' }}>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                Lịch Hẹn Của Tôi
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                Tra cứu & quản lý lịch khám
                              </div>
                            </div>
                          </Link>

                          <Link
                            to="/ho-so-ca-nhan?tab=prescriptions"
                            className="dropdown-user-item text-decoration-none"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="icon-wrapper text-info bg-info-subtle">
                              <i className="bi bi-capsule"></i>
                            </div>
                            <div style={{ marginLeft: '12px' }}>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                Đơn Thuốc Điện Tử
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                Toa thuốc & hướng dẫn liều dùng
                              </div>
                            </div>
                          </Link>

                          <Link
                            to="/ho-so-ca-nhan?tab=profile"
                            className="dropdown-user-item text-decoration-none"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="icon-wrapper text-secondary bg-secondary-subtle">
                              <i className="bi bi-gear"></i>
                            </div>
                            <div style={{ marginLeft: '12px' }}>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                Cài Đặt Hồ Sơ Y Tế
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                Nhóm máu, dị ứng & liên hệ
                              </div>
                            </div>
                          </Link>

                          {user.role === 'DOCTOR' && (
                            <>
                              <div className="dropdown-divider"></div>
                              <Link
                                to="/doctor/ban-kham"
                                className="dropdown-user-item text-decoration-none"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="icon-wrapper text-success bg-success-subtle">
                                  <i className="bi bi-heart-pulse-fill"></i>
                                </div>
                                <div style={{ marginLeft: '12px' }}>
                                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                    Cổng Bác Sĩ & Bàn Khám
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                    Tiếp nhận, chẩn đoán & kê đơn
                                  </div>
                                </div>
                              </Link>
                            </>
                          )}

                          {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                            <>
                              <div className="dropdown-divider"></div>
                              <Link
                                to="/dashboard"
                                className="dropdown-user-item text-decoration-none"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="icon-wrapper text-danger bg-danger-subtle">
                                  <i className="bi bi-speedometer2"></i>
                                </div>
                                <div style={{ marginLeft: '12px' }}>
                                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', lineHeight: '1.3' }}>
                                    Cổng Quản Trị Hệ Thống
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                    Quản lý phòng khám & bệnh nhân
                                  </div>
                                </div>
                              </Link>
                            </>
                          )}
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Logout Button */}
                        <div className="dropdown-logout-wrapper">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false)
                              logout()
                            }}
                            className="btn-dropdown-logout"
                          >
                            <i className="bi bi-box-arrow-right" style={{ fontSize: '16px' }}></i>
                            <span>Đăng Xuất</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ) : (
                  <li>
                    <NavLink
                      to="/login"
                      className="btn-getstarted d-inline-block ms-2 text-white text-decoration-none"
                      style={{ background: '#1977cc', padding: '7px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: '600' }}
                    >
                      <i className="bi bi-person me-1"></i> Đăng Nhập
                    </NavLink>
                  </li>
                )}
              </ul>
            </nav>

            <button
              className="mobile-nav-toggle d-xl-none bi bi-list"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle navigation"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
