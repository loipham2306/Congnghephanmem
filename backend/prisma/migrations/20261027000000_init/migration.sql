-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "chuc_vu_enum" AS ENUM ('BacSi', 'YTa', 'LeTan', 'QuanLy');

-- CreateEnum
CREATE TYPE "gioi_tinh_enum" AS ENUM ('Nam', 'Nu', 'Khac');

-- CreateEnum
CREATE TYPE "nhom_mau_enum" AS ENUM ('A', 'B', 'AB', 'O', 'ChuaRo');

-- CreateEnum
CREATE TYPE "phuong_thuc_tt_enum" AS ENUM ('TienMat', 'ChuyenKhoan', 'TheThanhToan', 'ViDienTu');

-- CreateEnum
CREATE TYPE "trang_thai_lichhen_enum" AS ENUM ('ChoXacNhan', 'DaXacNhan', 'DaTiepDon', 'DaKham', 'DaHuy');

-- CreateEnum
CREATE TYPE "trang_thai_phongkham_enum" AS ENUM ('SanSang', 'DangSuDung', 'BaoTri');

-- CreateEnum
CREATE TYPE "trang_thai_taikhoan_enum" AS ENUM ('HoatDong', 'KhoaTaiKhoan');

-- CreateEnum
CREATE TYPE "trang_thai_thanhtoan_enum" AS ENUM ('ChuaThanhToan', 'DaThanhToan', 'DaHuy');

-- CreateEnum
CREATE TYPE "vai_tro_enum" AS ENUM ('Admin', 'BacSi', 'YTa', 'LeTan', 'BenhNhan');

-- CreateTable
CREATE TABLE "bacsi" (
    "mabs" INTEGER NOT NULL,
    "mack" INTEGER NOT NULL,
    "sogiayphephanhnghe" VARCHAR(50) NOT NULL,
    "hocham" VARCHAR(50),
    "kinhnghiem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bacsi_pkey" PRIMARY KEY ("mabs")
);

-- CreateTable
CREATE TABLE "benhnhan" (
    "mabn" SERIAL NOT NULL,
    "matk" INTEGER,
    "hoten" VARCHAR(100) NOT NULL,
    "gioitinh" "gioi_tinh_enum" NOT NULL,
    "ngaysinh" DATE NOT NULL,
    "sdt" VARCHAR(15) NOT NULL,
    "diachi" VARCHAR(255),
    "cccd" VARCHAR(12),
    "sobhyt" VARCHAR(20),
    "ngaydangky" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "benhnhan_pkey" PRIMARY KEY ("mabn")
);

-- CreateTable
CREATE TABLE "calamviec" (
    "maca" SERIAL NOT NULL,
    "ngay" DATE NOT NULL,
    "giobatdau" TIME(6) NOT NULL,
    "gioketthuc" TIME(6) NOT NULL,
    "maphong" INTEGER NOT NULL,

    CONSTRAINT "calamviec_pkey" PRIMARY KEY ("maca")
);

-- CreateTable
CREATE TABLE "chitietdichvukham" (
    "mactdvk" SERIAL NOT NULL,
    "malsk" INTEGER NOT NULL,
    "madv" INTEGER NOT NULL,
    "ketqua" TEXT,
    "soluong" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "chitietdichvukham_pkey" PRIMARY KEY ("mactdvk")
);

-- CreateTable
CREATE TABLE "chitietdonthuoc" (
    "mactdt" SERIAL NOT NULL,
    "madt" INTEGER NOT NULL,
    "mathuoc" INTEGER NOT NULL,
    "soluong" INTEGER NOT NULL,
    "lieudung" VARCHAR(100),
    "thoigiansudung" VARCHAR(100),

    CONSTRAINT "chitietdonthuoc_pkey" PRIMARY KEY ("mactdt")
);

-- CreateTable
CREATE TABLE "chitiethoadon" (
    "macthd" SERIAL NOT NULL,
    "mahd" INTEGER NOT NULL,
    "mathuoc" INTEGER,
    "madv" INTEGER,
    "madt" INTEGER,
    "soluong" INTEGER NOT NULL,
    "dongia" DECIMAL(12,2) NOT NULL,
    "thanhtien" DECIMAL(14,2) GENERATED ALWAYS AS ((soluong)::numeric * dongia) STORED,

    CONSTRAINT "chitiethoadon_pkey" PRIMARY KEY ("macthd")
);

