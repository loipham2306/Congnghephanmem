import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import doctorService from '../../services/doctorService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import '../../components/layout/admin.css'

export default function DoctorList() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [toastMsg, setToastMsg] = useState('')
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const modalBodyRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    title: 'Bác sĩ chuyên khoa',
    department: 'Khoa Tim Mạch',
    experience: '5+ năm',
    phone: '',
    bio: '',
    status: 'ACTIVE'
  })

  useEffect(() => {
    async function load() {
      try {
        const data = await doctorService.getAll()
        setDoctors(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Khóa cuộn trang nền khi mở modal để con lăn cuộn mượt mà bên trong modal
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalOpen])

  const departments = Array.from(new Set(doctors.map(d => d.department))).filter(Boolean)

  const filtered = doctors.filter(d => {
    const matchName = d.name?.toLowerCase().includes(search.toLowerCase()) || 
                      d.title?.toLowerCase().includes(search.toLowerCase())
    const matchDept = selectedDept ? d.department === selectedDept : true
    return matchName && matchDept
  })

  // Mở modal thêm
  const handleOpenAdd = () => {
    setEditingDoctor(null)
    setFormData({
      name: '',
      title: 'Bác sĩ chuyên khoa',
      department: departments[0] || 'Khoa Nội Tổng Quát',
      experience: '5+ năm',
      phone: '0901 000 000',
      bio: 'Nhiều năm kinh nghiệm thăm khám và điều trị chuyên sâu.',
      status: 'ACTIVE'
    })
    setModalOpen(true)
  }

  // Mở modal sửa
  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc)
    setFormData({
      name: doc.name || '',
      title: doc.title || 'Bác sĩ chuyên khoa',
      department: doc.department || 'Khoa Nội Tổng Quát',
      experience: doc.experience || '5+ năm',
      phone: doc.phone || '0901 234 567',
      bio: doc.bio || '',
      status: doc.status || 'ACTIVE'
    })
    setModalOpen(true)
  }

  // Lưu bác sĩ (thêm hoặc sửa)
  const handleSave = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên bác sĩ!')
      return
    }

    if (editingDoctor) {
      setDoctors(prev => prev.map(d => d.id === editingDoctor.id ? { ...d, ...formData } : d))
      setToastMsg('Đã cập nhật thông tin bác sĩ!')
    } else {
      const newDoc = {
        id: Date.now(),
        ...formData,
        rating: 5.0,
        reviewsCount: 0
      }
      setDoctors(prev => [newDoc, ...prev])
      setToastMsg('Đã thêm bác sĩ mới vào hệ thống!')
    }
    setModalOpen(false)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Xóa bác sĩ
  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này khỏi danh sách quản lý?')) {
      setDoctors(prev => prev.filter(d => d.id !== id))
      setToastMsg('Đã xóa bác sĩ khỏi hệ thống!')
      setTimeout(() => setToastMsg(''), 3000)
    }
  }

  return (
    <AdminLayout title="Quản Lý Đội Ngũ Bác Sĩ">
      {/* 1. Header Toolbar Quản Trị & Nút Thêm Bác Sĩ To Hơn */}
      <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Cụm Tìm kiếm & Lọc chuyên khoa */}
            <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1" style={{ maxWidth: '650px' }}>
              <div className="input-group" style={{ minWidth: '220px', flex: 1 }}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0" 
                  placeholder="Tìm theo tên bác sĩ, học vị, chức danh..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select 
                className="form-select" 
                style={{ width: 'auto', minWidth: '190px' }}
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="">Tất cả chuyên khoa</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Chế độ xem & NÚT THÊM BÁC SĨ TO HƠN */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('grid')}
                  title="Chế độ xem Thẻ Lưới (2 cột/hàng)"
                >
                  <i className="bi bi-grid-fill"></i>
                </button>
                <button 
                  type="button" 
                  className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setViewMode('table')}
                  title="Chế độ xem Danh Sách Bảng"
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>

              {/* NÚT THÊM BÁC SĨ TO HƠN */}
              <button 
                type="button" 
                className="btn btn-primary px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
                onClick={handleOpenAdd}
              >
                <i className="bi bi-person-plus-fill fs-5"></i>
                <span>+ Thêm Bác Sĩ Mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Loading State */}
      {loading ? (
        <div className="card p-4 border-0 shadow-sm rounded-3">
          <LoadingSpinner text="Đang tải danh sách bác sĩ quản trị..." />
        </div>
      ) : (
        <>
          {/* CHẾ ĐỘ 1: DẠNG LƯỚI THẺ CHÍNH XÁC 1 HÀNG 2 BÁC SĨ (CSS GRID 2 COLS) */}
          {viewMode === 'grid' && (
            <div 
              className="ad-doctor-grid-2cols"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '1.25rem',
                width: '100%'
              }}
            >
              {filtered.map(doc => {
                const initialLetter = doc.name ? doc.name.replace(/^(Bác sĩ|BS|ThS|TS|CKI|CKII)\.?\s*/i, '').trim().charAt(0) : 'B'

                return (
                  <div key={doc.id} className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden bg-white hover-shadow transition-all">
                    <div className="card-body p-4 d-flex flex-column">
                      
                      {/* Hàng 1: Avatar, Tên bác sĩ đầy đủ, Khoa phòng, Trạng thái */}
                      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                        <div className="d-flex align-items-center gap-3 min-w-0">
                          {doc.image ? (
                            <img 
                              src={doc.image} 
                              alt={doc.name} 
                              className="rounded-circle object-fit-cover border shadow-sm flex-shrink-0" 
                              style={{ width: '64px', height: '64px' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold fs-3 border border-primary-subtle shadow-sm flex-shrink-0"
                              style={{ width: '64px', height: '64px' }}
                            >
                              {initialLetter}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h3 className="fs-5 fw-bold mb-1 text-dark text-break">
                              {doc.name}
                            </h3>
                            <span className="text-primary fw-medium small d-block">
                              <i className="bi bi-award me-1"></i>{doc.title || 'Bác sĩ chuyên khoa'}
                            </span>
                          </div>
                        </div>

                        <div className="text-end flex-shrink-0">
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 mb-1 d-block" style={{ fontSize: '11.5px' }}>
                            {doc.department || 'Đa Khoa'}
                          </span>
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0" style={{ fontSize: '10.5px' }}>
                            <i className="bi bi-circle-fill me-1" style={{ fontSize: '7px' }}></i>Đang công tác
                          </span>
                        </div>
                      </div>

                      {/* Hàng 2: Mô tả / tiểu sử chuyên môn */}
                      <p className="small text-muted mb-3 flex-grow-1" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        {doc.bio || 'Chuyên gia đầu ngành giàu kinh nghiệm khám, chẩn đoán và điều trị tại phòng khám.'}
                      </p>

                      {/* Hàng 3: Dải thông số chi tiết */}
                      <div className="p-2 px-3 bg-light rounded-3 border d-flex flex-wrap justify-content-between align-items-center small text-secondary mb-3" style={{ fontSize: '12px' }}>
                        <span>
                          <i className="bi bi-clock-history me-1 text-primary"></i>
                          Kinh nghiệm: <strong>{doc.experience || '8+ năm'}</strong>
                        </span>
                        <span>
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          Đánh giá: <strong>{doc.rating || '4.9'}</strong> ({doc.reviewsCount || 120}+ lượt)
                        </span>
                        <span>
                          <i className="bi bi-telephone me-1 text-success"></i>
                          {doc.phone || '0901 234 567'}
                        </span>
                      </div>

                      {/* Hàng 4: Nút thao tác quản trị */}
                      <div className="d-flex gap-2 pt-2 border-top">
                        <button 
                          className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center py-2"
                          onClick={() => handleOpenEdit(doc)}
                        >
                          <i className="bi bi-pencil-square me-1"></i> Chỉnh Sửa Thông Tin
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center justify-content-center"
                          onClick={() => handleDelete(doc.id)}
                          title="Xóa bác sĩ"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* CHẾ ĐỘ 2: DẠNG BẢNG QUẢN LÝ (TABLE VIEW) */}
          {viewMode === 'table' && (
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '13.5px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '60px' }} className="text-center">Avatar</th>
                      <th>Họ và Tên Bác Sĩ</th>
                      <th>Chức Danh & Học Vị</th>
                      <th>Chuyên Khoa</th>
                      <th>Kinh Nghiệm</th>
                      <th>Số Điện Thoại</th>
                      <th>Đánh Giá</th>
                      <th>Trạng Thái</th>
                      <th className="text-end" style={{ width: '130px' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(doc => {
                      const initialLetter = doc.name ? doc.name.replace(/^(Bác sĩ|BS|ThS|TS|CKI|CKII)\.?\s*/i, '').trim().charAt(0) : 'B'

                      return (
                        <tr key={doc.id}>
                          <td className="text-center">
                            {doc.image ? (
                              <img 
                                src={doc.image} 
                                alt={doc.name} 
                                className="rounded-circle object-fit-cover border" 
                                style={{ width: '42px', height: '42px' }}
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center fw-bold"
                                style={{ width: '42px', height: '42px', fontSize: '15px' }}
                              >
                                {initialLetter}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong className="text-dark d-block fs-6">{doc.name}</strong>
                            <span className="text-muted small">Mã BS: BS-0{doc.id}</span>
                          </td>
                          <td>{doc.title || 'Bác sĩ chuyên khoa'}</td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                              {doc.department || 'Đa Khoa'}
                            </span>
                          </td>
                          <td>{doc.experience || '8+ năm'}</td>
                          <td>{doc.phone || '0901 234 567'}</td>
                          <td>
                            <span className="text-warning"><i className="bi bi-star-fill me-1"></i>{doc.rating || '4.9'}</span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              Đang công tác
                            </span>
                          </td>
                          <td className="text-end">
                            <button 
                              className="btn btn-sm btn-outline-primary me-1 py-1 px-2"
                              onClick={() => handleOpenEdit(doc)}
                              title="Chỉnh sửa"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              onClick={() => handleDelete(doc.id)}
                              title="Xóa"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="card p-5 text-center text-muted border-0 shadow-sm rounded-3 bg-white">
              <i className="bi bi-person-x fs-1 d-block mb-2 text-secondary"></i>
              <span>Không tìm thấy bác sĩ phù hợp với tiêu chí lọc</span>
            </div>
          )}
        </>
      )}

      {/* 3. MODAL THÊM / SỬA BÁC SĨ - NỀN TIÊU ĐỀ XANH & CON LĂN CUỘN MƯỢT MÀ */}
      {modalOpen && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(2px)' }}
          onWheel={(e) => {
            if (modalBodyRef.current && !modalBodyRef.current.contains(e.target)) {
              modalBodyRef.current.scrollTop += e.deltaY
            }
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxHeight: '90vh' }}>
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden d-flex flex-column" style={{ maxHeight: '90vh' }}>
              
              {/* NỀN TIÊU ĐỀ MÀU XANH ĐỒNG BỘ */}
              <div 
                className="modal-header py-3 px-4 text-white border-0 flex-shrink-0"
                style={{ 
                  background: 'linear-gradient(135deg, #1e40af 0%, #175cdd 100%)'
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <i className="bi bi-person-plus-fill fs-5 text-white"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-white mb-0" style={{ fontSize: '1.05rem' }}>
                      {editingDoctor ? 'Chỉnh Sửa Thông Tin Bác Sĩ' : 'Tiếp Nhận & Thêm Bác Sĩ Mới'}
                    </h5>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
                      Phòng Khám Đa Khoa Phú Lợi Bảo • Quản trị nhân sự y tế
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setModalOpen(false)}
                  aria-label="Đóng"
                ></button>
              </div>

              {/* THÂN MODAL VỚI CON LĂN CUỘN MƯỢT MÀ (KHÔNG BỊ KẸT) */}
              <form onSubmit={handleSave} className="d-flex flex-column flex-grow-1 m-0" style={{ minHeight: 0, overflow: 'hidden' }}>
                <div 
                  ref={modalBodyRef}
                  className="modal-body p-4 bg-white ad-modal-scrollable-body" 
                  style={{ 
                    overflowY: 'auto', 
                    maxHeight: 'calc(90vh - 135px)',
                    flex: '1 1 auto',
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  
                  {/* Khối 1: Thông tin cơ bản */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                      <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-person-badge fs-6"></i>
                      </div>
                      <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                        1. Thông Tin Nhận Diện Bác Sĩ
                      </span>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label small fw-semibold text-secondary">
                          Họ và tên bác sĩ <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            <i className="bi bi-person"></i>
                          </span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Ví dụ: BS. CKII. Nguyễn Văn A"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-secondary">Số điện thoại liên hệ</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            <i className="bi bi-telephone"></i>
                          </span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="0901 234 567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Khối 2: Chuyên môn & Học vị */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                      <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-mortarboard fs-6"></i>
                      </div>
                      <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                        2. Chuyên Khoa & Học Vị
                      </span>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-secondary">Học vị / Chức vụ</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            <i className="bi bi-award"></i>
                          </span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Trưởng khoa / Bác sĩ chuyên khoa..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-secondary">Chuyên khoa trực thuộc</label>
                        <select 
                          className="form-select form-select-sm"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                          <option value="Khoa Tim Mạch">Khoa Tim Mạch</option>
                          <option value="Khoa Nhi">Khoa Nhi & Tai Mũi Họng</option>
                          <option value="Khoa Thần Kinh">Khoa Thần Kinh</option>
                          <option value="Khoa Mắt">Khoa Mắt</option>
                          <option value="Khoa Răng Hàm Mặt">Khoa Răng Hàm Mặt</option>
                          <option value="Khoa Nội Tổng Quát">Khoa Nội Tổng Quát</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold text-secondary">Kinh nghiệm công tác</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            <i className="bi bi-clock-history"></i>
                          </span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Ví dụ: 10+ năm"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Khối 3: Tiểu sử & Giới thiệu */}
                  <div className="mb-2">
                    <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                      <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                        <i className="bi bi-card-text fs-6"></i>
                      </div>
                      <span className="fw-bold text-dark text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                        3. Tiểu Sử & Mô Tả Chuyên Môn
                      </span>
                    </div>

                    <div>
                      <textarea 
                        className="form-control form-control-sm" 
                        rows="3"
                        placeholder="Mô tả quá trình đào tạo, chứng chỉ hành nghề, bệnh viện công tác trước đây..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                </div>

                <div className="modal-footer p-3 bg-light border-top flex-shrink-0">
                  <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={() => setModalOpen(false)}>
                    Hủy Bỏ
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 d-flex align-items-center">
                    <i className="bi bi-check2-circle me-1"></i>
                    {editingDoctor ? 'Cập Nhật Thông Tin' : 'Lưu Bác Sĩ Mới'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Toast Thông Báo */}
      {toastMsg && (
        <div 
          className="position-fixed bottom-0 end-0 m-3 p-3 bg-dark text-white rounded-3 shadow"
          style={{ zIndex: 3000, fontSize: '13.5px' }}
        >
          <i className="bi bi-check-circle-fill text-success me-2 fs-5"></i>
          {toastMsg}
        </div>
      )}
    </AdminLayout>
  )
}
