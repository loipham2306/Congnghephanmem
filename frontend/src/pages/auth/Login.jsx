import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.jpg'

export default function Login() {
  const [email, setEmail] = useState('admin@phongkham.vn')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res?.user?.role === 'PATIENT') {
        navigate('/ho-so-ca-nhan')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác!')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (quickEmail) => {
    setEmail(quickEmail)
    setPassword('123456')
  }

  return (
    <div className="pk-auth-wrapper">
      <div className="pk-auth-card">
        {/* Header với Logo & Thương hiệu Phú Lợi Bảo */}
        <div className="pk-auth-header">
          <Link to="/" className="pk-auth-logo-link" title="Quay lại trang chủ">
            <img src={logo} alt="Logo Phòng Khám Phú Lợi Bảo" className="pk-auth-logo-img" />
            <span className="pk-auth-brand-top">Phòng Khám</span>
            <div className="pk-auth-brand-name">
              <span className="pk-auth-blue">Phú Lợi</span>
              <span className="pk-auth-green">Bảo</span>
            </div>
            <span className="pk-auth-brand-slogan">Tận tâm • Uy tín • Trách nhiệm</span>
          </Link>

          <div className="pk-auth-divider"></div>

          <h2 className="pk-auth-title">Đăng Nhập</h2>
          <p className="pk-auth-subtitle">Hệ thống Quản lý Y tế & Đặt lịch khám thông minh</p>
        </div>

        {error && (
          <div className="pk-auth-alert pk-alert-error">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pk-auth-form">
          <div className="pk-form-group">
            <label className="pk-label">Email / Tên đăng nhập</label>
            <div className="pk-input-box">
              <span className="pk-input-icon"><i className="bi bi-envelope"></i></span>
              <input
                type="email"
                className="pk-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@phongkham.vn"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="pk-form-group">
            <label className="pk-label">Mật khẩu</label>
            <div className="pk-input-box">
              <span className="pk-input-icon"><i className="bi bi-shield-lock"></i></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="pk-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pk-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Ẩn hiện mật khẩu"
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="pk-options-row">
            <label className="pk-checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a
              href="#!"
              className="pk-forgot-link"
              onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ hotline 028 3838 9999 để được hỗ trợ cấp lại mật khẩu!'); }}
            >
              Quên mật khẩu?
            </a>
          </div>

          <button type="submit" className="pk-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Nút đăng nhập thử nhanh */}
        <div className="pk-quick-demo">
          <span className="pk-quick-label">Tài khoản dùng thử (Bấm để điền):</span>
          <div className="pk-quick-btns">
            <button type="button" className="pk-quick-btn" onClick={() => handleQuickLogin('admin@phongkham.vn')}>
              Quản trị viên
            </button>
            <button type="button" className="pk-quick-btn" onClick={() => handleQuickLogin('bacsi@phongkham.vn')}>
              Bác sĩ
            </button>
            <button type="button" className="pk-quick-btn" onClick={() => handleQuickLogin('benhnhan@gmail.com')}>
              Bệnh nhân
            </button>
          </div>
        </div>

        <div className="pk-auth-switch">
          <span>Chưa có tài khoản?</span>
          <Link to="/register" className="pk-switch-link">Đăng ký tài khoản ngay</Link>
        </div>

        <Link to="/" className="pk-back-home">
          <i className="bi bi-arrow-left"></i>
          <span>Trở về Trang chủ phòng khám</span>
        </Link>
      </div>
    </div>
  )
}
