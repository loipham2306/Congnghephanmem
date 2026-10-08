import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import PatientTable from '../../components/patient/PatientTable'
import PatientForm from '../../components/patient/PatientForm'
import usePatients from '../../hooks/usePatients'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function PatientList() {
  const { patients, loading, addPatient, deletePatient } = usePatients()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  const filteredPatients = patients.filter(p => 
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreatePatient = async (data) => {
    await addPatient(data)
    setShowModal(false)
  }

  return (
    <AdminLayout title="Quản Lý Hồ Sơ Bệnh Nhân">
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
                placeholder="Tìm theo tên, SĐT, mã bệnh nhân..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              className="btn btn-primary rounded-pill px-4 d-flex align-items-center justify-content-center"
              onClick={() => { setSelectedPatient(null); setShowModal(true) }}
            >
              <i className="bi bi-person-plus me-2"></i> Thêm Bệnh Nhân Mới
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner text="Đang tải danh sách bệnh nhân..." />
          ) : (
            <PatientTable 
              patients={filteredPatients}
              onDelete={deletePatient}
              onView={(p) => alert(`Chi tiết bệnh nhân: ${p.fullName} - SĐT: ${p.phone} - Nhóm máu: ${p.bloodGroup || 'O+'}`)}
              onEdit={(p) => { setSelectedPatient(p); setShowModal(true) }}
            />
          )}
        </div>
      </div>

      {/* Add / Edit Patient Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {selectedPatient ? 'Chỉnh Sửa Thông Tin Bệnh Nhân' : 'Tiếp Nhận Bệnh Nhân Mới'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <PatientForm 
                  initialData={selectedPatient}
                  onSubmit={handleCreatePatient}
                  onCancel={() => setShowModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
