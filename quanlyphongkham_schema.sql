-- =====================================================================
-- CSDL: HỆ THỐNG QUẢN LÝ PHÒNG KHÁM
-- Engine: InnoDB | Charset: utf8mb4 (hỗ trợ tiếng Việt đầy đủ)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS QuanLyPhongKham
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyPhongKham;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. PHÂN HỆ TÀI KHOẢN & NHÂN SỰ
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS TaiKhoan;
CREATE TABLE TaiKhoan (
    MaTK            INT AUTO_INCREMENT PRIMARY KEY,
    TenDangNhap     VARCHAR(50)  NOT NULL UNIQUE,
    MatKhau         VARCHAR(255) NOT NULL,              -- lưu dạng hash (bcrypt/argon2)
    VaiTro          ENUM('Admin','BacSi','YTa','LeTan','BenhNhan') NOT NULL,
    TrangThai       ENUM('HoatDong','KhoaTaiKhoan') NOT NULL DEFAULT 'HoatDong',
    NgayTao         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS ChuyenKhoa;
CREATE TABLE ChuyenKhoa (
    MaCK            INT AUTO_INCREMENT PRIMARY KEY,
    TenChuyenKhoa   VARCHAR(100) NOT NULL UNIQUE,
    MoTa            TEXT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS NhanVien;
CREATE TABLE NhanVien (
    MaNV            INT AUTO_INCREMENT PRIMARY KEY,
    MaTK            INT UNIQUE,                          -- 1-1, nullable (không bắt buộc có tài khoản)
    HoTen           VARCHAR(100) NOT NULL,
    GioiTinh        ENUM('Nam','Nu','Khac') NOT NULL,
    NgaySinh        DATE NOT NULL,
    SDT             VARCHAR(15)  NOT NULL UNIQUE,
    DiaChi          VARCHAR(255),
    ChucVu          ENUM('BacSi','YTa','LeTan','QuanLy') NOT NULL,
    NgayVaoLam      DATE NOT NULL,
    CONSTRAINT fk_nhanvien_taikhoan
        FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS BacSi;
CREATE TABLE BacSi (
    MaBS                    INT PRIMARY KEY,             -- 1-1 kế thừa từ NhanVien
    MaCK                    INT NOT NULL,
    SoGiayPhepHanhNghe      VARCHAR(50) NOT NULL UNIQUE,
    HocHam                  VARCHAR(50),
    KinhNghiem              INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_bacsi_nhanvien
        FOREIGN KEY (MaBS) REFERENCES NhanVien(MaNV)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bacsi_chuyenkhoa
        FOREIGN KEY (MaCK) REFERENCES ChuyenKhoa(MaCK)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_bacsi_kinhnghiem CHECK (KinhNghiem >= 0)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS PhongKham;
CREATE TABLE PhongKham (
    MaPhong         INT AUTO_INCREMENT PRIMARY KEY,
    TenPhong        VARCHAR(50) NOT NULL UNIQUE,
    MaCK            INT NOT NULL,
    TrangThai       ENUM('SanSang','DangSuDung','BaoTri') NOT NULL DEFAULT 'SanSang',
    CONSTRAINT fk_phongkham_chuyenkhoa
        FOREIGN KEY (MaCK) REFERENCES ChuyenKhoa(MaCK)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS CaLamViec;
CREATE TABLE CaLamViec (
    MaCa            INT AUTO_INCREMENT PRIMARY KEY,
    Ngay            DATE NOT NULL,
    GioBatDau       TIME NOT NULL,
    GioKetThuc      TIME NOT NULL,
    MaPhong         INT NOT NULL,
    CONSTRAINT fk_calamviec_phongkham
        FOREIGN KEY (MaPhong) REFERENCES PhongKham(MaPhong)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_calamviec_giolam CHECK (GioKetThuc > GioBatDau)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS PhanCongLamViec;
CREATE TABLE PhanCongLamViec (
    MaPCLV          INT AUTO_INCREMENT PRIMARY KEY,
    MaNV            INT NOT NULL,
    MaCa            INT NOT NULL,
    VaiTroTrongCa   VARCHAR(50),
    CONSTRAINT fk_pclv_nhanvien
        FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pclv_calamviec
        FOREIGN KEY (MaCa) REFERENCES CaLamViec(MaCa)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_pclv_nv_ca UNIQUE (MaNV, MaCa)          -- tránh phân công trùng lặp
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. PHÂN HỆ BỆNH NHÂN & HỒ SƠ BỆNH ÁN
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS BenhNhan;
CREATE TABLE BenhNhan (
    MaBN            INT AUTO_INCREMENT PRIMARY KEY,
    MaTK            INT UNIQUE,
    HoTen           VARCHAR(100) NOT NULL,
    GioiTinh        ENUM('Nam','Nu','Khac') NOT NULL,
    NgaySinh        DATE NOT NULL,
    SDT             VARCHAR(15) NOT NULL,
    DiaChi          VARCHAR(255),
    CCCD            VARCHAR(12) UNIQUE,
    SoBHYT          VARCHAR(20) UNIQUE,
    NgayDangKy      DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_benhnhan_taikhoan
        FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS HoSoBenhAn;
CREATE TABLE HoSoBenhAn (
    MaHSBA          INT PRIMARY KEY,                     -- 1-1 với BenhNhan
    NhomMau         ENUM('A','B','AB','O','ChuaRo') DEFAULT 'ChuaRo',
    TienSuBenh      TEXT,
    DiUng           TEXT,
    GhiChu          TEXT,
    CONSTRAINT fk_hosobenhan_benhnhan
        FOREIGN KEY (MaHSBA) REFERENCES BenhNhan(MaBN)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. PHÂN HỆ LỊCH HẸN & KHÁM BỆNH
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS LichSuKham;
CREATE TABLE LichSuKham (
    MaLSK           INT AUTO_INCREMENT PRIMARY KEY,
    MaBN            INT NOT NULL,
    MaBS            INT NOT NULL,
    Ngay            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TrieuChung      TEXT,
    ChanDoan        TEXT,
    KetLuan         TEXT,
    CONSTRAINT fk_lichsukham_benhnhan
        FOREIGN KEY (MaBN) REFERENCES BenhNhan(MaBN)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_lichsukham_bacsi
        FOREIGN KEY (MaBS) REFERENCES BacSi(MaBS)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS LichHen;
CREATE TABLE LichHen (
    MaLH            INT AUTO_INCREMENT PRIMARY KEY,
    MaBN            INT NOT NULL,
    MaBS            INT NOT NULL,
    NgayHen         DATE NOT NULL,
    GioHen          TIME NOT NULL,
    TrangThai       ENUM('ChoXacNhan','DaXacNhan','DaKham','DaHuy') NOT NULL DEFAULT 'ChoXacNhan',
    LyDoKham        VARCHAR(255),
    CONSTRAINT fk_lichhen_benhnhan
        FOREIGN KEY (MaBN) REFERENCES BenhNhan(MaBN)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_lichhen_bacsi
        FOREIGN KEY (MaBS) REFERENCES BacSi(MaBS)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS DichVu;
CREATE TABLE DichVu (
    MaDV            INT AUTO_INCREMENT PRIMARY KEY,
    TenDichVu       VARCHAR(100) NOT NULL,
    DonGia          DECIMAL(12,2) NOT NULL,
    MaCK            INT,
    CONSTRAINT fk_dichvu_chuyenkhoa
        FOREIGN KEY (MaCK) REFERENCES ChuyenKhoa(MaCK)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_dichvu_dongia CHECK (DonGia >= 0)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS ChiTietDichVuKham;
CREATE TABLE ChiTietDichVuKham (
    MaCTDVK         INT AUTO_INCREMENT PRIMARY KEY,
    MaLSK           INT NOT NULL,
    MaDV            INT NOT NULL,
    KetQua          TEXT,
    SoLuong         INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_ctdvk_lichsukham
        FOREIGN KEY (MaLSK) REFERENCES LichSuKham(MaLSK)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ctdvk_dichvu
        FOREIGN KEY (MaDV) REFERENCES DichVu(MaDV)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_ctdvk_soluong CHECK (SoLuong > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. PHÂN HỆ ĐƠN THUỐC & KHO THUỐC
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS Thuoc;
CREATE TABLE Thuoc (
    MaThuoc         INT AUTO_INCREMENT PRIMARY KEY,
    TenThuoc        VARCHAR(150) NOT NULL,
    DonViTinh       VARCHAR(20)  NOT NULL,
    DonGia          DECIMAL(12,2) NOT NULL,
    SoLuongTon      INT NOT NULL DEFAULT 0,
    HanSuDung       DATE NOT NULL,
    NhaSanXuat      VARCHAR(100),
    CONSTRAINT chk_thuoc_dongia CHECK (DonGia >= 0),
    CONSTRAINT chk_thuoc_soluongton CHECK (SoLuongTon >= 0)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS DonThuoc;
CREATE TABLE DonThuoc (
    MaDT            INT AUTO_INCREMENT PRIMARY KEY,
    MaLSK           INT NOT NULL UNIQUE,                 -- 1-1 với LichSuKham
    NgayKe          DATE NOT NULL DEFAULT (CURRENT_DATE),
    GhiChuBacSi     TEXT,
    CONSTRAINT fk_donthuoc_lichsukham
        FOREIGN KEY (MaLSK) REFERENCES LichSuKham(MaLSK)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS ChiTietDonThuoc;
CREATE TABLE ChiTietDonThuoc (
    MaCTDT              INT AUTO_INCREMENT PRIMARY KEY,
    MaDT                INT NOT NULL,
    MaThuoc             INT NOT NULL,
    SoLuong             INT NOT NULL,
    LieuDung            VARCHAR(100),
    ThoiGianSuDung      VARCHAR(100),
    CONSTRAINT fk_ctdt_donthuoc
        FOREIGN KEY (MaDT) REFERENCES DonThuoc(MaDT)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ctdt_thuoc
        FOREIGN KEY (MaThuoc) REFERENCES Thuoc(MaThuoc)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_ctdt_dt_thuoc UNIQUE (MaDT, MaThuoc),   -- 1 thuốc chỉ xuất hiện 1 dòng/đơn
    CONSTRAINT chk_ctdt_soluong CHECK (SoLuong > 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. PHÂN HỆ HÓA ĐƠN & THANH TOÁN
-- ---------------------------------------------------------------------

DROP TABLE IF EXISTS HoaDon;
CREATE TABLE HoaDon (
    MaHD                INT AUTO_INCREMENT PRIMARY KEY,
    MaBN                INT NOT NULL,
    MaLSK               INT NOT NULL UNIQUE,             -- 1-1 với LichSuKham
    NgayLap             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TongTien            DECIMAL(14,2) NOT NULL DEFAULT 0,
    TrangThaiThanhToan  ENUM('ChuaThanhToan','DaThanhToan','DaHuy') NOT NULL DEFAULT 'ChuaThanhToan',
    PhuongThucTT        ENUM('TienMat','ChuyenKhoan','TheThanhToan','ViDienTu') NULL,
    CONSTRAINT fk_hoadon_benhnhan
        FOREIGN KEY (MaBN) REFERENCES BenhNhan(MaBN)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_hoadon_lichsukham
        FOREIGN KEY (MaLSK) REFERENCES LichSuKham(MaLSK)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_hoadon_tongtien CHECK (TongTien >= 0)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS ChiTietHoaDon;
CREATE TABLE ChiTietHoaDon (
    MaCTHD          INT AUTO_INCREMENT PRIMARY KEY,
    MaHD            INT NOT NULL,
    MaThuoc         INT NULL,
    MaDV            INT NULL,
    MaDT            INT NULL,                            -- tham chiếu phụ, chỉ để truy vết (không dùng tính tiền)
    SoLuong         INT NOT NULL,
    DonGia          DECIMAL(12,2) NOT NULL,               -- chốt giá tại thời điểm lập hóa đơn
    ThanhTien       DECIMAL(14,2) GENERATED ALWAYS AS (SoLuong * DonGia) STORED,
    CONSTRAINT fk_cthd_hoadon
        FOREIGN KEY (MaHD) REFERENCES HoaDon(MaHD)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cthd_thuoc
        FOREIGN KEY (MaThuoc) REFERENCES Thuoc(MaThuoc)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cthd_dichvu
        FOREIGN KEY (MaDV) REFERENCES DichVu(MaDV)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cthd_donthuoc
        FOREIGN KEY (MaDT) REFERENCES DonThuoc(MaDT)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_cthd_soluong CHECK (SoLuong > 0),
    CONSTRAINT chk_cthd_dongia CHECK (DonGia >= 0),
    -- Ràng buộc cốt lõi: mỗi dòng chi tiết chỉ thuộc đúng 1 loại (thuốc HOẶC dịch vụ), không cả hai, không rỗng cả hai
    CONSTRAINT chk_cthd_loaikhoanmuc CHECK (
        (MaThuoc IS NOT NULL AND MaDV IS NULL) OR
        (MaThuoc IS NULL AND MaDV IS NOT NULL)
    )
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- TRIGGER: thay thế các CHECK dùng CURDATE() (MySQL không cho phép hàm
-- không xác định trong CHECK constraint) — kiểm tra tại thời điểm ghi dữ liệu
-- =====================================================================

DELIMITER $$

-- Ngày sinh nhân viên không được ở tương lai
CREATE TRIGGER trg_nhanvien_check_ngaysinh
BEFORE INSERT ON NhanVien
FOR EACH ROW
BEGIN
    IF NEW.NgaySinh > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ngày sinh nhân viên không được ở tương lai';
    END IF;
END$$

CREATE TRIGGER trg_nhanvien_check_ngaysinh_update
BEFORE UPDATE ON NhanVien
FOR EACH ROW
BEGIN
    IF NEW.NgaySinh > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ngày sinh nhân viên không được ở tương lai';
    END IF;
END$$

-- Ngày sinh bệnh nhân không được ở tương lai
CREATE TRIGGER trg_benhnhan_check_ngaysinh
BEFORE INSERT ON BenhNhan
FOR EACH ROW
BEGIN
    IF NEW.NgaySinh > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ngày sinh bệnh nhân không được ở tương lai';
    END IF;
END$$

CREATE TRIGGER trg_benhnhan_check_ngaysinh_update
BEFORE UPDATE ON BenhNhan
FOR EACH ROW
BEGIN
    IF NEW.NgaySinh > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ngày sinh bệnh nhân không được ở tương lai';
    END IF;
END$$

-- Ngày hẹn không được ở quá khứ
CREATE TRIGGER trg_lichhen_check_ngay
BEFORE INSERT ON LichHen
FOR EACH ROW
BEGIN
    IF NEW.NgayHen < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ngày hẹn không được là ngày trong quá khứ';
    END IF;
END$$

CREATE TRIGGER trg_lichhen_check_ngay_update
BEFORE UPDATE ON LichHen
FOR EACH ROW
BEGIN
    IF NEW.NgayHen < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Ngày hẹn không được là ngày trong quá khứ';
    END IF;
END$$

-- Tự động cập nhật TongTien của HoaDon sau khi thêm/sửa/xóa ChiTietHoaDon
CREATE TRIGGER trg_cthd_after_insert
AFTER INSERT ON ChiTietHoaDon
FOR EACH ROW
BEGIN
    UPDATE HoaDon
    SET TongTien = (SELECT COALESCE(SUM(ThanhTien),0) FROM ChiTietHoaDon WHERE MaHD = NEW.MaHD)
    WHERE MaHD = NEW.MaHD;
END$$

CREATE TRIGGER trg_cthd_after_update
AFTER UPDATE ON ChiTietHoaDon
FOR EACH ROW
BEGIN
    UPDATE HoaDon
    SET TongTien = (SELECT COALESCE(SUM(ThanhTien),0) FROM ChiTietHoaDon WHERE MaHD = NEW.MaHD)
    WHERE MaHD = NEW.MaHD;
END$$

CREATE TRIGGER trg_cthd_after_delete
AFTER DELETE ON ChiTietHoaDon
FOR EACH ROW
BEGIN
    UPDATE HoaDon
    SET TongTien = (SELECT COALESCE(SUM(ThanhTien),0) FROM ChiTietHoaDon WHERE MaHD = OLD.MaHD)
    WHERE MaHD = OLD.MaHD;
END$$

DELIMITER ;
