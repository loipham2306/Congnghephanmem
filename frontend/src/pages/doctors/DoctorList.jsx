import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import DoctorCard from '../../components/doctor/DoctorCard'
import DoctorFilter from '../../components/doctor/DoctorFilter'
import doctorService from '../../services/doctorService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function DoctorList() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('')

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

  const departments = Array.from(new Set(doctors.map(d => d.department))).filter(Boolean)

  const filtered = doctors.filter(d => {
    const matchName = d.name?.toLowerCase().includes(search.toLowerCase()) || d.title?.toLowerCase().includes(search.toLowerCase())
    const matchDept = selectedDept ? d.department === selectedDept : true
    return matchName && matchDept
  })

  return (
    <AdminLayout title="Quản Lý Đội Ngũ Bác Sĩ">
      <DoctorFilter 
        departments={departments}
        selectedDept={selectedDept}
        onSelectDept={setSelectedDept}
        search={search}
        onSearchChange={setSearch}
      />

      {loading ? (
        <LoadingSpinner text="Đang tải danh sách bác sĩ..." />
      ) : (
        <div className="row g-4">
          {filtered.map(doc => (
            <div key={doc.id} className="col-12 col-md-6 col-xl-4">
              <DoctorCard doctor={doc} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm.
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
