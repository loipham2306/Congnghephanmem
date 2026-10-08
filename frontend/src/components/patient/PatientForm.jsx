import { useState, useEffect } from 'react'

export default function PatientForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'Nam',
    birthYear: '1995',
    address: '',
    bloodGroup: 'O+',
    allergies: '',
    notes: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Họ và Tên *</label>
          <input 
            type="text" 
            className="form-control" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
            required 
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Số Điện Thoại *</label>
          <input 
            type="tel" 
            className="form-control" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
            placeholder="0912 345 678"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Email</label>
          <input 
            type="email" 
            className="form-control" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="email@example.com"
          />
        </div>

        <div className="col-md-3">
          <label className="form-label fw-semibold">Giới Tính</label>
          <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label fw-semibold">Năm Sinh</label>
          <input 
            type="number" 
            className="form-control" 
            name="birthYear" 
            value={formData.birthYear} 
            onChange={handleChange} 
            min="1900" 
            max="2026"
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Địa Chỉ</label>
          <input 
            type="text" 
            className="form-control" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Nhóm Máu</label>
          <select className="form-select" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Tiền Sử Dị Ứng</label>
          <input 
            type="text" 
            className="form-control" 
            name="allergies" 
            value={formData.allergies} 
            onChange={handleChange} 
            placeholder="Dị ứng thuốc, thức ăn..."
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Ghi Chú Y Tế</label>
          <textarea 
            className="form-control" 
            name="notes" 
            rows="2" 
            value={formData.notes} 
            onChange={handleChange}
          ></textarea>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        {onCancel && (
          <button type="button" className="btn btn-light" onClick={onCancel}>
            Hủy Bỏ
          </button>
        )}
        <button type="submit" className="btn btn-primary px-4">
          {initialData ? 'Cập Nhật' : 'Lưu Bệnh Nhân'}
        </button>
      </div>
    </form>
  )
}
