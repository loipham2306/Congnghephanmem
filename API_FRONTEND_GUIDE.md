# 📋 TÀI LIỆU TÍCH HỢP API BACKEND CHO FRONTEND
> **Hệ Thống Quản Lý Phòng Khám (Clinic Management System)**  
> **Cập nhật ngày:** 09/10/2026 | **Phiên bản API:** v1.0.0

---

## 📌 1. THÔNG TIN KẾT NỐI CHUNG (GENERAL CONFIG)

* **Base URL (Localhost):** `http://localhost:5000`
* **Base URL (Vercel Production):** `https://backendapiqlpk.vercel.app` *(hoặc domain Vercel nhóm đã deploy)*
* **Quy chuẩn gửi dữ liệu:** 
  * Header bắt buộc cho tất cả request gửi dữ liệu: `Content-Type: application/json`
  * Với các API yêu cầu đăng nhập, đính kèm token vào Header:
    ```http
    Authorization: Bearer <accessToken>
    ```

---

## 📦 2. QUY CHUẨN ĐỊNH DẠNG DỮ LIỆU (RESPONSE FORMAT)

### 🟢 Thành công (HTTP Status 200 / 201)
```json
{
  "success": true,
  "message": "Thông báo kết quả thành công",
  "data": { ... } // hoặc thông tin đối tượng trả về
}
```

### 🔴 Thất bại / Lỗi (HTTP Status 400 / 401 / 403 / 404 / 500)
```json
{
  "success": false,
  "message": "Nội dung thông báo lỗi cụ thể để Frontend hiển thị toast/alert"
}
```

---

## 🔐 3. PHÂN HỆ XÁC THỰC & TÀI KHOẢN (`/api/auth`)

### 3.1. Đăng ký tài khoản Bệnh nhân mới
* **Endpoint:** `POST /api/auth/register`
* **Quyền:** Public (Không cần token)
* **Request Body:**
```json
{
  "username": "nguyenvanan",
  "password": "Password123@",
  "hoten": "Nguyễn Văn An",
  "gioitinh": "Nam",        // "Nam" | "Nu" | "Khac"
  "ngaysinh": "2000-01-15", // Định dạng YYYY-MM-DD
  "sdt": "0912345678"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công!",
  "data": {
    "account": {
      "matk": 1,
      "tendangnhap": "nguyenvanan",
      "vaitro": "BenhNhan",
      "trangthai": "HoatDong"
    },
    "patient": {
      "mabn": 1,
      "hoten": "Nguyễn Văn An",
      "gioitinh": "Nam",
      "sdt": "0912345678"
    }
  }
}
```

---

### 3.2. Đăng nhập hệ thống
* **Endpoint:** `POST /api/auth/login`
* **Quyền:** Public
* **Request Body:**
```json
{
  "username": "nguyenvanan",
  "password": "Password123@"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "matk": 1,
    "tendangnhap": "nguyenvanan",
    "vaitro": "BenhNhan",
    "mabn": 1 // Mã bệnh nhân (nếu role là BenhNhan)
  }
}
```
> **💡 Lưu ý cho Frontend:** 
> Lưu `accessToken` vào `localStorage` hoặc Cookie. Lưu thông tin `user` vào Redux / Pinia / React Context để phân quyền hiển thị giao diện.

---

### 3.3. Xem thông tin Token cá nhân (Kiểm tra đăng nhập)
* **Endpoint:** `GET /api/auth/profile`
* **Quyền:** Cần Token (`Bearer Token` mọi role)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xác thực Token thành công! Đây là thông tin cá nhân của bạn.",
  "user": {
    "matk": 1,
    "tendangnhap": "nguyenvanan",
    "vaitro": "BenhNhan",
    "mabn": 1
  }
}
```

---

## 🏥 4. PHÂN HỆ HỒ SƠ BỆNH NHÂN (`/api/patients`)

### 4.1. Xem hồ sơ cá nhân của Bệnh nhân
* **Endpoint:** `GET /api/patients/me`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin cá nhân thành công!",
  "data": {
    "mabn": 1,
    "matk": 1,
    "hoten": "Nguyễn Văn An",
    "gioitinh": "Nam",
    "ngaysinh": "2000-01-15T00:00:00.000Z",
    "sdt": "0912345678",
    "diachi": "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    "cccd": "079200001234",
    "sobhyt": "DN4791234567890",
    "ngaydangky": "2026-10-08T00:00:00.000Z",
    "taikhoan": {
      "tendangnhap": "nguyenvanan",
      "vaitro": "BenhNhan",
      "trangthai": "HoatDong"
    }
  }
}
```