-- CreateTable
CREATE TABLE "chuyenkhoa" (
    "mack" SERIAL NOT NULL,
    "tenchuyenkhoa" VARCHAR(100) NOT NULL,
    "mota" TEXT,

    CONSTRAINT "chuyenkhoa_pkey" PRIMARY KEY ("mack")
);

-- CreateTable
CREATE TABLE "dichvu" (
    "madv" SERIAL NOT NULL,
    "tendichvu" VARCHAR(100) NOT NULL,
    "dongia" DECIMAL(12,2) NOT NULL,
    "mack" INTEGER,

    CONSTRAINT "dichvu_pkey" PRIMARY KEY ("madv")
);

-- CreateTable
CREATE TABLE "donthuoc" (
    "madt" SERIAL NOT NULL,
    "malsk" INTEGER NOT NULL,
    "ngayke" DATE NOT NULL DEFAULT CURRENT_DATE,
    "ghichubacsi" TEXT,

    CONSTRAINT "donthuoc_pkey" PRIMARY KEY ("madt")
);

-- CreateTable
CREATE TABLE "hoadon" (
    "mahd" SERIAL NOT NULL,
    "mabn" INTEGER NOT NULL,
    "malsk" INTEGER NOT NULL,
    "ngaylap" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngaythanhtoan" TIMESTAMP(6),
    "tongtien" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "trangthaithanhtoan" "trang_thai_thanhtoan_enum" NOT NULL DEFAULT 'ChuaThanhToan',
    "phuongthuctt" "phuong_thuc_tt_enum",

    CONSTRAINT "hoadon_pkey" PRIMARY KEY ("mahd")
);

-- CreateTable
CREATE TABLE "hosobenhan" (
    "mahsba" INTEGER NOT NULL,
    "nhommau" "nhom_mau_enum" DEFAULT 'ChuaRo',
    "tiensubenh" TEXT,
    "diung" TEXT,
    "ghichu" TEXT,

    CONSTRAINT "hosobenhan_pkey" PRIMARY KEY ("mahsba")
);

-- CreateTable
CREATE TABLE "lichhen" (
    "malh" SERIAL NOT NULL,
    "mabn" INTEGER NOT NULL,
    "mabs" INTEGER NOT NULL,
    "ngayhen" DATE NOT NULL,
    "giohen" TIME(6) NOT NULL,
    "trangthai" "trang_thai_lichhen_enum" NOT NULL DEFAULT 'ChoXacNhan',
    "lydokham" VARCHAR(255),
    "lydohuy" VARCHAR(255),
    "thoigianhuy" TIMESTAMP(6),
    "thoigiantiepdon" TIMESTAMP(6),
    "sohangcho" INTEGER,

    CONSTRAINT "lichhen_pkey" PRIMARY KEY ("malh")
);

-- CreateTable
CREATE TABLE "lichsukham" (
    "malsk" SERIAL NOT NULL,
    "mabn" INTEGER NOT NULL,
    "mabs" INTEGER NOT NULL,
    "malh" INTEGER,
    "ngay" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trieuchung" TEXT,
    "chandoan" TEXT,
    "ketluan" TEXT,

    CONSTRAINT "lichsukham_pkey" PRIMARY KEY ("malsk")
);

-- CreateTable
CREATE TABLE "nhanvien" (
    "manv" SERIAL NOT NULL,
    "matk" INTEGER,
    "hoten" VARCHAR(100) NOT NULL,
    "gioitinh" "gioi_tinh_enum" NOT NULL,
    "ngaysinh" DATE NOT NULL,
    "sdt" VARCHAR(15) NOT NULL,
    "diachi" VARCHAR(255),
    "chucvu" "chuc_vu_enum" NOT NULL,
    "ngayvaolam" DATE NOT NULL,

    CONSTRAINT "nhanvien_pkey" PRIMARY KEY ("manv")
);

-- CreateTable
CREATE TABLE "phanconglamviec" (
    "mapclv" SERIAL NOT NULL,
    "manv" INTEGER NOT NULL,
    "maca" INTEGER NOT NULL,
    "vaitrotrongca" VARCHAR(50),

    CONSTRAINT "phanconglamviec_pkey" PRIMARY KEY ("mapclv")
);

-- CreateTable
CREATE TABLE "phongkham" (
    "maphong" SERIAL NOT NULL,
    "tenphong" VARCHAR(50) NOT NULL,
    "mack" INTEGER NOT NULL,
    "trangthai" "trang_thai_phongkham_enum" NOT NULL DEFAULT 'SanSang',

    CONSTRAINT "phongkham_pkey" PRIMARY KEY ("maphong")
);

