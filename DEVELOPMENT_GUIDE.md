# 📖 Hướng Dẫn Quy Trình Lập Trình Backend (Development Guide)

Tài liệu này quy chuẩn **quy trình phát triển tính năng chuẩn luồng** cho dự án Website Quản Lý Phòng Khám. Mọi thành viên trong nhóm khi làm nhiệm vụ (task) mới đều phải tuân thủ các bước dưới đây để code đồng nhất, dễ đọc và không gây xung đột (conflict).

---

## 1. Tổng Quan Kiến Trúc 3 Tầng (3-Layer Architecture)

Hệ thống hoạt động theo nguyên tắc phân tách trách nhiệm rõ ràng:

$$\text{Client (React)} \longrightarrow \text{Router} \longrightarrow \text{Middleware/Validator} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Prisma DB}$$

| Tầng / Thư mục | Trách nhiệm chính | Điều TUYỆT ĐỐI KHÔNG làm |
| :--- | :--- | :--- |
| **`routers/`** | Định nghĩa endpoint URL (`/api/v1/...`), phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`). | Không viết logic xử lý hay query DB ở đây. |
| **`middlewares/`** | Xác thực JWT (`auth.middleware.js`), phân quyền (`role.middleware.js`), bắt lỗi tập trung (`error.middleware.js`). | Không trả response thành công ở middleware trung gian. |
| **`validators/`** | Kiểm tra tính hợp lệ của dữ liệu đầu vào (`req.body`, `req.query`). | Không truy vấn CSDL phức tạp trong validator. |
| **`controllers/`** | Tiếp nhận request, bóc tách tham số, gọi Service, trả response HTTP format chuẩn. | **KHÔNG** viết logic nghiệp vụ, **KHÔNG** gọi Prisma trực tiếp trong Controller. |
| **`services/`** | **Bộ não nghiệp vụ**: Tính toán viện phí, kiểm tra ca trực, trừ kho thuốc, gọi Prisma truy vấn CSDL. | Không can thiệp vào đối tượng HTTP (`req`, `res`). |
| **`config/prisma.js`** | Cung cấp kết nối CSDL duy nhất (Singleton). | Không tự ý gọi `new PrismaClient()` ở bất kỳ file nào khác. |

---

## 2. Quy Trình 5 Bước Chuẩn Khi Code Một Tính Năng Mới

> **Ví dụ mẫu**: Xây dựng tính năng **"Bệnh nhân xem danh sách lịch hẹn của mình"** (`GET /api/v1/appointments/my-appointments`).

### Bước 1: Khai báo Hằng số (Constants)
Nếu tính năng có các giá trị cố định (trạng thái, vai trò...), hãy khai báo vào thư mục `src/constants/`:
```javascript
// src/constants/appointment.constant.js
const APPOINTMENT_STATUS = {
  PENDING: 'ChoXacNhan',
  CONFIRMED: 'DaXacNhan',
  COMPLETED: 'DaKham',
  CANCELLED: 'DaHuy'
};

module.exports = { APPOINTMENT_STATUS };
```

---

### Bước 2: Viết tầng Nghiệp vụ trong `services/`
Tạo file dịch vụ xử lý logic và tương tác CSDL qua `prisma`:
```javascript
// src/services/appointment.service.js
const prisma = require('../config/prisma');

/**
 * Lấy danh sách lịch hẹn của một bệnh nhân
 * @param {number} patientId - Mã bệnh nhân
 */
const getAppointmentsByPatientId = async (patientId) => {
  const appointments = await prisma.lichhen.findMany({
    where: { mabn: patientId },
    include: {
      bacsi: {
        include: {
          nhanvien: {
            select: { hoten: true, sdt: true }
          },
          chuyenkhoa: {
            select: { tenchuyenkhoa: true }
          }
        }
      }
    },
    orderBy: { ngayhen: 'desc' }
  });

  return appointments;
};

