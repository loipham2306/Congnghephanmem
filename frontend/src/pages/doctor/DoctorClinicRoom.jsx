import { useState } from 'react'
import DoctorLayout from '../../components/layout/DoctorLayout'
import './doctor.css'

const INITIAL_QUEUE = [
  {
    id: 1,
    stt: '01',
    patientCode: 'BN001',
    name: 'Nguyễn Văn An',
    age: 65,
    gender: 'Nam',
    phone: '0901 234 567',
    address: 'Quận 5, TP.HCM',
    insurance: 'BHYT-DN4791234567890',
    allergies: 'Dị ứng thuốc Penicillin & NSAIDs',
    vitalSigns: { bp: '135/85', pulse: 78, temp: 36.8, spo2: 98, weight: 68, height: 168 },
    reason: 'Đau tức ngực nhẹ, thỉnh thoảng hồi hộp đánh trống ngực',
    status: 'IN_PROGRESS',
    registeredTime: '07:45',
    diagnosedHistory: 'Tăng huyết áp vô căn (2 năm), Rối loạn mỡ máu'
  },
  {
    id: 2,
    stt: '02',
    patientCode: 'BN002',
    name: 'Trần Thị Mai',
    age: 32,
    gender: 'Nữ',
    phone: '0912 345 678',
    address: 'Quận 10, TP.HCM',
    insurance: 'BHYT-GD4799876543210',
    allergies: 'Không có tiền sử dị ứng',
    vitalSigns: { bp: '110/70', pulse: 82, temp: 37.5, spo2: 99, weight: 52, height: 158 },
    reason: 'Ho kéo dài 3 ngày, rát họng, khàn tiếng',
    status: 'WAITING',
    registeredTime: '08:05',
    diagnosedHistory: 'Viêm họng hạt cấp tính'
  },
  {
    id: 3,
    stt: '03',
    patientCode: 'BN003',
    name: 'Lê Hoàng Long',
    age: 45,
    gender: 'Nam',
    phone: '0987 654 321',
    address: 'Bình Thạnh, TP.HCM',
    insurance: 'Khám Dịch Vụ',
    allergies: 'Dị ứng phấn hoa',
    vitalSigns: { bp: '120/80', pulse: 75, temp: 36.5, spo2: 98, weight: 72, height: 172 },
    reason: 'Đau đầu âm ỉ vùng chẩm, chóng mặt khi thức dậy',
    status: 'WAITING',
    registeredTime: '08:20',
    diagnosedHistory: 'Thiểu năng tuần hoàn não'
  },
  {
    id: 4,
    stt: '04',
    patientCode: 'BN004',
    name: 'Phạm Hương Giang',
    age: 28,
    gender: 'Nữ',
    phone: '0933 221 100',
    address: 'Quận 3, TP.HCM',
    insurance: 'BHYT-DN4791122334455',
    allergies: 'Không có',
    vitalSigns: { bp: '105/65', pulse: 80, temp: 36.7, spo2: 99, weight: 48, height: 160 },
    reason: 'Tái khám định kỳ theo lịch hẹn',
    status: 'WAITING',
    registeredTime: '08:40',
    diagnosedHistory: 'Viêm loét dạ dày nhẹ'
  },
  {
    id: 5,
    stt: '05',
    patientCode: 'BN005',
    name: 'Hoàng Minh Tuấn',
    age: 52,
    gender: 'Nam',
    phone: '0978 112 233',
    address: 'Tân Bình, TP.HCM',
    insurance: 'Khám Dịch Vụ',
    allergies: 'Không rõ',
    vitalSigns: { bp: '140/90', pulse: 88, temp: 37.0, spo2: 97, weight: 80, height: 165 },
    reason: 'Khó thở khi gắng sức leo cầu thang',
    status: 'WAITING',
    registeredTime: '09:00',
    diagnosedHistory: 'Bệnh tim thiếu máu cục bộ'
  }
]

const SAMPLE_MEDICINES = [
  { id: 1, name: 'Amlodipine 5mg', unit: 'Viên', defaultDosage: '1 viên/ngày (Sáng sau ăn)', price: 3500 },
  { id: 2, name: 'Losartan 50mg', unit: 'Viên', defaultDosage: '1 viên/ngày (Sáng sau ăn)', price: 5200 },
  { id: 3, name: 'Atorvastatin 20mg', unit: 'Viên', defaultDosage: '1 viên/ngày (Tối trước ngủ)', price: 7800 },
  { id: 4, name: 'Paracetamol 500mg', unit: 'Viên', defaultDosage: '1 viên x 3 lần khi sốt > 38.5 độ', price: 1200 },
  { id: 5, name: 'Amoxicillin 500mg', unit: 'Viên', defaultDosage: '1 viên x 2 lần sau ăn', price: 2800 },
  { id: 6, name: 'Esomeprazole 40mg', unit: 'Viên', defaultDosage: '1 viên/ngày trước ăn sáng 30 phút', price: 8500 }
]

