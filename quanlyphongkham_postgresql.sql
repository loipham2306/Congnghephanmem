-- =====================================================================
-- CSDL: HỆ THỐNG QUẢN LÝ PHÒNG KHÁM (POSTGRESQL DIALECT)
-- Tương thích: PostgreSQL 12+ (Hỗ trợ UTF-8, PL/pgSQL, Generated Columns)
-- =====================================================================

-- ---------------------------------------------------------------------
-- DỌN DẸP DỮ LIỆU CŨ NẾU ĐÃ TỒN TẠI
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS ChiTietHoaDon CASCADE;
DROP TABLE IF EXISTS HoaDon CASCADE;
DROP TABLE IF EXISTS ChiTietDonThuoc CASCADE;
DROP TABLE IF EXISTS DonThuoc CASCADE;
DROP TABLE IF EXISTS Thuoc CASCADE;
DROP TABLE IF EXISTS ChiTietDichVuKham CASCADE;
DROP TABLE IF EXISTS DichVu CASCADE;
DROP TABLE IF EXISTS LichHen CASCADE;
DROP TABLE IF EXISTS LichSuKham CASCADE;
DROP TABLE IF EXISTS HoSoBenhAn CASCADE;
DROP TABLE IF EXISTS BenhNhan CASCADE;
DROP TABLE IF EXISTS PhanCongLamViec CASCADE;
DROP TABLE IF EXISTS CaLamViec CASCADE;
DROP TABLE IF EXISTS PhongKham CASCADE;
DROP TABLE IF EXISTS BacSi CASCADE;
DROP TABLE IF EXISTS NhanVien CASCADE;
DROP TABLE IF EXISTS ChuyenKhoa CASCADE;
DROP TABLE IF EXISTS TaiKhoan CASCADE;

-- Xóa các kiểu ENUM nếu đã tồn tại
DROP TYPE IF EXISTS vai_tro_enum CASCADE;
DROP TYPE IF EXISTS trang_thai_taikhoan_enum CASCADE;
DROP TYPE IF EXISTS gioi_tinh_enum CASCADE;
DROP TYPE IF EXISTS chuc_vu_enum CASCADE;
DROP TYPE IF EXISTS trang_thai_phongkham_enum CASCADE;
DROP TYPE IF EXISTS nhom_mau_enum CASCADE;
DROP TYPE IF EXISTS trang_thai_lichhen_enum CASCADE;
DROP TYPE IF EXISTS trang_thai_thanhtoan_enum CASCADE;
DROP TYPE IF EXISTS phuong_thuc_tt_enum CASCADE;

-- ---------------------------------------------------------------------
-- ĐỊNH NGHĨA CÁC KIỂU ENUM CHUYÊN BIỆT
-- ---------------------------------------------------------------------
CREATE TYPE vai_tro_enum AS ENUM ('Admin', 'BacSi', 'YTa', 'LeTan', 'BenhNhan');
CREATE TYPE trang_thai_taikhoan_enum AS ENUM ('HoatDong', 'KhoaTaiKhoan');
CREATE TYPE gioi_tinh_enum AS ENUM ('Nam', 'Nu', 'Khac');
CREATE TYPE chuc_vu_enum AS ENUM ('BacSi', 'YTa', 'LeTan', 'QuanLy');
CREATE TYPE trang_thai_phongkham_enum AS ENUM ('SanSang', 'DangSuDung', 'BaoTri');
CREATE TYPE nhom_mau_enum AS ENUM ('A', 'B', 'AB', 'O', 'ChuaRo');
CREATE TYPE trang_thai_lichhen_enum AS ENUM ('ChoXacNhan', 'DaXacNhan', 'DaKham', 'DaHuy');
CREATE TYPE trang_thai_thanhtoan_enum AS ENUM ('ChuaThanhToan', 'DaThanhToan', 'DaHuy');
CREATE TYPE phuong_thuc_tt_enum AS ENUM ('TienMat', 'ChuyenKhoan', 'TheThanhToan', 'ViDienTu');

-- ---------------------------------------------------------------------
-- 1. PHÂN HỆ TÀI KHOẢN & NHÂN SỰ
-- ---------------------------------------------------------------------

