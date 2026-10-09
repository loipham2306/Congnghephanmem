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

## 🛠️ 5. MẪU CODE GỌI API CHO FRONTEND (AXIOS INSTANCE)

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
