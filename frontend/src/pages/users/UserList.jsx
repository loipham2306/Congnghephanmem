import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'

const mockUsers = [
  { id: 1, name: 'Nguyễn Quản Trị', email: 'admin@phongkham.vn', role: 'ADMIN', status: 'ACTIVE', lastLogin: '2026-10-05 14:00' },
  { id: 2, name: 'BS. Trần Văn Hùng', email: 'hung.tran@phongkham.vn', role: 'DOCTOR', status: 'ACTIVE', lastLogin: '2026-10-05 08:30' },
  { id: 3, name: 'BS. Nguyễn Thị Lan', email: 'lan.nguyen@phongkham.vn', role: 'DOCTOR', status: 'ACTIVE', lastLogin: '2026-10-04 16:45' },
  { id: 4, name: 'Lê Thu Trang (Tiếp tân)', email: 'trang.le@phongkham.vn', role: 'STAFF', status: 'ACTIVE', lastLogin: '2026-10-05 13:10' },
  { id: 5, name: 'Phạm Minh (Dược sĩ)', email: 'minh.pham@phongkham.vn', role: 'STAFF', status: 'ACTIVE', lastLogin: '2026-10-04 17:00' }
]

export default function UserList() {
  const [users] = useState(mockUsers)
  const [search, setSearch] = useState('')

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  const roleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <span className="badge bg-danger">Quản Trị Viên</span>
      case 'DOCTOR': return <span className="badge bg-primary">Bác Sĩ</span>
      case 'STAFF': return <span className="badge bg-info">Nhân Viên</span>
      default: return <span className="badge bg-secondary">Bệnh Nhân</span>
    }
  }

  return (
    <AdminLayout title="Quản Trị Người Dùng & Phân Quyền">
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="input-group" style={{ maxWidth: '400px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Tìm theo tên, email, vai trò..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-primary rounded-pill px-4"
              onClick={() => alert('Chức năng thêm tài khoản mới')}
            >
              <i className="bi bi-person-plus me-2"></i> Thêm Tài Khoản Mới
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                  <th>Đăng Nhập Gần Nhất</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td className="fw-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        {u.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td>{u.lastLogin}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary me-1" title="Đổi mật khẩu">
                        <i className="bi bi-key"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" title="Khóa tài khoản">
                        <i className="bi bi-lock"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