---

### 4.2. Chỉnh sửa / Cập nhật hồ sơ Bệnh nhân
* **Endpoint:** `PUT /api/patients/me`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Request Body (Các trường cần cập nhật):**
```json
{
  "hoten": "Nguyễn Văn An",
  "gioitinh": "Nam",
  "ngaysinh": "2000-01-15",
  "sdt": "0988776655",
  "diachi": "456 Lê Lợi, Quận 1, TP.HCM",
  "cccd": "079200001234",
  "sobhyt": "DN4791234567890"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ bệnh nhân thành công!",
  "data": {
    "mabn": 1,
    "hoten": "Nguyễn Văn An",
    "gioitinh": "Nam",
    "ngaysinh": "2000-01-15T00:00:00.000Z",
    "sdt": "0988776655",
    "diachi": "456 Lê Lợi, Quận 1, TP.HCM",
    "cccd": "079200001234",
    "sobhyt": "DN4791234567890"
  }
}
```

---

### 4.3. Xem hồ sơ bệnh án (EMR)
* **Endpoint:** `GET /api/patients/me/medical-record`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin hồ sơ bệnh án thành công!",
  "data": {
    "mahsba": 1,
    "nhommau": "O",        // "A" | "B" | "AB" | "O" | "ChuaRo"
    "tiensubenh": "Không có tiền sử bệnh lý tim mạch hay huyết áp",
    "diung": "Dị ứng phấn hoa, kháng sinh Penicillin",
    "ghichu": "Thể trạng sức khỏe bình thường",
    "benhnhan": {
      "hoten": "Nguyễn Văn An",
      "sdt": "0988776655"
    }
  }
}
```

---

### 4.4. Xem lịch sử các lần khám bệnh
* **Endpoint:** `GET /api/patients/me/medical-history`
* **Quyền:** Cần Token (`Bearer Token`, role `BenhNhan`)
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin lịch sử khám bệnh thành công!",
  "data": [
    {
      "malsk": 101,
      "mabn": 1,
      "mabs": 5,
      "ngay": "2026-10-05T09:30:00.000Z",
      "trieuchung": "Sốt nhẹ, ho có đờm, đau họng 2 ngày",
      "chandoan": "Viêm đường hô hấp trên cấp tính",
      "ketluan": "Theo dõi điều trị ngoại trú bằng thuốc",
      "bacsi": {
        "mabs": 5,
        "hocham": "Bác sĩ CKI",
        "nhanvien": {
          "hoten": "BS. Trần Văn Bình",
          "sdt": "0909123456"
        },
        "chuyenkhoa": {
          "tenchuyenkhoa": "Khoa Tai Mũi Họng"
        }
      },
      "donthuoc": {
        "madt": 55,
        "ngayke": "2026-10-05T00:00:00.000Z",
        "ghichubacsi": "Uống sau ăn no, kiêng nước đá",
        "chitietdonthuoc": [
          {
            "mactdt": 12,
            "soluong": 20,
            "lieudung": "Sáng 1 viên, tối 1 viên",
            "thoigiansudung": "5 ngày",
            "thuoc": {
              "tenthuoc": "Amoxicillin 500mg",
              "donvitinh": "Viên"
            }
          }
        ]
      },
      "chitietdichvukham": [
        {
          "mactdvk": 88,
          "soluong": 1,
          "ketqua": "Họng sung huyết nhẹ",
          "dichvu": {
            "tendichvu": "Khám chuyên khoa Tai Mũi Họng",
            "dongia": "150000"
          }
        }
      ],
      "hoadon": {
        "mahd": 77,
        "tongtien": "350000",
        "trangthaithanhtoan": "DaThanhToan", // "ChuaThanhToan" | "DaThanhToan" | "DaHuy"
        "phuongthuctt": "ChuyenKhoan"
      }
    }
  ]
}
```