-- CreateTable
CREATE TABLE "taikhoan" (
    "matk" SERIAL NOT NULL,
    "tendangnhap" VARCHAR(50) NOT NULL,
    "matkhau" VARCHAR(255) NOT NULL,
    "vaitro" "vai_tro_enum" NOT NULL,
    "trangthai" "trang_thai_taikhoan_enum" NOT NULL DEFAULT 'HoatDong',
    "ngaytao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taikhoan_pkey" PRIMARY KEY ("matk")
);

-- CreateTable
CREATE TABLE "thuoc" (
    "mathuoc" SERIAL NOT NULL,
    "tenthuoc" VARCHAR(150) NOT NULL,
    "donvitinh" VARCHAR(20) NOT NULL,
    "dongia" DECIMAL(12,2) NOT NULL,
    "soluongton" INTEGER NOT NULL DEFAULT 0,
    "hansudung" DATE NOT NULL,
    "nhasanxuat" VARCHAR(100),

    CONSTRAINT "thuoc_pkey" PRIMARY KEY ("mathuoc")
);

-- CreateTable
CREATE TABLE "hoantien" (
    "maht" SERIAL NOT NULL,
    "mahd" INTEGER NOT NULL,
    "matk" INTEGER,
    "sotien" DECIMAL(14,2) NOT NULL,
    "lydo" VARCHAR(255) NOT NULL,
    "phuongthuc" "phuong_thuc_tt_enum",
    "ngaytao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hoantien_pkey" PRIMARY KEY ("maht")
);

-- CreateTable
CREATE TABLE "refresh_token" (
    "mrt" SERIAL NOT NULL,
    "matk" INTEGER NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "revoked_at" TIMESTAMP(6),
    "replaced_by_hash" VARCHAR(64),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("mrt")
);

-- CreateTable
CREATE TABLE "password_reset" (
    "mpr" SERIAL NOT NULL,
    "matk" INTEGER NOT NULL,
    "otp_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "used_at" TIMESTAMP(6),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("mpr")
);

-- CreateTable
CREATE TABLE "nhatky" (
    "mank" SERIAL NOT NULL,
    "matk" INTEGER,
    "hanhdong" VARCHAR(50) NOT NULL,
    "doituong" VARCHAR(50) NOT NULL,
    "doituongId" INTEGER,
    "dulieutruoc" JSONB,
    "dulieusau" JSONB,
    "ip" VARCHAR(45),
    "thoidiem" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nhatky_pkey" PRIMARY KEY ("mank")
);

-- CreateIndex
CREATE UNIQUE INDEX "bacsi_sogiayphephanhnghe_key" ON "bacsi"("sogiayphephanhnghe");

-- CreateIndex
CREATE UNIQUE INDEX "benhnhan_matk_key" ON "benhnhan"("matk");

-- CreateIndex
CREATE UNIQUE INDEX "benhnhan_cccd_key" ON "benhnhan"("cccd");

-- CreateIndex
CREATE UNIQUE INDEX "benhnhan_sobhyt_key" ON "benhnhan"("sobhyt");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ctdt_dt_thuoc" ON "chitietdonthuoc"("madt", "mathuoc");

-- CreateIndex
CREATE UNIQUE INDEX "chuyenkhoa_tenchuyenkhoa_key" ON "chuyenkhoa"("tenchuyenkhoa");

-- CreateIndex
CREATE UNIQUE INDEX "donthuoc_malsk_key" ON "donthuoc"("malsk");

-- CreateIndex
CREATE UNIQUE INDEX "hoadon_malsk_key" ON "hoadon"("malsk");

-- CreateIndex
CREATE INDEX "hoadon_ngaythanhtoan_idx" ON "hoadon"("ngaythanhtoan");

-- CreateIndex
CREATE INDEX "hoadon_trangthaithanhtoan_idx" ON "hoadon"("trangthaithanhtoan");

-- CreateIndex
CREATE INDEX "lichhen_ngayhen_idx" ON "lichhen"("ngayhen");

-- CreateIndex
CREATE INDEX "lichhen_mabs_ngayhen_idx" ON "lichhen"("mabs", "ngayhen");

-- CreateIndex
CREATE INDEX "lichhen_mabn_ngayhen_idx" ON "lichhen"("mabn", "ngayhen");