CREATE TABLE TaiKhoan (
    MaTK            SERIAL PRIMARY KEY,
    TenDangNhap     VARCHAR(50)  NOT NULL UNIQUE,
    MatKhau         VARCHAR(255) NOT NULL,              -- Lưu dạng băm bcrypt / argon2
    VaiTro          vai_tro_enum NOT NULL,
    TrangThai       trang_thai_taikhoan_enum NOT NULL DEFAULT 'HoatDong',
    NgayTao         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ChuyenKhoa (
    MaCK            SERIAL PRIMARY KEY,
    TenChuyenKhoa   VARCHAR(100) NOT NULL UNIQUE,
    MoTa            TEXT
);

CREATE TABLE NhanVien (
    MaNV            SERIAL PRIMARY KEY,
    MaTK            INT UNIQUE,                          -- 1-1, nullable
    HoTen           VARCHAR(100) NOT NULL,
    GioiTinh        gioi_tinh_enum NOT NULL,
    NgaySinh        DATE NOT NULL,
    SDT             VARCHAR(15)  NOT NULL UNIQUE,
    DiaChi          VARCHAR(255),
    ChucVu          chuc_vu_enum NOT NULL,
    NgayVaoLam      DATE NOT NULL,
    CONSTRAINT fk_nhanvien_taikhoan
        FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
        ON DELETE SET NULL ON UPDATE CASCADE
);

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
);

