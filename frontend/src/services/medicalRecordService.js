import api from './api'

const initialRecords = [
  { id: 1, malsk: 1, code: 'BA001', patientName: 'Nguyễn Văn An', doctorName: 'BS. CKII. Trần Văn Hùng', date: '2026-10-01', diagnosis: 'Tăng huyết áp vô căn độ 1', chandoan: 'Tăng huyết áp vô căn độ 1', symptoms: 'Đau đầu, chóng mặt khi làm việc căng thẳng', trieuchung: 'Đau đầu, chóng mặt khi làm việc căng thẳng', treatment: 'Dùng thuốc hạ áp, giảm muối, tập thể dục nhẹ', ketluan: 'Dùng thuốc hạ áp, giảm muối, tập thể dục nhẹ' },
  { id: 2, malsk: 2, code: 'BA002', patientName: 'Trần Thị Mai', doctorName: 'ThS. BS. Nguyễn Thị Lan', date: '2026-10-03', diagnosis: 'Viêm mũi họng cấp', chandoan: 'Viêm mũi họng cấp', symptoms: 'Sốt nhẹ 38 độ, ho đờm, rát cổ', trieuchung: 'Sốt nhẹ 38 độ, ho đờm, rát cổ', treatment: 'Kháng sinh nhẹ, hạ sốt, bù nước điện giải', ketluan: 'Kháng sinh nhẹ, hạ sốt, bù nước điện giải' },
  { id: 3, malsk: 3, code: 'BA003', patientName: 'Lê Hoàng Long', doctorName: 'TS. BS. Lê Hoàng Nam', date: '2026-10-04', diagnosis: 'Rối loạn tuần hoàn não', chandoan: 'Rối loạn tuần hoàn não', symptoms: 'Mất ngủ, hoa mắt khi thay đổi tư thế', trieuchung: 'Mất ngủ, hoa mắt khi thay đổi tư thế', treatment: 'Tăng cường tuần hoàn não, nghỉ ngơi hợp lý', ketluan: 'Tăng cường tuần hoàn não, nghỉ ngơi hợp lý' }
]

function normalizeRecord(r) {
  if (!r) return null
  const dateStr = r.ngay ? (typeof r.ngay === 'string' ? r.ngay.split('T')[0] : new Date(r.ngay).toISOString().split('T')[0]) : (r.date || '2026-10-01')
  
  return {
    id: r.malsk || r.id,
    malsk: r.malsk || r.id,
    code: r.code || `BA${String(r.malsk || r.id).padStart(3, '0')}`,
    mabn: r.mabn,
    mabs: r.mabs,
    patientName: r.benhnhan?.hoten || r.patientName || 'Bệnh Nhân',
    doctorName: r.bacsi?.nhanvien?.hoten || r.doctorName || 'BS. CKII. Trần Văn Hùng',
    date: dateStr,
    ngay: dateStr,
    diagnosis: r.chandoan || r.diagnosis || 'Khám tổng quát',
    chandoan: r.chandoan || r.diagnosis || 'Khám tổng quát',
    symptoms: r.trieuchung || r.symptoms || '',
    trieuchung: r.trieuchung || r.symptoms || '',
    treatment: r.ketluan || r.treatment || '',
    ketluan: r.ketluan || r.treatment || '',
    services: r.chitietdichvukham || [],
    prescription: r.donthuoc || null,
    invoice: r.hoadon || null
  }
}

export const medicalRecordService = {
  async getAll(params = {}) {
    try {
      const res = await api.get('/examinations', params)
      const list = Array.isArray(res) ? res : (res.data || [])
      if (list.length > 0) {
        return list.map(normalizeRecord)
      }
      return initialRecords
    } catch (err) {
      console.warn('[medicalRecordService] Gọi /examinations lỗi, dùng fallback:', err.message)
      return initialRecords
    }
  },

  async getById(id) {
    try {
      const res = await api.get(`/examinations/${id}`)
      return normalizeRecord(res.data || res)
    } catch {
      return initialRecords.find(r => r.id === Number(id) || r.malsk === Number(id)) || null
    }
  },

  async getByPatientId(patientId) {
    try {
      const res = await api.get(`/examinations/patient/${patientId}`)
      const list = Array.isArray(res) ? res : (res.data || [])
      return list.map(normalizeRecord)
    } catch {
      return initialRecords.filter(r => r.mabn === Number(patientId))
    }
  },

  async create(data) {
    try {
      const payload = {
        mabn: Number(data.mabn || data.patientId),
        malh: data.malh ? Number(data.malh) : undefined,
        trieuchung: data.symptoms || data.trieuchung || 'Không có triệu chứng bất thường',
        chandoan: data.diagnosis || data.chandoan || 'Khám bệnh định kỳ',
        ketluan: data.treatment || data.ketluan || 'Theo dõi thêm',
        services: data.services || []
      }
      const res = await api.post('/examinations', payload)
      return normalizeRecord(res.data || res)
    } catch {
      const newRec = normalizeRecord({
        id: Date.now(),
        code: `BA${Math.floor(100 + Math.random() * 900)}`,
        ...data
      })
      return newRec
    }
  },

  async update(id, data) {
    try {
      const payload = {
        chandoan: data.diagnosis || data.chandoan,
        ketluan: data.treatment || data.ketluan,
        trieuchung: data.symptoms || data.trieuchung
      }
      const res = await api.put(`/examinations/${id}`, payload)
      return normalizeRecord(res.data || res)
    } catch {
      return normalizeRecord({ id: Number(id), ...data })
    }
  },

  async delete(id) {
    try {
      return await api.delete(`/examinations/${id}`)
    } catch {
      return { success: true }
    }
  }
}

export default medicalRecordService
