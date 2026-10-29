// ========================================================
// ROUTER: PHÂN HỆ LỊCH HẸN KHÁM BỆNH (APPOINTMENT)
// ========================================================

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    createAppointmentController,
    getAvailableSlotsController,
    getMyAppointmentsController,
    getAllAppointmentsController,
    getAppointmentByIdController,
    updateAppointmentStatusController,
    rescheduleAppointmentController,
    cancelAppointmentController,
    checkInAppointmentController,
    getQueueController,
} = require("../controllers/appointment.controller");

const {
    validateAppointmentId,
    validateCreateAppointment,
    validateAppointmentStatus,
    validateCancelAppointment,
    validateRescheduleAppointment,
    validateAppointmentQuery,
    validateAvailableSlotsQuery,
    validateQueueQuery,
} = require("../validators/appointment.validator");

const router = express.Router();

// 1. Bệnh nhân đặt lịch trực tuyến / Lễ tân đặt hộ tại quầy
router.post(
    "/",
    authMiddleware,
    roleMiddleware("BenhNhan", "Admin", "LeTan"),
    validateCreateAppointment,
    createAppointmentController,
);

// 2. Khung giờ còn trống của bác sĩ
router.get(
    "/available-slots",
    authMiddleware,
    roleMiddleware("BenhNhan", "Admin", "LeTan", "BacSi"),
    validateAvailableSlotsQuery,
    getAvailableSlotsController,
);

// 3. Bệnh nhân xem danh sách lịch hẹn của chính mình
router.get(
    "/my-appointments",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyAppointmentsController,
);

// 4. Hàng chờ khám trong ngày (lễ tân / bác sĩ / admin)
router.get(
    "/queue",
    authMiddleware,
    roleMiddleware("Admin", "LeTan", "BacSi"),
    validateQueueQuery,
    getQueueController,
);

// 5. Nhân viên y tế & Quản trị viên tra cứu danh sách lịch hẹn
router.get(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "LeTan", "BacSi"),
    validateAppointmentQuery,
    getAllAppointmentsController,
);

// 6. Xem chi tiết 1 lịch hẹn
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("BenhNhan", "Admin", "LeTan", "BacSi"),
    validateAppointmentId,
    getAppointmentByIdController,
);

// 7. Cập nhật trạng thái lịch hẹn (Duyệt, Tiếp đón, Hoàn tất khám, Hủy)
router.put(
    "/:id/status",
    authMiddleware,
    roleMiddleware("BenhNhan", "Admin", "LeTan", "BacSi"),
    validateAppointmentId,
    validateAppointmentStatus,
    updateAppointmentStatusController,
);

// 8. Tiếp đón bệnh nhân & cấp số thứ tự
router.patch(
    "/:id/check-in",
    authMiddleware,
    roleMiddleware("Admin", "LeTan"),
    validateAppointmentId,
    checkInAppointmentController,
);

// 9. Dời ngày giờ khám / đổi bác sĩ
router.put(
    "/:id/reschedule",
    authMiddleware,
    roleMiddleware("BenhNhan", "Admin", "LeTan", "BacSi"),
    validateAppointmentId,
    validateRescheduleAppointment,
    rescheduleAppointmentController,
);

// 10. Hủy lịch hẹn (bắt buộc lý do)
router.put(
    "/:id/cancel",
    authMiddleware,
    roleMiddleware("BenhNhan", "Admin", "LeTan", "BacSi"),
    validateAppointmentId,
    validateCancelAppointment,
    cancelAppointmentController,
);

// 11. Giữ tương thích: DELETE /:id cũng là hủy lịch
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("BenhNhan", "Admin", "LeTan", "BacSi"),
    validateAppointmentId,
    validateCancelAppointment,
    cancelAppointmentController,
);

module.exports = router;