CREATE TABLE PhongKham (
    MaPhong         SERIAL PRIMARY KEY,
    TenPhong        VARCHAR(50) NOT NULL UNIQUE,
    MaCK            INT NOT NULL,
    TrangThai       trang_thai_phongkham_enum NOT NULL DEFAULT 'SanSang',
    CONSTRAINT fk_phongkham_chuyenkhoa
        FOREIGN KEY (MaCK) REFERENCES ChuyenKhoa(MaCK)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE CaLamViec (
    MaCa            SERIAL PRIMARY KEY,
    Ngay            DATE NOT NULL,
    GioBatDau       TIME NOT NULL,
    GioKetThuc      TIME NOT NULL,
    MaPhong         INT NOT NULL,
    CONSTRAINT fk_calamviec_phongkham
        FOREIGN KEY (MaPhong) REFERENCES PhongKham(MaPhong)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_calamviec_giolam CHECK (GioKetThuc > GioBatDau)
);

CREATE TABLE PhanCongLamViec (
    MaPCLV          SERIAL PRIMARY KEY,
    MaNV            INT NOT NULL,
    MaCa            INT NOT NULL,
    VaiTroTrongCa   VARCHAR(50),
    CONSTRAINT fk_pclv_nhanvien
        FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pclv_calamviec
        FOREIGN KEY (MaCa) REFERENCES CaLamViec(MaCa)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_pclv_nv_ca UNIQUE (MaNV, MaCa)          -- Tránh phân công trùng lặp
);

-- ---------------------------------------------------------------------
-- 2. PHÂN HỆ BỆNH NHÂN & HỒ SƠ BỆNH ÁN
-- ---------------------------------------------------------------------

CREATE TABLE BenhNhan (
    MaBN            SERIAL PRIMARY KEY,
    MaTK            INT UNIQUE,
    HoTen           VARCHAR(100) NOT NULL,
    GioiTinh        gioi_tinh_enum NOT NULL,
    NgaySinh        DATE NOT NULL,
    SDT             VARCHAR(15) NOT NULL,
    DiaChi          VARCHAR(255),
    CCCD            VARCHAR(12) UNIQUE,
    SoBHYT          VARCHAR(20) UNIQUE,
    NgayDangKy      DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_benhnhan_taikhoan
        FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE HoSoBenhAn (
    MaHSBA          INT PRIMARY KEY,                     -- 1-1 với BenhNhan
    NhomMau         nhom_mau_enum DEFAULT 'ChuaRo',
    TienSuBenh      TEXT,
    DiUng           TEXT,
    GhiChu          TEXT,
    CONSTRAINT fk_hosobenhan_benhnhan
        FOREIGN KEY (MaHSBA) REFERENCES BenhNhan(MaBN)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------------------------------------------------------------------
-- 3. PHÂN HỆ LỊCH HẸN & KHÁM BỆNH
-- ---------------------------------------------------------------------

CREATE TABLE LichSuKham (
    MaLSK           SERIAL PRIMARY KEY,
    MaBN            INT NOT NULL,
    MaBS            INT NOT NULL,
    Ngay            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TrieuChung      TEXT,
    ChanDoan        TEXT,
    KetLuan         TEXT,
    CONSTRAINT fk_lichsukham_benhnhan
        FOREIGN KEY (MaBN) REFERENCES BenhNhan(MaBN)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_lichsukham_bacsi
        FOREIGN KEY (MaBS) REFERENCES BacSi(MaBS)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE LichHen (
    MaLH            SERIAL PRIMARY KEY,
    MaBN            INT NOT NULL,
    MaBS            INT NOT NULL,
    NgayHen         DATE NOT NULL,
    GioHen          TIME NOT NULL,
    TrangThai       trang_thai_lichhen_enum NOT NULL DEFAULT 'ChoXacNhan',
    LyDoKham        VARCHAR(255),
    CONSTRAINT fk_lichhen_benhnhan
        FOREIGN KEY (MaBN) REFERENCES BenhNhan(MaBN)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_lichhen_bacsi
        FOREIGN KEY (MaBS) REFERENCES BacSi(MaBS)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE DichVu (
    MaDV            SERIAL PRIMARY KEY,
    TenDichVu       VARCHAR(100) NOT NULL,
    DonGia          NUMERIC(12,2) NOT NULL,
    MaCK            INT,
    CONSTRAINT fk_dichvu_chuyenkhoa
        FOREIGN KEY (MaCK) REFERENCES ChuyenKhoa(MaCK)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_dichvu_dongia CHECK (DonGia >= 0)
);

CREATE TABLE ChiTietDichVuKham (
    MaCTDVK         SERIAL PRIMARY KEY,
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
);

-- ---------------------------------------------------------------------
-- 4. PHÂN HỆ ĐƠN THUỐC & KHO THUỐC
-- ---------------------------------------------------------------------

CREATE TABLE Thuoc (
    MaThuoc         SERIAL PRIMARY KEY,
    TenThuoc        VARCHAR(150) NOT NULL,
    DonViTinh       VARCHAR(20)  NOT NULL,
    DonGia          NUMERIC(12,2) NOT NULL,
    SoLuongTon      INT NOT NULL DEFAULT 0,
    HanSuDung       DATE NOT NULL,
    NhaSanXuat      VARCHAR(100),
    CONSTRAINT chk_thuoc_dongia CHECK (DonGia >= 0),
    CONSTRAINT chk_thuoc_soluongton CHECK (SoLuongTon >= 0)
);

CREATE TABLE DonThuoc (
    MaDT            SERIAL PRIMARY KEY,
    MaLSK           INT NOT NULL UNIQUE,                 -- 1-1 với LichSuKham
    NgayKe          DATE NOT NULL DEFAULT CURRENT_DATE,
    GhiChuBacSi     TEXT,
    CONSTRAINT fk_donthuoc_lichsukham
        FOREIGN KEY (MaLSK) REFERENCES LichSuKham(MaLSK)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ChiTietDonThuoc (
    MaCTDT              SERIAL PRIMARY KEY,
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
    CONSTRAINT uq_ctdt_dt_thuoc UNIQUE (MaDT, MaThuoc),   -- 1 thuốc chỉ xuất hiện 1 dòng trong 1 đơn
    CONSTRAINT chk_ctdt_soluong CHECK (SoLuong > 0)
);

-- ---------------------------------------------------------------------
-- 5. PHÂN HỆ HÓA ĐƠN & THANH TOÁN
-- ---------------------------------------------------------------------

CREATE TABLE HoaDon (
    MaHD                SERIAL PRIMARY KEY,
    MaBN                INT NOT NULL,
    MaLSK               INT NOT NULL UNIQUE,             -- 1-1 với LichSuKham
    NgayLap             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TongTien            NUMERIC(14,2) NOT NULL DEFAULT 0,
    TrangThaiThanhToan  trang_thai_thanhtoan_enum NOT NULL DEFAULT 'ChuaThanhToan',
    PhuongThucTT        phuong_thuc_tt_enum NULL,
    CONSTRAINT fk_hoadon_benhnhan
        FOREIGN KEY (MaBN) REFERENCES BenhNhan(MaBN)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_hoadon_lichsukham
        FOREIGN KEY (MaLSK) REFERENCES LichSuKham(MaLSK)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_hoadon_tongtien CHECK (TongTien >= 0)
);

CREATE TABLE ChiTietHoaDon (
    MaCTHD          SERIAL PRIMARY KEY,
    MaHD            INT NOT NULL,
    MaThuoc         INT NULL,
    MaDV            INT NULL,
    MaDT            INT NULL,                            -- Tham chiếu phụ, chỉ dùng để truy vết
    SoLuong         INT NOT NULL,
    DonGia          NUMERIC(12,2) NOT NULL,               -- Chốt giá tại thời điểm lập hóa đơn
    ThanhTien       NUMERIC(14,2) GENERATED ALWAYS AS (SoLuong * DonGia) STORED,
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
    -- Ràng buộc cốt lõi: mỗi dòng chi tiết chỉ thuộc đúng 1 loại (thuốc HOẶC dịch vụ)
    CONSTRAINT chk_cthd_loaikhoanmuc CHECK (
        (MaThuoc IS NOT NULL AND MaDV IS NULL) OR
        (MaThuoc IS NULL AND MaDV IS NOT NULL)
    )
);

-- =====================================================================
-- TRIGGER FUNCTIONS & TRIGGERS (PL/PGSQL)
-- =====================================================================

-- 1. Kiểm tra ngày sinh nhân viên không được ở tương lai
CREATE OR REPLACE FUNCTION fn_check_ngaysinh_nhanvien()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.NgaySinh > CURRENT_DATE THEN
        RAISE EXCEPTION 'Ngày sinh nhân viên không được ở tương lai (NgaySinh: %)', NEW.NgaySinh;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_nhanvien_check_ngaysinh
BEFORE INSERT OR UPDATE ON NhanVien
FOR EACH ROW
EXECUTE FUNCTION fn_check_ngaysinh_nhanvien();

-- 2. Kiểm tra ngày sinh bệnh nhân không được ở tương lai
CREATE OR REPLACE FUNCTION fn_check_ngaysinh_benhnhan()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.NgaySinh > CURRENT_DATE THEN
        RAISE EXCEPTION 'Ngày sinh bệnh nhân không được ở tương lai (NgaySinh: %)', NEW.NgaySinh;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_benhnhan_check_ngaysinh
BEFORE INSERT OR UPDATE ON BenhNhan
FOR EACH ROW
EXECUTE FUNCTION fn_check_ngaysinh_benhnhan();

-- 3. Kiểm tra ngày hẹn không được là ngày trong quá khứ
CREATE OR REPLACE FUNCTION fn_check_ngay_lichhen()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.NgayHen < CURRENT_DATE THEN
        RAISE EXCEPTION 'Ngày hẹn không được là ngày trong quá khứ (NgayHen: %)', NEW.NgayHen;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lichhen_check_ngay
BEFORE INSERT OR UPDATE ON LichHen
FOR EACH ROW
EXECUTE FUNCTION fn_check_ngay_lichhen();

-- 4. Tự động tính và cập nhật TongTien của HoaDon sau khi thêm/sửa/xóa ChiTietHoaDon
CREATE OR REPLACE FUNCTION fn_update_tongtien_hoadon()
RETURNS TRIGGER AS $$
DECLARE
    v_MaHD INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_MaHD := OLD.MaHD;
    ELSE
        v_MaHD := NEW.MaHD;
    END IF;

    UPDATE HoaDon
    SET TongTien = (
        SELECT COALESCE(SUM(ThanhTien), 0)
        FROM ChiTietHoaDon
        WHERE MaHD = v_MaHD
    )
    WHERE MaHD = v_MaHD;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cthd_update_tongtien
AFTER INSERT OR UPDATE OR DELETE ON ChiTietHoaDon
FOR EACH ROW
EXECUTE FUNCTION fn_update_tongtien_hoadon();