-- CreateIndex
CREATE UNIQUE INDEX "lichsukham_malh_key" ON "lichsukham"("malh");

-- CreateIndex
CREATE INDEX "lichsukham_ngay_idx" ON "lichsukham"("ngay");

-- CreateIndex
CREATE UNIQUE INDEX "nhanvien_matk_key" ON "nhanvien"("matk");

-- CreateIndex
CREATE UNIQUE INDEX "nhanvien_sdt_key" ON "nhanvien"("sdt");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pclv_nv_ca" ON "phanconglamviec"("manv", "maca");

-- CreateIndex
CREATE UNIQUE INDEX "phongkham_tenphong_key" ON "phongkham"("tenphong");

-- CreateIndex
CREATE UNIQUE INDEX "taikhoan_tendangnhap_key" ON "taikhoan"("tendangnhap");

-- CreateIndex
CREATE INDEX "hoantien_mahd_idx" ON "hoantien"("mahd");

-- CreateIndex
CREATE INDEX "hoantien_ngaytao_idx" ON "hoantien"("ngaytao");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_matk_idx" ON "refresh_token"("matk");

-- CreateIndex
CREATE INDEX "refresh_token_expires_at_idx" ON "refresh_token"("expires_at");

-- CreateIndex
CREATE INDEX "password_reset_matk_idx" ON "password_reset"("matk");

-- CreateIndex
CREATE INDEX "password_reset_expires_at_idx" ON "password_reset"("expires_at");

-- CreateIndex
CREATE INDEX "nhatky_thoidiem_idx" ON "nhatky"("thoidiem");

-- CreateIndex
CREATE INDEX "nhatky_doituong_doituongId_idx" ON "nhatky"("doituong", "doituongId");

