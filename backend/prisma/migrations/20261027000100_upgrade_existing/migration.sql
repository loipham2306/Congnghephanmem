-- Upgrade an existing database to the current schema.
-- This migration is idempotent so a fresh database can also apply the full
-- migration chain (the baseline already contains the final schema).

-- AlterTable
ALTER TABLE "hoadon" ADD COLUMN IF NOT EXISTS "ngaythanhtoan" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "lichhen" ADD COLUMN IF NOT EXISTS "lydohuy" VARCHAR(255);
ALTER TABLE "lichhen" ADD COLUMN IF NOT EXISTS "sohangcho" INTEGER;
ALTER TABLE "lichhen" ADD COLUMN IF NOT EXISTS "thoigianhuy" TIMESTAMP(6);
ALTER TABLE "lichhen" ADD COLUMN IF NOT EXISTS "thoigiantiepdon" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "lichsukham" ADD COLUMN IF NOT EXISTS "malh" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "hoantien" (
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
CREATE TABLE IF NOT EXISTS "refresh_token" (
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
CREATE TABLE IF NOT EXISTS "password_reset" (
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
CREATE TABLE IF NOT EXISTS "nhatky" (
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
CREATE INDEX IF NOT EXISTS "hoantien_mahd_idx" ON "hoantien"("mahd");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hoantien_ngaytao_idx" ON "hoantien"("ngaytao");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_token_token_hash_key" ON "refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "refresh_token_matk_idx" ON "refresh_token"("matk");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "refresh_token_expires_at_idx" ON "refresh_token"("expires_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "password_reset_matk_idx" ON "password_reset"("matk");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "password_reset_expires_at_idx" ON "password_reset"("expires_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "nhatky_thoidiem_idx" ON "nhatky"("thoidiem");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "nhatky_doituong_doituongId_idx" ON "nhatky"("doituong", "doituongId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hoadon_ngaythanhtoan_idx" ON "hoadon"("ngaythanhtoan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "hoadon_trangthaithanhtoan_idx" ON "hoadon"("trangthaithanhtoan");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lichhen_ngayhen_idx" ON "lichhen"("ngayhen");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lichhen_mabs_ngayhen_idx" ON "lichhen"("mabs", "ngayhen");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lichhen_mabn_ngayhen_idx" ON "lichhen"("mabn", "ngayhen");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lichsukham_malh_key" ON "lichsukham"("malh");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lichsukham_ngay_idx" ON "lichsukham"("ngay");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_lichsukham_lichhen'
          AND conrelid = 'public.lichsukham'::regclass
    ) THEN
        ALTER TABLE "lichsukham"
        ADD CONSTRAINT "fk_lichsukham_lichhen"
        FOREIGN KEY ("malh") REFERENCES "lichhen"("malh")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_hoantien_hoadon'
          AND conrelid = 'public.hoantien'::regclass
    ) THEN
        ALTER TABLE "hoantien"
        ADD CONSTRAINT "fk_hoantien_hoadon"
        FOREIGN KEY ("mahd") REFERENCES "hoadon"("mahd")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_hoantien_taikhoan'
          AND conrelid = 'public.hoantien'::regclass
    ) THEN
        ALTER TABLE "hoantien"
        ADD CONSTRAINT "fk_hoantien_taikhoan"
        FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_refresh_token_taikhoan'
          AND conrelid = 'public.refresh_token'::regclass
    ) THEN
        ALTER TABLE "refresh_token"
        ADD CONSTRAINT "fk_refresh_token_taikhoan"
        FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_password_reset_taikhoan'
          AND conrelid = 'public.password_reset'::regclass
    ) THEN
        ALTER TABLE "password_reset"
        ADD CONSTRAINT "fk_password_reset_taikhoan"
        FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_nhatky_taikhoan'
          AND conrelid = 'public.nhatky'::regclass
    ) THEN
        ALTER TABLE "nhatky"
        ADD CONSTRAINT "fk_nhatky_taikhoan"
        FOREIGN KEY ("matk") REFERENCES "taikhoan"("matk")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- ========================================================
-- Manual constraints/indexes for an existing database.
-- Prisma does not generate partial indexes or check constraints.
-- ========================================================

-- Prevent duplicate doctor slots for active appointments.
CREATE UNIQUE INDEX IF NOT EXISTS uq_lichhen_bacsi_slot_active
ON "lichhen" ("mabs", "ngayhen", "giohen")
WHERE "trangthai" IN (
    'ChoXacNhan'::trang_thai_lichhen_enum,
    'DaXacNhan'::trang_thai_lichhen_enum,
    'DaTiepDon'::trang_thai_lichhen_enum
);

-- Prevent duplicate patient slots for active appointments.
CREATE UNIQUE INDEX IF NOT EXISTS uq_lichhen_benhnhan_slot_active
ON "lichhen" ("mabn", "ngayhen", "giohen")
WHERE "trangthai" IN (
    'ChoXacNhan'::trang_thai_lichhen_enum,
    'DaXacNhan'::trang_thai_lichhen_enum,
    'DaTiepDon'::trang_thai_lichhen_enum
);

-- Queue numbers must be unique per day and doctor.
CREATE UNIQUE INDEX IF NOT EXISTS uq_lichhen_ngay_bacsi_sohangcho
ON "lichhen" ("ngayhen", "mabs", "sohangcho")
WHERE "sohangcho" IS NOT NULL;

-- Refund amount must be positive.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_hoantien_sotien_duong'
          AND conrelid = 'public.hoantien'::regclass
    ) THEN
        ALTER TABLE "hoantien"
        ADD CONSTRAINT chk_hoantien_sotien_duong CHECK ("sotien" > 0);
    END IF;
END $$;

-- Backfill payment date for old paid invoices.
UPDATE "hoadon"
SET "ngaythanhtoan" = "ngaylap"
WHERE "trangthaithanhtoan" = 'DaThanhToan'
  AND "ngaythanhtoan" IS NULL;