export default function DoctorClinicRoom() {
  const [queue, setQueue] = useState(INITIAL_QUEUE)
  const [selectedPatientId, setSelectedPatientId] = useState(1)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [alertSuccess, setAlertSuccess] = useState('')

  // Dữ liệu bệnh nhân hiện tại
  const currentPatient = queue.find(p => p.id === selectedPatientId) || queue[0]

  // Form State khám bệnh
  const [vitalSigns, setVitalSigns] = useState(currentPatient.vitalSigns)
  const [symptoms, setSymptoms] = useState(currentPatient.reason)
  const [icdCode, setIcdCode] = useState('I10 - Tăng huyết áp vô căn (nguyên phát)')
  const [diagnosis, setDiagnosis] = useState('Tăng huyết áp vô căn độ 1 - Rối loạn lipid máu nhẹ')
  const [advice, setAdvice] = useState('Ăn nhạt, hạn chế mỡ động vật, uống nhiều nước, tập thể dục nhẹ nhàng 30p mỗi ngày.')
  const [followUpDate, setFollowUpDate] = useState('2026-10-24')

  // Đơn thuốc
  const [prescriptionItems, setPrescriptionItems] = useState([
    { id: 1, medicine: 'Amlodipine 5mg', quantity: 14, unit: 'Viên', usage: 'Ngày 1 viên uống buổi sáng sau ăn' },
    { id: 2, medicine: 'Atorvastatin 20mg', quantity: 14, unit: 'Viên', usage: 'Ngày 1 viên uống buổi tối trước khi đi ngủ' }
  ])

  const [selectedMedToAdd, setSelectedMedToAdd] = useState('')
  const [medQtyToAdd, setMedQtyToAdd] = useState(10)
  const [medUsageToAdd, setMedUsageToAdd] = useState('')

  // ===== TÍNH TOÁN VIỆN PHÍ & TIỀN THUỐC =====
  const CONSULTATION_FEE = 150000 // Tiền công khám 150.000đ

  const getMedPrice = (name) => {
    const found = SAMPLE_MEDICINES.find(m => m.name === name)
    return found ? found.price : 3500
  }

  const totalMedFee = prescriptionItems.reduce((sum, item) => {
    return sum + (getMedPrice(item.medicine) * (item.quantity || 1))
  }, 0)

  const totalInvoiceAmount = CONSULTATION_FEE + totalMedFee

  // Tạo URL VietQR động theo số tiền & mã bệnh nhân
  const vietQrUrl = `https://api.vietqr.io/image/970422-02838389999-compact2.jpg?amount=${totalInvoiceAmount}&addInfo=${encodeURIComponent(`TT VP ${currentPatient.patientCode}`)}&accountName=${encodeURIComponent('PHONG KHAM PHU LOI BAO')}`

  // Chọn bệnh nhân
  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id)
    setVitalSigns(patient.vitalSigns)
    setSymptoms(patient.reason)
    setAlertSuccess('')
  }

  const [isSaving, setIsSaving] = useState(false)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [savedDataSummary, setSavedDataSummary] = useState(null)

  // Mời vào khám
  const handleCallPatient = (patientId) => {
    setQueue(prev => prev.map(p => {
      if (p.id === patientId) return { ...p, status: 'IN_PROGRESS' }
      if (p.status === 'IN_PROGRESS') return { ...p, status: 'WAITING' }
      return p
    }))
    setSelectedPatientId(patientId)
    const target = queue.find(p => p.id === patientId)
    if (target) {
      setVitalSigns(target.vitalSigns)
      setSymptoms(target.reason)
      setAlertSuccess(`Đang gọi bệnh nhân STT ${target.stt}: ${target.name} vào bàn khám!`)
    }
  }

  // Hoàn thành ca khám & Lưu vào hệ thống
  const handleCompleteExamination = () => {
    setIsSaving(true)
    setTimeout(() => {
      // 1. Cập nhật trạng thái bệnh nhân trong hàng chờ
      setQueue(prev => prev.map(p => 
        p.id === selectedPatientId ? { ...p, status: 'COMPLETED' } : p
      ))

      // 2. Tạo mã hồ sơ
      const randomNum = Math.floor(Math.random() * 90) + 10
      const recCode = `BA00${randomNum}`
      const presCode = `DT00${randomNum}`

      // 3. Lưu bệnh án vào localStorage
      const newRecord = {
        id: Date.now(),
        code: recCode,
        patientName: currentPatient.name,
        age: currentPatient.age,
        gender: currentPatient.gender,
        date: new Date().toISOString().split('T')[0],
        diagnosis: diagnosis,
        symptoms: symptoms,
        treatment: prescriptionItems.map(p => `${p.medicine} (${p.quantity} ${p.unit})`).join(', ') || 'Nghỉ ngơi, theo dõi',
        bp: `${vitalSigns.bp} mmHg`,
        status: 'Đã hoàn thành'
      }
      try {
        const existingRecords = JSON.parse(localStorage.getItem('clinic_doctor_records') || '[]')
        localStorage.setItem('clinic_doctor_records', JSON.stringify([newRecord, ...existingRecords]))
      } catch (err) {
        console.error(err)
      }

      // 4. Lưu đơn thuốc vào localStorage
      const newPrescription = {
        id: Date.now(),
        code: presCode,
        patientName: currentPatient.name,
        age: currentPatient.age,
        date: new Date().toISOString().split('T')[0],
        diagnosis: diagnosis,
        medicines: prescriptionItems.map(p => ({
          name: p.medicine,
          quantity: p.quantity,
          unit: p.unit,
          usage: p.usage
        })),
        status: 'Chờ lấy thuốc'
      }
      try {
        const existingPrescriptions = JSON.parse(localStorage.getItem('clinic_doctor_prescriptions') || '[]')
        localStorage.setItem('clinic_doctor_prescriptions', JSON.stringify([newPrescription, ...existingPrescriptions]))
      } catch (err) {
        console.error(err)
      }

      // 5. Lưu Hóa đơn tạm tính vào localStorage cho Quầy Thu Ngân
      const invCode = `HD00${randomNum}`
      const newInvoice = {
        id: Date.now(),
        code: invCode,
        patientName: currentPatient.name,
        patientCode: currentPatient.patientCode,
        phone: currentPatient.phone,
        date: new Date().toISOString().split('T')[0],
        totalAmount: totalInvoiceAmount,
        status: 'UNPAID',
        paymentMethod: 'Chưa thanh toán (Chờ quét QR / tiền mặt)',
        items: [
          { name: 'Công khám chuyên khoa Nội', price: CONSULTATION_FEE, quantity: 1 },
          ...prescriptionItems.map(p => ({
            name: `Thuốc ${p.medicine}`,
            price: getMedPrice(p.medicine),
            quantity: p.quantity,
            unit: p.unit
          }))
        ]
      }
      try {
        const existingInvoices = JSON.parse(localStorage.getItem('clinic_invoices') || '[]')
        localStorage.setItem('clinic_invoices', JSON.stringify([newInvoice, ...existingInvoices]))
      } catch (err) {
        console.error(err)
      }

      // 6. Cập nhật dữ liệu tóm tắt và mở Modal
      setSavedDataSummary({
        recordCode: recCode,
        prescriptionCode: presCode,
        invoiceCode: invCode,
        patientName: currentPatient.name,
        diagnosis: diagnosis,
        medicineCount: prescriptionItems.length,
        totalAmount: totalInvoiceAmount
      })
      setAlertSuccess(`Đã lưu Bệnh án #${recCode}, Toa thuốc #${presCode} & Hóa đơn #${invCode} (${totalInvoiceAmount.toLocaleString('vi-VN')} đ)!`)
      setIsSaving(false)
      setShowSavedModal(true)
    }, 350)
  }

  // Vắng mặt
  const handleMarkAbsent = (patientId) => {
    setQueue(prev => prev.map(p => 
      p.id === patientId ? { ...p, status: 'ABSENT' } : p
    ))
  }

  // Thêm thuốc
  const handleAddMedicine = (e) => {
    e.preventDefault()
    if (!selectedMedToAdd) return
    const medObj = SAMPLE_MEDICINES.find(m => m.name === selectedMedToAdd)
    const newItem = {
      id: Date.now(),
      medicine: selectedMedToAdd,
      quantity: Number(medQtyToAdd) || 1,
      unit: medObj ? medObj.unit : 'Viên',
      usage: medUsageToAdd || (medObj ? medObj.defaultDosage : 'Theo chỉ định của bác sĩ')
    }
    setPrescriptionItems([...prescriptionItems, newItem])
    setSelectedMedToAdd('')
    setMedUsageToAdd('')
  }

  const handleRemoveMedicine = (id) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id))
  }

  // Lọc
  const filteredQueue = queue.filter(p => {
    if (filterStatus === 'ALL') return true
    return p.status === filterStatus
  })

  const waitingCount = queue.filter(p => p.status === 'WAITING').length

  // BMI
  const heightM = (vitalSigns.height || 165) / 100
  const weightKg = vitalSigns.weight || 60
  const bmi = (weightKg / (heightM * heightM)).toFixed(1)
  const getBmiCategory = (val) => {
    if (val < 18.5) return { text: 'Thiếu cân', color: 'text-warning' }
    if (val < 23) return { text: 'Bình thường', color: 'text-success' }
    if (val < 25) return { text: 'Thừa cân', color: 'text-warning' }
    return { text: 'Béo phì', color: 'text-danger' }
  }

  return (
    <DoctorLayout 
      title="Bàn Khám Bệnh Trực Tiếp" 
      subtitle="Phòng Khám Nội 01 (P.102) - Tiếp nhận, chẩn đoán & kê đơn thuốc"
      waitingCount={waitingCount}
    >
      {/* Alert Thông Báo */}
      {alertSuccess && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-3 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2"></i>
          <div>{alertSuccess}</div>
          <button type="button" className="btn-close" onClick={() => setAlertSuccess('')}></button>
        </div>
      )}

      {/* LƯỚI 2 CỘT CHUẨN XÁC: CỘT TRÁI HÀNG ĐỢI - CỘT PHẢI BÀN KHÁM */}
      <div className="clinic-room-grid">
        
        {/* ================= CỘT TRÁI: HÀNG ĐỢI BỆNH NHÂN ================= */}
        <div className="doc-card">
          <div className="doc-card-header">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-people-fill text-primary fs-5"></i>
              <span className="fw-bold text-dark" style={{ fontSize: '15px' }}>
                Hàng Đợi Khám Hôm Nay
              </span>
            </div>
            <span className="badge bg-danger rounded-pill px-2.5 py-1">
              {waitingCount} đang chờ
            </span>
          </div>

          {/* Bộ lọc trạng thái */}
          <div className="p-3 border-bottom bg-light">
            <div className="btn-group btn-group-sm w-100" role="group">
              <button 
                type="button" 
                className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('ALL')}
              >
                Tất cả ({queue.length})
              </button>
              <button 
                type="button" 
                className={`btn ${filterStatus === 'WAITING' ? 'btn-warning text-dark fw-semibold' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('WAITING')}
              >
                Chờ ({waitingCount})
              </button>
              <button 
                type="button" 
                className={`btn ${filterStatus === 'COMPLETED' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('COMPLETED')}
              >
                Xong ({queue.filter(p => p.status === 'COMPLETED').length})
              </button>
            </div>
          </div>

          {/* Danh sách thẻ bệnh nhân xếp dọc */}
          <div className="queue-list">
            {filteredQueue.map((patient) => {
              const isSelected = patient.id === currentPatient.id
              const isExamining = patient.status === 'IN_PROGRESS'
              
              return (
                <div 
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`queue-item ${isSelected ? 'active' : ''}`}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span 
                        className={`badge fw-bold px-2 py-1 ${
                          isExamining 
                            ? 'bg-primary text-white' 
                            : patient.status === 'COMPLETED'
                            ? 'bg-success text-white'
                            : 'bg-warning text-dark'
                        }`}
                        style={{ fontSize: '12.5px' }}
                      >
                        STT {patient.stt}
                      </span>
                      <span className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>
                        {patient.name}
                      </span>
                    </div>

                    {isExamining && (
                      <span className="badge bg-primary text-white" style={{ fontSize: '11px' }}>
                        <i className="bi bi-arrow-repeat me-1"></i> Đang khám
                      </span>
                    )}
                    {patient.status === 'WAITING' && (
                      <span className="badge bg-warning-subtle text-dark border border-warning" style={{ fontSize: '11px' }}>
                        Chờ khám
                      </span>
                    )}
                    {patient.status === 'COMPLETED' && (
                      <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '11px' }}>
                        <i className="bi bi-check-circle me-1"></i> Đã xong
                      </span>
                    )}
                    {patient.status === 'ABSENT' && (
                      <span className="badge bg-secondary text-white" style={{ fontSize: '11px' }}>
                        Vắng
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center justify-content-between text-muted small mt-1">
                    <span>{patient.gender}, {patient.age}t • {patient.patientCode}</span>
                    <span><i className="bi bi-clock me-1"></i>{patient.registeredTime}</span>
                  </div>

                  <div className="text-secondary small mt-1 text-truncate" title={patient.reason}>
                    <em>{patient.reason}</em>
                  </div>

                  {/* Nút mời vào khám */}
                  <div className="d-flex gap-2 mt-2 pt-2 border-top">
                    {patient.status !== 'IN_PROGRESS' && patient.status !== 'COMPLETED' && (
                      <button 
                        type="button"
                        className="btn btn-sm btn-primary py-1 flex-grow-1"
                        style={{ fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCallPatient(patient.id)
                        }}
                      >
                        <i className="bi bi-megaphone-fill me-1"></i> Mời vào khám
                      </button>
                    )}
                    {patient.status === 'WAITING' && (
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-1 px-2"
                        style={{ fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAbsent(patient.id)
                        }}
                        title="Bệnh nhân vắng mặt"
                      >
                        Vắng
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Nút gọi tiếp */}
          <div className="p-3 border-top bg-light">
            <button 
              type="button" 
              className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center shadow-sm"
              onClick={() => {
                const nextWaiting = queue.find(p => p.status === 'WAITING')
                if (nextWaiting) {
                  handleCallPatient(nextWaiting.id)
                } else {
                  alert('Không còn bệnh nhân nào đang chờ trong hàng đợi!')
                }
              }}
            >
              <i className="bi bi-volume-up-fill fs-5 me-2"></i>
              Gọi Bệnh Nhân Kế Tiếp
            </button>
          </div>
        </div>

        {/* ================= CỘT PHẢI: BÀN KHÁM & CHẨN ĐOÁN & KÊ ĐƠN ================= */}
        <div className="d-flex flex-column gap-3">

          {/* 1. THÔNG TIN HÀNH CHÍNH & CẢNH BÁO DỊ ỨNG */}
          <div className="doc-card">
            <div className="doc-card-body">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm"
                    style={{ width: '50px', height: '50px', backgroundColor: '#175cdd' }}
                  >
                    {currentPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h4 className="fw-bold text-dark mb-0">{currentPatient.name}</h4>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        {currentPatient.patientCode}
                      </span>
                      <span className="badge bg-info-subtle text-info border">
                        STT: {currentPatient.stt}
                      </span>
                    </div>
                    <div className="text-muted small mt-1">
                      {currentPatient.gender} • {currentPatient.age} tuổi • SĐT: <strong>{currentPatient.phone}</strong> • {currentPatient.address}
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-success d-flex align-items-center px-3 py-2 fw-semibold shadow-sm"
                  onClick={handleCompleteExamination}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                      Đang Lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle fs-5 me-1.5"></i>
                      Hoàn Thành Ca Khám
                    </>
                  )}
                </button>
              </div>

              {/* Hàng Cảnh Báo Dị Ứng Thuốc */}
              <div className="row g-2 mt-2">
                <div className="col-12 col-md-6">
                  <div className="allergy-alert-box">
                    <i className="bi bi-exclamation-triangle-fill text-danger fs-3"></i>
                    <div>
                      <div className="text-danger fw-bold small text-uppercase">Cảnh Báo Dị Ứng Thuốc:</div>
                      <div className="text-dark fw-bold" style={{ fontSize: '13.5px' }}>
                        {currentPatient.allergies}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="p-2.5 rounded bg-light border d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history text-secondary fs-3"></i>
                    <div>
                      <div className="text-muted fw-bold small text-uppercase">Tiền Sử Bệnh Án:</div>
                      <div className="text-dark fw-semibold" style={{ fontSize: '13px' }}>
                        {currentPatient.diagnosedHistory}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CHỈ SỐ SINH TỒN (VITAL SIGNS) */}
          <div className="doc-card">
            <div className="doc-card-header">
              <span className="fw-bold text-dark d-flex align-items-center">
                <i className="bi bi-activity text-primary me-2"></i>
                Chỉ Số Sinh Tồn (Đo lúc tiếp nhận)
              </span>
            </div>
            <div className="doc-card-body">
              <div className="vitals-grid">
                <div className="vital-box">
                  <div className="text-muted small">Huyết áp</div>
                  <div className="vital-value text-primary">{vitalSigns.bp}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>mmHg</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">Mạch</div>
                  <div className="vital-value text-danger">{vitalSigns.pulse}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>lần/phút</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">Thân nhiệt</div>
                  <div className="vital-value text-warning-emphasis">{vitalSigns.temp}°C</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Độ C</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">SpO2</div>
                  <div className="vital-value text-success">{vitalSigns.spo2}%</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>Oxy máu</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">Cân nặng</div>
                  <div className="vital-value text-dark">{vitalSigns.weight}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>kg ({vitalSigns.height}cm)</div>
                </div>
                <div className="vital-box">
                  <div className="text-muted small">Chỉ số BMI</div>
                  <div className={`vital-value ${getBmiCategory(bmi).color}`}>{bmi}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{getBmiCategory(bmi).text}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. KHÁM LÂM SÀNG & CHẨN ĐOÁN ICD-10 */}
          <div className="doc-card">
            <div className="doc-card-header">
              <span className="fw-bold text-dark d-flex align-items-center">
                <i className="bi bi-clipboard2-pulse-fill text-primary me-2"></i>
                Khám Lâm Sàng & Chẩn Đoán Bệnh
              </span>
            </div>
            <div className="doc-card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Lý do đến khám & Triệu chứng cơ năng:</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  ></textarea>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Khám thực thể & Nghe tim phổi:</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    defaultValue="Tim đều, T1 T2 rõ, không âm thổi bệnh lý. Phổi trong, không rale. Bụng mềm, gan lách không to."
                  ></textarea>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Mã bệnh ICD-10:</label>
                  <select 
                    className="form-select fw-semibold" 
                    value={icdCode} 
                    onChange={(e) => setIcdCode(e.target.value)}
                  >
                    <option value="I10 - Tăng huyết áp vô căn (nguyên phát)">I10 - Tăng huyết áp vô căn (nguyên phát)</option>
                    <option value="E78 - Rối loạn chuyển hóa lipoprotein">E78 - Rối loạn chuyển hóa lipoprotein</option>
                    <option value="J00 - Viêm mũi họng cấp tính">J00 - Viêm mũi họng cấp tính</option>
                    <option value="K29 - Viêm dạ dày và tá tràng">K29 - Viêm dạ dày và tá tràng</option>
                    <option value="G44 - Hội chứng đau đầu khác">G44 - Hội chứng đau đầu khác</option>
                    <option value="I20 - Cơn đau thắt ngực">I20 - Cơn đau thắt ngực</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Chẩn đoán xác định:</label>
                  <input 
                    type="text" 
                    className="form-control fw-semibold text-primary"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. KÊ ĐƠN THUỐC ĐIỆN TỬ */}
          <div className="doc-card">
            <div className="doc-card-header">
              <span className="fw-bold text-dark d-flex align-items-center">
                <i className="bi bi-capsule text-primary me-2"></i>
                Đơn Thuốc Điện Tử (Toa Thuốc)
              </span>
              <span className="badge bg-primary-subtle text-primary border">
                {prescriptionItems.length} loại thuốc trong toa
              </span>
            </div>
            
            <div className="doc-card-body">
              {/* Form thêm thuốc nhanh */}
              <form onSubmit={handleAddMedicine} className="bg-light p-3 rounded-3 mb-3 border">
                <div className="row g-2 align-items-end">
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold text-muted mb-1">Chọn thuốc trong kho:</label>
                    <select 
                      className="form-select form-select-sm"
                      value={selectedMedToAdd}
                      onChange={(e) => {
                        setSelectedMedToAdd(e.target.value)
                        const found = SAMPLE_MEDICINES.find(m => m.name === e.target.value)
                        if (found) setMedUsageToAdd(found.defaultDosage)
                      }}
                    >
                      <option value="">-- Chọn thuốc --</option>
                      {SAMPLE_MEDICINES.map(m => (
                        <option key={m.id} value={m.name}>{m.name} ({m.price.toLocaleString('vi-VN')} đ/{m.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4 col-md-2">
                    <label className="form-label small fw-semibold text-muted mb-1">Số lượng:</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="form-control form-control-sm"
                      value={medQtyToAdd}
                      onChange={(e) => setMedQtyToAdd(e.target.value)}
                    />
                  </div>
                  <div className="col-8 col-md-4">
                    <label className="form-label small fw-semibold text-muted mb-1">Cách dùng / Liều dùng:</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm"
                      placeholder="Sáng 1v, chiều 1v..."
                      value={medUsageToAdd}
                      onChange={(e) => setMedUsageToAdd(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-2">
                    <button type="submit" className="btn btn-sm btn-primary w-100" disabled={!selectedMedToAdd}>
                      <i className="bi bi-plus-lg me-1"></i> Thêm Thuốc
                    </button>
                  </div>
                </div>
              </form>

              {/* Bảng danh sách thuốc */}
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle mb-0" style={{ fontSize: '13px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40px' }} className="text-center">#</th>
                      <th>Tên Thuốc / Hoạt Chất</th>
                      <th style={{ width: '100px' }} className="text-center">Số Lượng</th>
                      <th>Cách Dùng & Liều Lượng</th>
                      <th style={{ width: '50px' }} className="text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="text-center fw-bold text-muted">{idx + 1}</td>
                        <td className="fw-semibold text-dark">{item.medicine}</td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border px-2 py-1">
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="text-secondary">{item.usage}</td>
                        <td className="text-center">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger border-0 p-1"
                            onClick={() => handleRemoveMedicine(item.id)}
                            title="Xóa thuốc khỏi đơn"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {prescriptionItems.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-3 text-muted">
                          Chưa có thuốc nào trong toa. Chọn thuốc ở trên để thêm vào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TÓM TẮT VIỆN PHÍ & MÃ QR TRÊN MÀN HÌNH BÁC SĨ */}
              <div className="p-2.5 rounded bg-light border d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 mb-2">
                <div className="small text-muted d-flex align-items-center gap-2">
                  <span>Công khám: <strong className="text-dark">{CONSULTATION_FEE.toLocaleString('vi-VN')} đ</strong></span>
                  <span>•</span>
                  <span>Tiền thuốc: <strong className="text-dark">{totalMedFee.toLocaleString('vi-VN')} đ</strong></span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle fs-6 px-3 py-1.5">
                    Tổng viện phí: <strong>{totalInvoiceAmount.toLocaleString('vi-VN')} đ</strong>
                  </span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">
                    <i className="bi bi-qr-code me-1"></i> Có sẵn VietQR
                  </span>
                </div>
              </div>

              {/* Lời dặn & Hẹn tái khám */}
              <div className="row g-2 mt-2 pt-2 border-top">
                <div className="col-12 col-md-8">
                  <label className="form-label small fw-semibold text-secondary">Lời dặn của Bác sĩ:</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm"
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Hẹn ngày tái khám:</label>
                  <input 
                    type="date" 
                    className="form-control form-control-sm"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Nút hành động */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-4 pt-3 border-top">
                <div className="d-flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-primary d-flex align-items-center"
                    onClick={() => window.print()}
                  >
                    <i className="bi bi-printer me-1.5"></i> In Toa Thuốc
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary d-flex align-items-center"
                    onClick={() => alert('Đã chuyển bệnh nhân đến phòng Xét Nghiệm & Chẩn Đoán Hình Ảnh!')}
                  >
                    <i className="bi bi-journal-medical me-1.5"></i> Chỉ Định Cận Lâm Sàng
                  </button>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary d-flex align-items-center px-4 fw-semibold shadow-sm"
                  onClick={handleCompleteExamination}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang lưu vào hệ thống...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-floppy-fill me-1.5"></i> Lưu Bệnh Án & Toa Thuốc
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= MODAL THÔNG BÁO LƯU THÀNH CÔNG RÕ RÀNG ================= */}
      {showSavedModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center no-print"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 2000, backdropFilter: 'blur(3px)' }}
        >
          <div className="bg-white rounded-4 shadow-lg p-4 text-center animate-fade-in" style={{ width: '500px', maxWidth: '92%' }}>
            <div 
              className="rounded-circle bg-success-subtle text-success mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: '68px', height: '68px', fontSize: '34px' }}
            >
              <i className="bi bi-check-circle-fill"></i>
            </div>
            
            <h4 className="fw-bold text-dark mb-1">Đã Lưu Thành Công!</h4>
            <p className="text-muted small mb-3">
              Hồ sơ bệnh án và đơn thuốc đã được số hóa & lưu vào hệ thống phòng khám.
            </p>

            <div className="bg-light rounded-3 p-3 text-start small mb-4 border">
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Bệnh nhân:</span>
                <strong className="text-dark">{savedDataSummary?.patientName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Mã bệnh án:</span>
                <span className="fw-bold text-primary">{savedDataSummary?.recordCode}</span>
              </div>
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Mã đơn thuốc:</span>
                <span className="fw-bold text-success">{savedDataSummary?.prescriptionCode}</span>
              </div>
              <div className="d-flex justify-content-between mb-1.5">
                <span className="text-muted">Chẩn đoán:</span>
                <span className="text-dark text-truncate" style={{ maxWidth: '250px' }}>{savedDataSummary?.diagnosis}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Số loại thuốc đã kê:</span>
                <span className="badge bg-primary">{savedDataSummary?.medicineCount} loại</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              <button 
                type="button" 
                className="btn btn-outline-primary d-flex align-items-center justify-content-center py-2"
                onClick={() => {
                  window.print()
                }}
              >
                <i className="bi bi-printer me-2"></i> In Toa Thuốc Cho Bệnh Nhân
              </button>

              <button 
                type="button" 
                className="btn btn-primary d-flex align-items-center justify-content-center py-2 fw-semibold"
                onClick={() => {
                  setShowSavedModal(false)
                  const nextWaiting = queue.find(p => p.status === 'WAITING')
                  if (nextWaiting) {
                    handleCallPatient(nextWaiting.id)
                  }
                }}
              >
                <i className="bi bi-person-plus me-2"></i> Mời Bệnh Nhân Kế Tiếp Vào Khám
              </button>

              <button 
                type="button" 
                className="btn btn-light border py-1.5 text-secondary mt-1"
                onClick={() => setShowSavedModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= KHỐI ĐƠN THUỐC CHUYÊN IN (CHỈ HIỆN KHI BẤM IN) ================= */}
      <div className="prescription-print-document print-only">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15pt', textTransform: 'uppercase' }}>PHÒNG KHÁM ĐA KHOA PHÚ LỢI BẢO</div>
          <div style={{ fontSize: '10pt', color: '#444' }}>Địa chỉ: 123 Nguyễn Tri Phương, Phường 7, Quận 5, TP.HCM • Hotline: (028) 3838 9999</div>
          <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '14px 0 6px 0', textTransform: 'uppercase' }}>ĐƠN THUỐC ĐIỆN TỬ</h2>
          <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>
            Mã đơn: DT-{currentPatient.patientCode} • Ngày kê: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        <div style={{ marginBottom: '16px', fontSize: '11pt', lineHeight: '1.6' }}>
          <div>Họ và tên bệnh nhân: <strong>{currentPatient.name}</strong> • Tuổi: <strong>{currentPatient.age}</strong> • Giới tính: <strong>{currentPatient.gender}</strong></div>
          <div>Mã hồ sơ: <strong>{currentPatient.patientCode}</strong> • Điện thoại: <strong>{currentPatient.phone}</strong></div>
          <div>Địa chỉ: {currentPatient.address}</div>
          <div>Chẩn đoán: <strong>{diagnosis}</strong> (Mã ICD: {icdCode.split(' - ')[0]})</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead>
            <tr>
              <th style={{ width: '35px', textAlign: 'center' }}>STT</th>
              <th>Tên Thuốc / Hàm Lượng</th>
              <th style={{ width: '70px', textAlign: 'center' }}>Số Lượng</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Đơn Giá</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Thành Tiền</th>
              <th>Cách Dùng & Liều Lượng</th>
            </tr>
          </thead>
          <tbody>
            {prescriptionItems.map((item, idx) => {
              const unitPrice = getMedPrice(item.medicine)
              const lineTotal = unitPrice * (item.quantity || 1)
              return (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.medicine}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity} {item.unit}</td>
                  <td style={{ textAlign: 'right' }}>{unitPrice.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{lineTotal.toLocaleString('vi-VN')} đ</td>
                  <td>{item.usage}</td>
                </tr>
              )
            })}
            {prescriptionItems.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>Chưa kê thuốc</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ================= KHUNG BẢNG KÊ VIỆN PHÍ & MÃ VIETQR THANH TOÁN ================= */}
        <div style={{ border: '1.5px solid #111', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Cột Trái: Bảng kê chi phí */}
            <div style={{ flex: 1, paddingRight: '16px', fontSize: '10.5pt', lineHeight: '1.7' }}>
              <div style={{ fontWeight: 'bold', fontSize: '11pt', textTransform: 'uppercase', marginBottom: '4px', color: '#175cdd' }}>
                PHIẾU THU THAM KHẢO & VIỆN PHÍ
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>1. Tiền công khám chuyên khoa:</span>
                <strong>{CONSULTATION_FEE.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>2. Tiền thuốc trong toa ({prescriptionItems.length} loại):</span>
                <strong>{totalMedFee.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #555', marginTop: '6px', paddingTop: '6px', fontSize: '11.5pt' }}>
                <span style={{ fontWeight: 'bold' }}>TỔNG CỘNG THANH TOÁN:</span>
                <strong style={{ color: '#b91c1c', fontSize: '12.5pt' }}>{totalInvoiceAmount.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div style={{ fontSize: '8.5pt', color: '#444', marginTop: '4px', fontStyle: 'italic' }}>
                * Quét mã VietQR bằng App Ngân Hàng để chuyển khoản hoặc nộp tiền mặt tại Quầy Thu Ngân.
              </div>
            </div>

            {/* Cột Phải: Mã VietQR */}
            <div style={{ width: '150px', textAlign: 'center', borderLeft: '1px solid #ccc', paddingLeft: '14px' }}>
              <div style={{ fontSize: '8.5pt', fontWeight: 'bold', color: '#175cdd', marginBottom: '2px' }}>
                QUÉT MÃ VIETQR
              </div>
              <img 
                src={vietQrUrl} 
                alt="Mã QR Thanh Toán" 
                style={{ width: '115px', height: '115px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px', padding: '2px', background: '#fff' }} 
              />
              <div style={{ fontSize: '8pt', fontWeight: 'bold', marginTop: '2px' }}>
                MB BANK: 02838389999
              </div>
              <div style={{ fontSize: '7pt', color: '#555' }}>
                PK PHU LOI BAO
              </div>
            </div>

          </div>
        </div>

        <div style={{ fontSize: '10.5pt', marginBottom: '20px', lineHeight: '1.5' }}>
          <div><strong>* Lời dặn của bác sĩ:</strong> {advice || 'Uống thuốc đúng giờ, tuân thủ đúng liều lượng.'}</div>
          {followUpDate && <div><strong>* Hẹn ngày tái khám:</strong> {new Date(followUpDate).toLocaleDateString('vi-VN')}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '24px' }}>
          <div style={{ fontSize: '9pt', fontStyle: 'italic', maxWidth: '320px', lineHeight: '1.5' }}>
            * Khám lại xin mang theo đơn thuốc này.<br />
            * Đơn thuốc có giá trị mua trong vòng 05 ngày kể từ ngày kê đơn.<br />
            * Bệnh nhân sau khi thanh toán vui lòng sang Quầy Dược nhận thuốc.
          </div>
          <div style={{ textAlign: 'center', minWidth: '220px' }}>
            <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
            <div style={{ fontWeight: 'bold', margin: '4px 0 55px 0' }}>Bác sĩ khám bệnh</div>
            <div style={{ fontWeight: 'bold', fontSize: '11.5pt' }}>BS. CKII. Trần Văn Hùng</div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}
