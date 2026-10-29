-- Thêm trạng thái DaTiepDon trước khi migration nâng cấp sử dụng giá trị này.
ALTER TYPE "trang_thai_lichhen_enum" ADD VALUE IF NOT EXISTS 'DaTiepDon' AFTER 'DaXacNhan';