---

## 🩺 5. PHÂN HỆ MASTER DATA CHUYÊN KHOA (`/api/specialties`)

Phân hệ phục vụ hiển thị danh mục chuyên khoa khám bệnh trên Website, Landing Page, hỗ trợ tìm kiếm, lọc, dropdown đặt lịch và chức năng quản lý danh mục dành cho Admin.

### 5.1. Lấy danh sách chuyên khoa
* **Endpoint:** `GET /api/specialties`
* **Quyền:** Public (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `search` (string): Tìm kiếm theo tên chuyên khoa (không phân biệt hoa thường). Ví dụ: `?search=Tai`
  * `includeCounts` (boolean): `true` để lấy thêm số lượng bác sĩ, phòng khám, dịch vụ trực thuộc. Ví dụ: `?includeCounts=true`
  * `page` (number), `limit` (number): Phân trang danh sách nếu cần. Ví dụ: `?page=1&limit=10`
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách chuyên khoa thành công!",
  "data": [
    {
      "mack": 1,
      "tenchuyenkhoa": "Khoa Nội Tổng Quát",
      "mota": "Chuyên chẩn đoán và điều trị các bệnh nội khoa không phẫu thuật",
      "_count": {
        "bacsi": 3,
        "phongkham": 2,
        "dichvu": 5
      }
    },
    {
      "mack": 2,
      "tenchuyenkhoa": "Khoa Tai Mũi Họng",
      "mota": "Khám và điều trị các bệnh lý tai mũi họng người lớn và trẻ em",
      "_count": {
        "bacsi": 2,
        "phongkham": 1,
        "dichvu": 4
      }
    }
  ]
}
```

---

### 5.2. Lấy chi tiết chuyên khoa theo ID
* **Endpoint:** `GET /api/specialties/:id`
* **Quyền:** Public
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết chuyên khoa thành công!",
  "data": {
    "mack": 2,
    "tenchuyenkhoa": "Khoa Tai Mũi Họng",
    "mota": "Khám và điều trị các bệnh lý tai mũi họng người lớn và trẻ em",
    "bacsi": [
      {
        "mabs": 5,
        "hocham": "Bác sĩ CKI",
        "kinhnghiem": 8,
        "sogiayphephanhnghe": "CCHN-001254",
        "nhanvien": {
          "hoten": "BS. Trần Văn Bình",
          "sdt": "0909123456",
          "gioitinh": "Nam"
        }
      }
    ],
    "phongkham": [
      {
        "maphong": 102,
        "tenphong": "Phòng Khám TMH 1",
        "trangthai": "SanSang"
      }
    ],
    "dichvu": [
      {
        "madv": 15,
        "tendichvu": "Nội soi tai mũi họng",
        "dongia": "200000"
      }
    ],
    "_count": {
      "bacsi": 1,
      "phongkham": 1,
      "dichvu": 1
    }
  }
}
```

---

