import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import PageTitle from '../../components/common/PageTitle'

const doctors = [
  {
    name: 'BS. Nguyễn Văn Minh',
    specialty: 'Bác Sĩ Tim Mạch',
    desc: 'Chuyên gia hàng đầu về can thiệp tim mạch với hơn 15 năm kinh nghiệm điều trị các bệnh lý tim phức tạp.',
    experience: '15+ Năm Kinh Nghiệm',
    dept: 'Khoa Tim Mạch',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=250&fit=crop&crop=face',
    delay: 100
  },
  {
    name: 'BS. Trần Thị Hương',
    specialty: 'Bác Sĩ Thần Kinh',
    desc: 'Chuyên gia điều trị đột quỵ và các bệnh lý thần kinh phức tạp với kỹ năng phẫu thuật thần kinh xuất sắc.',
    experience: '12+ Năm Kinh Nghiệm',
    dept: 'Khoa Thần Kinh',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=250&fit=crop&crop=face',
    delay: 200
  },
  {
    name: 'BS. Lê Quang Hùng',
    specialty: 'Phẫu Thuật Viên Xương Khớp',
    desc: 'Chuyên gia phẫu thuật nội soi và thay khớp nhân tạo với hơn 18 năm kinh nghiệm lâm sàng.',
    experience: '18+ Năm Kinh Nghiệm',
    dept: 'Khoa Cơ Xương Khớp',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=250&fit=crop&crop=face',
    delay: 300
  },
  {
    name: 'BS. Phạm Thị Lan',
    specialty: 'Bác Sĩ Nhi Khoa',
    desc: 'Chuyên gia nhi khoa tận tâm với phương pháp chăm sóc trẻ em toàn diện và thân thiện với gia đình.',
    experience: '10+ Năm Kinh Nghiệm',
    dept: 'Khoa Nhi',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=250&fit=crop&crop=face',
    delay: 400
  },
  {
    name: 'BS. Hoàng Văn Đức',
    specialty: 'Bác Sĩ Da Liễu',
    desc: 'Chuyên gia điều trị các bệnh lý da và thẩm mỹ da với công nghệ laser tiên tiến và phương pháp không xâm lấn.',
    experience: '14+ Năm Kinh Nghiệm',
    dept: 'Khoa Da Liễu',
    img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=250&fit=crop&crop=face',
    delay: 500
  },
  {
    name: 'BS. Vũ Thị Bích',
    specialty: 'Bác Sĩ Ung Bướu',
    desc: 'Chuyên gia điều trị ung thư với phác đồ cá nhân hóa, kết hợp các liệu pháp tiên tiến nhất.',
    experience: '16+ Năm Kinh Nghiệm',
    dept: 'Khoa Ung Bướu',
    img: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300&h=250&fit=crop&crop=face',
    delay: 100
  },
  {
    name: 'BS. Đặng Quốc Bảo',
    specialty: 'Bác Sĩ Cấp Cứu',
    desc: 'Chuyên gia cấp cứu và hồi sức tích cực với kinh nghiệm xử lý các ca cấp cứu phức tạp và đa chấn thương.',
    experience: '11+ Năm Kinh Nghiệm',
    dept: 'Khoa Cấp Cứu',
    img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=250&fit=crop&crop=face',
    delay: 200
  },
  {
    name: 'BS. Nguyễn Thị Bảo Châu',
    specialty: 'Bác Sĩ Sản Phụ Khoa',
    desc: 'Chuyên gia về sức khỏe sinh sản và hỗ trợ sinh sản với kinh nghiệm phẫu thuật nội soi phụ khoa.',
    experience: '13+ Năm Kinh Nghiệm',
    dept: 'Khoa Sản Phụ Khoa',
    img: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=300&h=250&fit=crop&crop=face',
    delay: 300
  },
]

export default function Doctors() {
  useEffect(() => {
    AOS.refresh()
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <PageTitle
        title="Đội Ngũ Bác Sĩ"
        description="Đội ngũ bác sĩ chuyên nghiệp, tâm huyết của chúng tôi luôn sẵn sàng mang đến dịch vụ chăm sóc sức khỏe tốt nhất cho bạn và gia đình."
        breadcrumb="Bác Sĩ"
      />

      <section id="doctors" className="doctors section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {doctors.map((doc, i) => (
              <div key={i} className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay={doc.delay}>
                <div className="doctor-card">
                  <div className="doctor-image">
                    <img src={doc.img} alt={doc.name} className="img-fluid" />
                    <div className="doctor-overlay">
                      <div className="social-links">
                        <a href="#!" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
                        <a href="#!" aria-label="Email"><i className="bi bi-envelope"></i></a>
                        <a href="#!" aria-label="Điện thoại"><i className="bi bi-phone"></i></a>
                      </div>
                    </div>
                  </div>
                  <div className="doctor-content">
                    <h4>{doc.name}</h4>
                    <span className="specialty">{doc.specialty}</span>
                    <p>{doc.desc}</p>
                    <div className="doctor-meta">
                      <div className="experience">
                        <i className="bi bi-award"></i>
                        <span>{doc.experience}</span>
                      </div>
                      <div className="department">
                        <i className="bi bi-building"></i>
                        <span>{doc.dept}</span>
                      </div>
                    </div>
                    <Link to="/dat-lich-kham" className="btn-appointment">Đặt Lịch Khám</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: '60px', textAlign: 'center', padding: '45px 40px', background: 'linear-gradient(135deg, #f4f8ff, #e8f0ff)', borderRadius: '20px', border: '1px solid rgba(23,92,221,0.1)' }} data-aos="fade-up">
            <h3 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '12px' }}>Cần Tư Vấn Chuyên Khoa?</h3>
            <p style={{ color: '#666', marginBottom: '25px' }}>Hãy liên hệ với chúng tôi để được kết nối với bác sĩ chuyên khoa phù hợp nhất với tình trạng sức khỏe của bạn</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dat-lich-kham" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#175cdd', color: '#fff', padding: '14px 30px',
                borderRadius: '50px', fontWeight: '700', textDecoration: 'none'
              }}>
                <i className="bi bi-calendar-check"></i> Đặt Lịch Khám
              </Link>
              <a href="tel:+842838389999" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '2px solid #175cdd', color: '#175cdd', padding: '14px 30px',
                borderRadius: '50px', fontWeight: '600', textDecoration: 'none'
              }}>
                <i className="bi bi-telephone"></i> Gọi Ngay
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