module.exports = {
  getAppointmentsByPatientId,
};
```

---

### Bước 3: Viết tầng Điều khiển trong `controllers/`
Controller nhận request, gọi service và trả về kết quả:
```javascript
// src/controllers/appointment.controller.js
const appointmentService = require('../services/appointment.service');

const getMyAppointments = async (req, res, next) => {
  try {
    // 1. Lấy thông tin user đã đăng nhập (do auth.middleware gắn vào req.user)
    const patientId = req.user.mabn;

    // 2. Gọi tầng Service xử lý
    const data = await appointmentService.getAppointmentsByPatientId(patientId);

    // 3. Trả về Response theo đúng chuẩn JSON của dự án
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách lịch hẹn thành công!',
      data: data
    });
  } catch (error) {
    // 4. Bắt buộc chuyển lỗi sang Global Error Handler qua next()
    next(error);
  }
};

module.exports = {
  getMyAppointments,
};
```

---

### Bước 4: Định tuyến trong `routers/`
Tạo router cho phân hệ và áp dụng middleware bảo vệ:
```javascript
// src/routers/appointment.router.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
// const { verifyToken } = require('../middlewares/auth.middleware');

// GET /api/v1/appointments/my-appointments
router.get('/my-appointments', /* verifyToken, */ appointmentController.getMyAppointments);

module.exports = router;
```

---

### Bước 5: Gắn Router vào `app.js`
Mở [src/app.js](file:///d:/WebProject/qlphongkham/Congnghephanmem/backend/src/app.js), đăng ký router tại **Mục 3**:
```javascript
// Trong src/app.js:
const appointmentRouter = require('./routers/appointment.router');

app.use('/api/v1/appointments', appointmentRouter);
```

---

## 3. Quy Ước Phản Hồi API Chuẩn (Response Format)

Tất cả các API trả về cho Frontend đều phải tuân theo cấu trúc JSON đồng nhất:

### Phản hồi Thành công (Status 200, 201):
```json
{
  "success": true,
  "message": "Mô tả ngắn gọn kết quả thành công",
  "data": { ... } // hoặc mảng [ ... ]
}
```

### Phản hồi Thất bại (Status 400, 401, 403, 404, 500):
Được xử lý tự động bởi `error.middleware.js`:
```json
{
  "success": false,
  "message": "Nội dung thông báo lỗi cho người dùng"
}
```

---

## 4. Nguyên Tắc An Toàn Với Prisma & CSDL Supabase

1. **Tuyệt đối không ghi đè cột tính toán tự động**:
   - Bảng `chitiethoadon` có cột `thanhtien` là cột tự tính (`GENERATED ALWAYS AS (soluong * dongia)`). Khi gọi `prisma.chitiethoadon.create()`, **KHÔNG** truyền trường `thanhtien`.
2. **Tận dụng Trigger tự động**:
   - Bảng `hoadon` có Trigger tự cộng dồn `tongtien` từ các chi tiết hóa đơn. Bạn không cần tự viết lệnh `UPDATE hoadon SET tongtien = ...`.
3. **Luôn import Prisma từ file cấu hình chung**:
   ```javascript
   // ĐÚNG:
   const prisma = require('../config/prisma');

   // SAI (gây cạn kiệt kết nối database):
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   ```

---

## 5. Quy Tắc Làm Việc Nhóm Với Git

1. **Không bao giờ commit file nhạy cảm**:
   - File `.env` chứa mật khẩu đã được chặn trong `.gitignore`, không bao giờ được xóa dòng này.
2. **Quy tắc viết Commit Message**:
   - `feat: thêm chức năng đặt lịch hẹn khám`
   - `fix: sửa lỗi tính tiền hóa đơn viện phí`
   - `refactor: tối ưu hàm lấy danh sách bác sĩ`
3. **Trước khi bắt đầu làm việc mỗi ngày**:
   - Luôn chạy lệnh `git pull` để nhận code mới nhất từ bạn cùng nhóm.