### 5.3. Thêm mới chuyên khoa
* **Endpoint:** `POST /api/specialties`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tenchuyenkhoa": "Khoa Mắt",
  "mota": "Khám và phẫu thuật, điều trị các bệnh lý về mắt"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới chuyên khoa thành công!",
  "data": {
    "mack": 3,
    "tenchuyenkhoa": "Khoa Mắt",
    "mota": "Khám và phẫu thuật, điều trị các bệnh lý về mắt"
  }
}
```

---

### 5.4. Cập nhật chuyên khoa
* **Endpoint:** `PUT /api/specialties/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tenchuyenkhoa": "Khoa Mắt Kỹ Thuật Cao",
  "mota": "Cập nhật mô tả chuyên khoa"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin chuyên khoa thành công!",
  "data": {
    "mack": 3,
    "tenchuyenkhoa": "Khoa Mắt Kỹ Thuật Cao",
    "mota": "Cập nhật mô tả chuyên khoa"
  }
}
```

---

### 5.5. Xóa chuyên khoa
* **Endpoint:** `DELETE /api/specialties/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Lưu ý an toàn:** Nếu chuyên khoa đang có Bác sĩ, Phòng khám hoặc Dịch vụ liên kết, server sẽ trả về lỗi `400 Bad Request` để bảo vệ dữ liệu.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa chuyên khoa \"Khoa Mắt Kỹ Thuật Cao\" thành công!",
  "data": {
    "mack": 3,
    "tenchuyenkhoa": "Khoa Mắt Kỹ Thuật Cao"
  }
}
```

---

## 👨‍⚕️ 6. PHÂN HỆ MASTER DATA BÁC SĨ (`/api/doctors`)

Phân hệ phục vụ hiển thị danh sách bác sĩ, lọc bác sĩ theo chuyên khoa khi đặt lịch hẹn khám bệnh, xem hồ sơ chi tiết bác sĩ và chức năng quản lý nhân sự Bác sĩ cho Admin.

### 6.1. Lấy danh sách bác sĩ
* **Endpoint:** `GET /api/doctors`
* **Quyền:** Public (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `specialtyId` (number): Lọc danh sách bác sĩ theo mã chuyên khoa `mack`. Ví dụ: `?specialtyId=2` (lọc bác sĩ thuộc Khoa Tai Mũi Họng)
  * `search` (string): Tìm kiếm theo họ tên bác sĩ, học hàm hoặc số giấy phép hành nghề. Ví dụ: `?search=Bình`
  * `page` (number), `limit` (number): Phân trang danh sách nếu cần. Ví dụ: `?page=1&limit=10`
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách bác sĩ thành công!",
  "data": [
    {
      "mabs": 5,
      "mack": 2,
      "sogiayphephanhnghe": "CCHN-001254",
      "hocham": "Bác sĩ CKI",
      "kinhnghiem": 8,
      "nhanvien": {
        "manv": 5,
        "hoten": "BS. Trần Văn Bình",
        "gioitinh": "Nam",
        "ngaysinh": "1988-03-15T00:00:00.000Z",
        "sdt": "0909123456",
        "diachi": "123 Cách Mạng Tháng 8, Quận 3, TP.HCM",
        "chucvu": "BacSi",
        "ngayvaolam": "2020-01-10T00:00:00.000Z"
      },
      "chuyenkhoa": {
        "mack": 2,
        "tenchuyenkhoa": "Khoa Tai Mũi Họng"
      },
      "_count": {
        "lichhen": 12,
        "lichsukham": 45
      }
    }
  ]
}
```

---

### 6.2. Lấy chi tiết thông tin một bác sĩ
* **Endpoint:** `GET /api/doctors/:id`
* **Quyền:** Public
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết bác sĩ thành công!",
  "data": {
    "mabs": 5,
    "mack": 2,
    "sogiayphephanhnghe": "CCHN-001254",
    "hocham": "Bác sĩ CKI",
    "kinhnghiem": 8,
    "nhanvien": {
      "manv": 5,
      "hoten": "BS. Trần Văn Bình",
      "gioitinh": "Nam",
      "ngaysinh": "1988-03-15T00:00:00.000Z",
      "sdt": "0909123456",
      "diachi": "123 Cách Mạng Tháng 8, Quận 3, TP.HCM",
      "chucvu": "BacSi",
      "ngayvaolam": "2020-01-10T00:00:00.000Z",
      "taikhoan": {
        "matk": 8,
        "tendangnhap": "bs_tranvanbinh",
        "vaitro": "BacSi",
        "trangthai": "HoatDong"
      }
    },
    "chuyenkhoa": {
      "mack": 2,
      "tenchuyenkhoa": "Khoa Tai Mũi Họng",
      "mota": "Khám và điều trị các bệnh lý tai mũi họng"
    },
    "_count": {
      "lichhen": 12,
      "lichsukham": 45
    }
  }
}
```

---

### 6.3. Lấy lịch làm việc / ca trực của bác sĩ
* **Endpoint:** `GET /api/doctors/:id/schedule`
* **Quyền:** Public (Phục vụ bệnh nhân chọn giờ khi đặt lịch khám)
* **Query Parameters (Tùy chọn):**
  * `fromDate` (YYYY-MM-DD): Lọc từ ngày
  * `toDate` (YYYY-MM-DD): Lọc đến ngày
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy lịch làm việc của bác sĩ thành công!",
  "data": {
    "bacsi": {
      "mabs": 5,
      "hoten": "BS. Trần Văn Bình",
      "chuyenkhoa": "Khoa Tai Mũi Họng"
    },
    "shifts": [
      {
        "mapclv": 10,
        "vaitrotrongca": "Bác sĩ chính",
        "calamviec": {
          "maca": 1,
          "ngay": "2026-10-12T00:00:00.000Z",
          "giobatdau": "1970-01-01T07:30:00.000Z",
          "gioketthuc": "1970-01-01T11:30:00.000Z",
          "phongkham": {
            "maphong": 102,
            "tenphong": "Phòng Khám TMH 1",
            "trangthai": "SanSang"
          }
        }
      }
    ]
  }
}
```