-- AddForeignKey
ALTER TABLE "bacsi" ADD CONSTRAINT "fk_bacsi_chuyenkhoa" FOREIGN KEY ("mack") REFERENCES "chuyenkhoa"("mack") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bacsi" ADD CONSTRAINT "fk_bacsi_nhanvien" FOREIGN KEY ("mabs") REFERENCES "nhanvien"("manv") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benhnhan" ADD CONSTRAINT "fk_benhnhan_taikhoan" FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calamviec" ADD CONSTRAINT "fk_calamviec_phongkham" FOREIGN KEY ("maphong") REFERENCES "phongkham"("maphong") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitietdichvukham" ADD CONSTRAINT "fk_ctdvk_dichvu" FOREIGN KEY ("madv") REFERENCES "dichvu"("madv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitietdichvukham" ADD CONSTRAINT "fk_ctdvk_lichsukham" FOREIGN KEY ("malsk") REFERENCES "lichsukham"("malsk") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitietdonthuoc" ADD CONSTRAINT "fk_ctdt_donthuoc" FOREIGN KEY ("madt") REFERENCES "donthuoc"("madt") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitietdonthuoc" ADD CONSTRAINT "fk_ctdt_thuoc" FOREIGN KEY ("mathuoc") REFERENCES "thuoc"("mathuoc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitiethoadon" ADD CONSTRAINT "fk_cthd_dichvu" FOREIGN KEY ("madv") REFERENCES "dichvu"("madv") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitiethoadon" ADD CONSTRAINT "fk_cthd_donthuoc" FOREIGN KEY ("madt") REFERENCES "donthuoc"("madt") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitiethoadon" ADD CONSTRAINT "fk_cthd_hoadon" FOREIGN KEY ("mahd") REFERENCES "hoadon"("mahd") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chitiethoadon" ADD CONSTRAINT "fk_cthd_thuoc" FOREIGN KEY ("mathuoc") REFERENCES "thuoc"("mathuoc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dichvu" ADD CONSTRAINT "fk_dichvu_chuyenkhoa" FOREIGN KEY ("mack") REFERENCES "chuyenkhoa"("mack") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donthuoc" ADD CONSTRAINT "fk_donthuoc_lichsukham" FOREIGN KEY ("malsk") REFERENCES "lichsukham"("malsk") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoadon" ADD CONSTRAINT "fk_hoadon_benhnhan" FOREIGN KEY ("mabn") REFERENCES "benhnhan"("mabn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoadon" ADD CONSTRAINT "fk_hoadon_lichsukham" FOREIGN KEY ("malsk") REFERENCES "lichsukham"("malsk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hosobenhan" ADD CONSTRAINT "fk_hosobenhan_benhnhan" FOREIGN KEY ("mahsba") REFERENCES "benhnhan"("mabn") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichhen" ADD CONSTRAINT "fk_lichhen_bacsi" FOREIGN KEY ("mabs") REFERENCES "bacsi"("mabs") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichhen" ADD CONSTRAINT "fk_lichhen_benhnhan" FOREIGN KEY ("mabn") REFERENCES "benhnhan"("mabn") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichsukham" ADD CONSTRAINT "fk_lichsukham_bacsi" FOREIGN KEY ("mabs") REFERENCES "bacsi"("mabs") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichsukham" ADD CONSTRAINT "fk_lichsukham_benhnhan" FOREIGN KEY ("mabn") REFERENCES "benhnhan"("mabn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lichsukham" ADD CONSTRAINT "fk_lichsukham_lichhen" FOREIGN KEY ("malh") REFERENCES "lichhen"("malh") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhanvien" ADD CONSTRAINT "fk_nhanvien_taikhoan" FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phanconglamviec" ADD CONSTRAINT "fk_pclv_calamviec" FOREIGN KEY ("maca") REFERENCES "calamviec"("maca") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phanconglamviec" ADD CONSTRAINT "fk_pclv_nhanvien" FOREIGN KEY ("manv") REFERENCES "nhanvien"("manv") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phongkham" ADD CONSTRAINT "fk_phongkham_chuyenkhoa" FOREIGN KEY ("mack") REFERENCES "chuyenkhoa"("mack") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoantien" ADD CONSTRAINT "fk_hoantien_hoadon" FOREIGN KEY ("mahd") REFERENCES "hoadon"("mahd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoantien" ADD CONSTRAINT "fk_hoantien_taikhoan" FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "fk_refresh_token_taikhoan" FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "fk_password_reset_taikhoan" FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhatky" ADD CONSTRAINT "fk_nhatky_taikhoan" FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================================
-- BỔ SUNG: TRIGGER TÍNH TIỀN & RÀNG BUỘC CHỐNG TRÙNG SLOT
-- ========================================================

CREATE OR REPLACE FUNCTION fn_update_tongtien_hoadon()
RETURNS TRIGGER AS $$
DECLARE
    v_mahd INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_mahd := OLD."mahd";
    ELSE
        v_mahd := NEW."mahd";
    END IF;

    UPDATE "hoadon"
    SET "tongtien" = (
        SELECT COALESCE(SUM(COALESCE("thanhtien", "soluong" * "dongia")), 0)
        FROM "chitiethoadon"
        WHERE "mahd" = v_mahd
    )
    WHERE "mahd" = v_mahd;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cthd_update_tongtien ON "chitiethoadon";
CREATE TRIGGER trg_cthd_update_tongtien
AFTER INSERT OR UPDATE OR DELETE ON "chitiethoadon"
FOR EACH ROW
EXECUTE FUNCTION fn_update_tongtien_hoadon();

-- Chỉ các lịch còn giữ chỗ mới tham gia ràng buộc duy nhất.
CREATE UNIQUE INDEX IF NOT EXISTS uq_lichhen_bacsi_slot_active
ON "lichhen" ("mabs", "ngayhen", "giohen")
WHERE "trangthai" IN ('ChoXacNhan'::trang_thai_lichhen_enum, 'DaXacNhan'::trang_thai_lichhen_enum, 'DaTiepDon'::trang_thai_lichhen_enum);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lichhen_benhnhan_slot_active
ON "lichhen" ("mabn", "ngayhen", "giohen")
WHERE "trangthai" IN ('ChoXacNhan'::trang_thai_lichhen_enum, 'DaXacNhan'::trang_thai_lichhen_enum, 'DaTiepDon'::trang_thai_lichhen_enum);

ALTER TABLE "hoantien" DROP CONSTRAINT IF EXISTS chk_hoantien_sotien_duong;
ALTER TABLE "hoantien" ADD CONSTRAINT chk_hoantien_sotien_duong CHECK ("sotien" > 0);

-- Số thứ tự hàng chờ không trùng trong cùng ngày/bác sĩ.
CREATE UNIQUE INDEX IF NOT EXISTS uq_lichhen_ngay_bacsi_sohangcho
ON "lichhen" ("ngayhen", "mabs", "sohangcho")
WHERE "sohangcho" IS NOT NULL;
