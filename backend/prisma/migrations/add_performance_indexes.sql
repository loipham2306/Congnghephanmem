-- ========================================================
-- SCRIPT TỐI ƯU HÓA CHỈ MỤC CƠ SỞ DỮ LIỆU (DATABASE INDEXES)
-- Hệ thống Quản lý Phòng Khám (Clinic Management System)
-- Tương thích: PostgreSQL 14+ / Supabase
-- ========================================================

-- 1. BẢNG LỊCH HẸN (lichhen)
-- Tối ưu tra cứu lịch hẹn theo bệnh nhân, bác sĩ và bộ lọc ngày + trạng thái
CREATE INDEX IF NOT EXISTS "idx_lichhen_mabn" ON "lichhen"("mabn");
CREATE INDEX IF NOT EXISTS "idx_lichhen_mabs" ON "lichhen"("mabs");
CREATE INDEX IF NOT EXISTS "idx_lichhen_ngay_trangthai" ON "lichhen"("ngayhen", "trangthai");

-- 2. BẢNG LỊCH SỬ KHÁM BỆNH (lichsukham)
-- Tối ưu tra cứu hồ sơ bệnh án theo bệnh nhân, bác sĩ và sắp xếp ca khám mới nhất
CREATE INDEX IF NOT EXISTS "idx_lichsukham_mabn" ON "lichsukham"("mabn");
CREATE INDEX IF NOT EXISTS "idx_lichsukham_mabs" ON "lichsukham"("mabs");
CREATE INDEX IF NOT EXISTS "idx_lichsukham_ngay" ON "lichsukham"("ngay" DESC);

-- 3. BẢNG HÓA ĐƠN (hoadon)
-- Tối ưu tra cứu hóa đơn theo bệnh nhân và thống kê doanh thu theo trạng thái thanh toán + ngày
CREATE INDEX IF NOT EXISTS "idx_hoadon_mabn" ON "hoadon"("mabn");
CREATE INDEX IF NOT EXISTS "idx_hoadon_trangthai_ngay" ON "hoadon"("trangthaithanhtoan", "ngaylap");

-- 4. BẢNG THUỐC & DƯỢC PHẨM (thuoc)
-- Tối ưu tìm kiếm tên thuốc, cảnh báo số lượng tồn kho và hạn sử dụng
CREATE INDEX IF NOT EXISTS "idx_thuoc_tenthuoc" ON "thuoc"("tenthuoc");
CREATE INDEX IF NOT EXISTS "idx_thuoc_soluongton" ON "thuoc"("soluongton");
CREATE INDEX IF NOT EXISTS "idx_thuoc_hansudung" ON "thuoc"("hansudung");

-- 5. BẢNG BỆNH NHÂN (benhnhan)
-- Tối ưu tra cứu bệnh nhân theo họ tên và số điện thoại
CREATE INDEX IF NOT EXISTS "idx_benhnhan_hoten" ON "benhnhan"("hoten");
CREATE INDEX IF NOT EXISTS "idx_benhnhan_sdt" ON "benhnhan"("sdt");

-- 6. BẢNG NHÂN VIÊN (nhanvien)
-- Tối ưu tra cứu nhân sự theo họ tên và chức vụ (Bác sĩ, Y tá, Lễ tân)
CREATE INDEX IF NOT EXISTS "idx_nhanvien_hoten" ON "nhanvien"("hoten");
CREATE INDEX IF NOT EXISTS "idx_nhanvien_chucvu" ON "nhanvien"("chucvu");

-- 7. BẢNG CA LÀM VIỆC (calamviec)
-- Tối ưu phân công trực và tra cứu lịch làm việc theo ngày và phòng khám
CREATE INDEX IF NOT EXISTS "idx_calamviec_ngay_phong" ON "calamviec"("ngay", "maphong");

-- 8. BẢNG CHI TIẾT HÓA ĐƠN (chitiethoadon)
-- Tối ưu truy vấn các dòng chi tiết theo hóa đơn, đơn thuốc, dịch vụ, thuốc
CREATE INDEX IF NOT EXISTS "idx_cthd_mahd" ON "chitiethoadon"("mahd");
CREATE INDEX IF NOT EXISTS "idx_cthd_mathuoc" ON "chitiethoadon"("mathuoc");
CREATE INDEX IF NOT EXISTS "idx_cthd_madv" ON "chitiethoadon"("madv");
CREATE INDEX IF NOT EXISTS "idx_cthd_madt" ON "chitiethoadon"("madt");

-- 9. BẢNG CHI TIẾT DỊCH VỤ KHÁM (chitietdichvukham)
-- Tối ưu truy vấn chỉ định dịch vụ cận lâm sàng của lần khám
CREATE INDEX IF NOT EXISTS "idx_ctdvk_malsk" ON "chitietdichvukham"("malsk");
CREATE INDEX IF NOT EXISTS "idx_ctdvk_madv" ON "chitietdichvukham"("madv");

-- 10. BẢNG CHI TIẾT ĐƠN THUỐC (chitietdonthuoc)
-- Tối ưu kiểm tra các đơn thuốc đang kê loại thuốc này (Safe Delete Guard)
CREATE INDEX IF NOT EXISTS "idx_ctdt_mathuoc" ON "chitietdonthuoc"("mathuoc");

-- 11. BẢNG ĐƠN THUỐC (donthuoc)
-- Tối ưu lọc đơn thuốc theo ngày kê đơn
CREATE INDEX IF NOT EXISTS "idx_donthuoc_ngayke" ON "donthuoc"("ngayke");

-- 12. BẢNG BÁC SĨ, DỊCH VỤ & PHÒNG KHÁM THEO CHUYÊN KHOA
CREATE INDEX IF NOT EXISTS "idx_bacsi_mack" ON "bacsi"("mack");
CREATE INDEX IF NOT EXISTS "idx_dichvu_mack" ON "dichvu"("mack");
CREATE INDEX IF NOT EXISTS "idx_phongkham_mack" ON "phongkham"("mack");