---

### 6.4. Thêm mới bác sĩ
* **Endpoint:** `POST /api/doctors`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "mack": 2,
  "sogiayphephanhnghe": "CCHN-889977",
  "hocham": "Thạc sĩ, Bác sĩ CKI",
  "kinhnghiem": 10,
  "hoten": "Nguyễn Hoàng Nam",
  "gioitinh": "Nam",
  "ngaysinh": "1985-06-20",
  "sdt": "0912349988",
  "diachi": "123 Hai Bà Trưng, Quận 1, TP.HCM",
  "ngayvaolam": "2026-10-10",
  "username": "bs_hoangnam",
  "password": "Password123@"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới bác sĩ thành công!",
  "data": {
    "mabs": 6,
    "mack": 2,
    "sogiayphephanhnghe": "CCHN-889977",
    "hocham": "Thạc sĩ, Bác sĩ CKI",
    "kinhnghiem": 10,
    "nhanvien": {
      "manv": 6,
      "hoten": "Nguyễn Hoàng Nam",
      "gioitinh": "Nam",
      "ngaysinh": "1985-06-20T00:00:00.000Z",
      "sdt": "0912349988",
      "diachi": "123 Hai Bà Trưng, Quận 1, TP.HCM",
      "chucvu": "BacSi",
      "ngayvaolam": "2026-10-10T00:00:00.000Z"
    },
    "chuyenkhoa": {
      "mack": 2,
      "tenchuyenkhoa": "Khoa Tai Mũi Họng"
    }
  }
}
```

---

### 6.5. Cập nhật thông tin bác sĩ
* **Endpoint:** `PUT /api/doctors/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "hocham": "Bác sĩ CKII",
  "kinhnghiem": 12,
  "diachi": "456 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin bác sĩ thành công!",
  "data": { ... }
}
```

---

### 6.6. Xóa bác sĩ
* **Endpoint:** `DELETE /api/doctors/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Lưu ý an toàn:** Nếu bác sĩ đã có Lịch hẹn, Lịch sử khám bệnh hoặc Ca trực được phân công, server sẽ từ chối xóa và trả về `400 Bad Request` để bảo vệ hồ sơ bệnh án.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa bác sĩ \"Nguyễn Hoàng Nam\" thành công!",
  "data": {
    "mabs": 6,
    "hoten": "Nguyễn Hoàng Nam"
  }
}
```

---

## 🚪 7. PHÂN HỆ MASTER DATA PHÒNG KHÁM (`/api/rooms`)

Phân hệ phục vụ hiển thị danh sách phòng khám, sơ đồ phòng, lọc phòng theo chuyên khoa và trạng thái (`SanSang`, `DangSuDung`, `BaoTri`), hỗ trợ lễ tân xếp ca và quản trị viên quản lý cơ sở vật chất.

### 7.1. Lấy danh sách phòng khám
* **Endpoint:** `GET /api/rooms`
* **Quyền:** Public (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `specialtyId` (number): Lọc phòng khám theo mã chuyên khoa `mack`. Ví dụ: `?specialtyId=1`
  * `status` (string): Lọc theo trạng thái phòng (`SanSang` | `DangSuDung` | `BaoTri`). Ví dụ: `?status=SanSang`
  * `search` (string): Tìm kiếm theo tên phòng. Ví dụ: `?search=Nội`
  * `page` (number), `limit` (number): Phân trang danh sách nếu cần. Ví dụ: `?page=1&limit=10`
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách phòng khám thành công!",
  "data": [
    {
      "maphong": 101,
      "tenphong": "Phòng Khám Nội Tổng Quát 1",
      "mack": 1,
      "trangthai": "SanSang",
      "chuyenkhoa": {
        "mack": 1,
        "tenchuyenkhoa": "Khoa Nội Tổng Quát"
      },
      "_count": {
        "calamviec": 4
      }
    },
    {
      "maphong": 102,
      "tenphong": "Phòng Khám TMH 1",
      "mack": 2,
      "trangthai": "DangSuDung",
      "chuyenkhoa": {
        "mack": 2,
        "tenchuyenkhoa": "Khoa Tai Mũi Họng"
      },
      "_count": {
        "calamviec": 2
      }
    }
  ]
}
```

