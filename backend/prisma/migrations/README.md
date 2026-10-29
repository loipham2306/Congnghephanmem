# Hướng dẫn migration CSDL

## 1. Vì sao chỉ có một migration `20261027000000_init`?

Trước đây dự án chưa có thư mục `prisma/migrations`; schema được đẩy bằng `prisma db push`.
Migration baseline này được sinh từ `prisma/schema.prisma` hiện tại, sau đó bổ sung thủ công:

- Trigger `trg_cthd_update_tongtien` tính lại `hoadon.tongtien`.
- Unique index chống trùng slot theo bác sĩ/bệnh nhân (chỉ áp dụng cho lịch còn giữ chỗ).
- Unique index chống trùng số thứ tự hàng chờ.
- Check constraint `hoantien.sotien > 0`.

Tên bảng/cột trong migration là **chữ thường** (`hoadon`, `chitiethoadon`, `mahd`, `dongia`...),
khớp với cách Prisma đặt tên mặc định (schema không dùng `@@map`).

> **Lưu ý quan trọng:** cột `chitiethoadon.thanhtien` phải là cột generated:
> `GENERATED ALWAYS AS ((soluong)::numeric * dongia) STORED`.
> `prisma migrate diff` có thể sinh nhầm `DEFAULT ((soluong)::numeric * dongia)` và PostgreSQL sẽ báo
> `cannot use column reference in DEFAULT expression`. Nếu sinh lại migration, kiểm tra và sửa dòng này trước khi chạy.

## 2. Cài đặt trên CSDL mới

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run db:check-trigger
```

## 3. Cài đặt trên CSDL đang có dữ liệu

> Bắt buộc sao lưu trước khi chạy. Nên thử trên bản clone.

1. Kiểm tra tên bảng thực tế:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

2. Nếu bảng đang là PascalCase (`HoaDon`, `ChiTietHoaDon`...), **không chạy migration này trực tiếp**.
   Code hiện tại dùng tên bảng chữ thường. Cần một migration đổi tên bảng/cột (hoặc tạo schema lowercase mới rồi copy dữ liệu) trước khi đánh dấu baseline; không thể chỉ `migrate resolve` vì code sẽ không tìm thấy bảng.

3. Với DB đã có bảng chữ thường, tạo **migration nâng cấp** từ DB thật lên schema hiện tại:

```bash
npx prisma migrate diff \
  --from-url "$DIRECT_URL" \
  --to-schema prisma/schema.prisma \
  --script -o prisma/migrations/20261027000100_upgrade_existing/migration.sql
```

Mở file vừa sinh và kiểm tra:
- Có đủ bảng mới `hoantien`, `refresh_token`, `password_reset`, `nhatky`; cột mới `lichhen.lydohuy`, `hoadon.ngaythanhtoan`, `lichsukham.malh`...
- **Không** có lệnh `DROP TABLE`/`DROP COLUMN` ngoài ý muốn.
- Bổ sung thủ công các object mà Prisma không sinh: trigger `trg_cthd_update_tongtien`, function `fn_update_tongtien_hoadon()`, 3 unique index chống trùng/hàng chờ, check constraint `hoantien.sotien > 0`. Có thể copy các block tương ứng từ `20261027000000_init/migration.sql`.
- Nếu `chitiethoadon.thanhtien` đã là cột generated thì **không sửa**; nếu chưa, dùng `GENERATED ALWAYS AS ... STORED` như mục 1.

4. Kiểm tra dữ liệu trùng slot trước khi tạo unique index:

```sql
SELECT mabs, ngayhen, giohen, COUNT(*)
FROM lichhen
WHERE trangthai IN ('ChoXacNhan', 'DaXacNhan', 'DaTiepDon')
GROUP BY mabs, ngayhen, giohen
HAVING COUNT(*) > 1;
```

Nếu có kết quả, xử lý (đổi giờ/hủy) trước khi chạy migration, nếu không unique index sẽ fail.

5. Đánh dấu baseline đã tồn tại, rồi để Prisma áp dụng migration nâng cấp:

```bash
npx prisma migrate resolve --applied 20261027000000_init
npx prisma migrate deploy
npm run db:check-trigger
```

> Không chạy `migrate resolve` cho `20261027000100_upgrade_existing` trước khi thực sự chạy SQL. Nếu chỉ resolve baseline mà không chạy migration nâng cấp, code mới sẽ lỗi vì thiếu bảng/cột.

## 4. Kiểm tra sau deploy

```bash
npm run db:check-trigger
curl http://localhost:5000/api/health/db
```

Kết quả mong đợi: `database`, `triggerTinhTien`, `slotIndexes` đều `true`.