---

### 7.2. Lấy chi tiết thông tin một phòng khám
* **Endpoint:** `GET /api/rooms/:id`
* **Quyền:** Public
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết phòng khám thành công!",
  "data": {
    "maphong": 101,
    "tenphong": "Phòng Khám Nội Tổng Quát 1",
    "mack": 1,
    "trangthai": "SanSang",
    "chuyenkhoa": {
      "mack": 1,
      "tenchuyenkhoa": "Khoa Nội Tổng Quát",
      "mota": "Khám và điều trị nội khoa"
    },
    "calamviec": [
      {
        "maca": 1,
        "ngay": "2026-10-12T00:00:00.000Z",
        "giobatdau": "1970-01-01T07:30:00.000Z",
        "gioketthuc": "1970-01-01T11:30:00.000Z"
      }
    ],
    "_count": {
      "calamviec": 1
    }
  }
}
```

---

### 7.3. Thêm mới phòng khám
* **Endpoint:** `POST /api/rooms`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tenphong": "Phòng Khám Nhi 202",
  "mack": 3,
  "trangthai": "SanSang"
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới phòng khám thành công!",
  "data": {
    "maphong": 105,
    "tenphong": "Phòng Khám Nhi 202",
    "mack": 3,
    "trangthai": "SanSang",
    "chuyenkhoa": {
      "mack": 3,
      "tenchuyenkhoa": "Khoa Nhi"
    }
  }
}
```

---

### 7.4. Cập nhật thông tin phòng khám
* **Endpoint:** `PUT /api/rooms/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tenphong": "Phòng Khám Nhi VIP 202",
  "trangthai": "BaoTri"
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin phòng khám thành công!",
  "data": {
    "maphong": 105,
    "tenphong": "Phòng Khám Nhi VIP 202",
    "mack": 3,
    "trangthai": "BaoTri",
    "chuyenkhoa": {
      "mack": 3,
      "tenchuyenkhoa": "Khoa Nhi"
    }
  }
}
```

---

### 7.5. Xóa phòng khám
* **Endpoint:** `DELETE /api/rooms/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Lưu ý an toàn:** Nếu phòng khám đã có ca làm việc (`calamviec`) được phân công, server sẽ từ chối xóa và trả về `400 Bad Request` để bảo vệ dữ liệu ca trực của nhân viên.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa phòng khám \"Phòng Khám Nhi VIP 202\" thành công!",
  "data": {
    "maphong": 105,
    "tenphong": "Phòng Khám Nhi VIP 202"
  }
}
```

---

## 💉 8. PHÂN HỆ MASTER DATA DỊCH VỤ (`/api/services`)

Phân hệ phục vụ hiển thị bảng giá dịch vụ khám bệnh, danh mục cận lâm sàng, lọc dịch vụ theo chuyên khoa hoặc khoảng giá, phục vụ bác sĩ chỉ định và thu ngân tính tiền viện phí.

### 8.1. Lấy danh sách dịch vụ
* **Endpoint:** `GET /api/services`
* **Quyền:** Public (Không yêu cầu đăng nhập)
* **Query Parameters (Tùy chọn):**
  * `specialtyId` (number): Lọc dịch vụ theo mã chuyên khoa `mack`. Ví dụ: `?specialtyId=1`
  * `minPrice`, `maxPrice` (number): Lọc dịch vụ theo khoảng giá. Ví dụ: `?minPrice=100000&maxPrice=500000`
  * `search` (string): Tìm kiếm theo tên dịch vụ. Ví dụ: `?search=Nội soi`
  * `page` (number), `limit` (number): Phân trang danh sách nếu cần. Ví dụ: `?page=1&limit=10`
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách dịch vụ thành công!",
  "data": [
    {
      "madv": 1,
      "tendichvu": "Khám chuyên khoa Nội",
      "dongia": "150000",
      "mack": 1,
      "chuyenkhoa": {
        "mack": 1,
        "tenchuyenkhoa": "Khoa Nội Tổng Quát"
      },
      "_count": {
        "chitietdichvukham": 25,
        "chitiethoadon": 25
      }
    },
    {
      "madv": 2,
      "tendichvu": "Nội soi tai mũi họng",
      "dongia": "200000",
      "mack": 2,
      "chuyenkhoa": {
        "mack": 2,
        "tenchuyenkhoa": "Khoa Tai Mũi Họng"
      },
      "_count": {
        "chitietdichvukham": 18,
        "chitiethoadon": 18
      }
    }
  ]
}
```

---

### 8.2. Lấy chi tiết thông tin một dịch vụ
* **Endpoint:** `GET /api/services/:id`
* **Quyền:** Public
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin chi tiết dịch vụ thành công!",
  "data": {
    "madv": 2,
    "tendichvu": "Nội soi tai mũi họng",
    "dongia": "200000",
    "mack": 2,
    "chuyenkhoa": {
      "mack": 2,
      "tenchuyenkhoa": "Khoa Tai Mũi Họng",
      "mota": "Khám và điều trị các bệnh lý tai mũi họng"
    },
    "_count": {
      "chitietdichvukham": 18,
      "chitiethoadon": 18
    }
  }
}
```

---

### 8.3. Thêm mới dịch vụ
* **Endpoint:** `POST /api/services`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tendichvu": "Chụp X-Quang tim phổi thẳng",
  "dongia": 120000,
  "mack": 1
}
```
* **Response Thành công (201 Created):**
```json
{
  "success": true,
  "message": "Thêm mới dịch vụ thành công!",
  "data": {
    "madv": 3,
    "tendichvu": "Chụp X-Quang tim phổi thẳng",
    "dongia": "120000",
    "mack": 1,
    "chuyenkhoa": {
      "mack": 1,
      "tenchuyenkhoa": "Khoa Nội Tổng Quát"
    }
  }
}
```

---

### 8.4. Cập nhật thông tin dịch vụ
* **Endpoint:** `PUT /api/services/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Request Body:**
```json
{
  "tendichvu": "Chụp X-Quang kỹ thuật số",
  "dongia": 150000
}
```
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin dịch vụ thành công!",
  "data": {
    "madv": 3,
    "tendichvu": "Chụp X-Quang kỹ thuật số",
    "dongia": "150000",
    "mack": 1,
    "chuyenkhoa": {
      "mack": 1,
      "tenchuyenkhoa": "Khoa Nội Tổng Quát"
    }
  }
}
```

---

### 8.5. Xóa dịch vụ
* **Endpoint:** `DELETE /api/services/:id`
* **Quyền:** Admin (`Bearer Token` với vai trò `Admin`)
* **Lưu ý an toàn:** Nếu dịch vụ đã phát sinh chỉ định khám (`chitietdichvukham`) hoặc khoản thu hóa đơn (`chitiethoadon`), server sẽ từ chối xóa và trả về `400 Bad Request` để bảo vệ chứng từ viện phí.
* **Response Thành công (200 OK):**
```json
{
  "success": true,
  "message": "Xóa dịch vụ \"Chụp X-Quang kỹ thuật số\" thành công!",
  "data": {
    "madv": 3,
    "tendichvu": "Chụp X-Quang kỹ thuật số"
  }
}
```

---

## 🛠️ 9. MẪU CODE GỌI API CHO FRONTEND (AXIOS INSTANCE)

Đoạn mã mẫu cài đặt Axios Interceptor tự động gắn token và xử lý lỗi:

```javascript
// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 1. Tự động gắn Token vào tất cả Request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 2. Xử lý kết quả & bắt lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Nếu token hết hạn hoặc không hợp lệ (401), chuyển hướng về trang Login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || 'Lỗi kết nối máy chủ!';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
```
