const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    getAllShiftsController,
    getShiftByIdController,
    createShiftController,
    updateShiftController,
    deleteShiftController,
    assignStaffController,
    removeStaffController,
    getStaffScheduleController,
} = require("../controllers/shift.controller");

const {
    validateShiftId,
    validateStaffIdParam,
    validateShiftQuery,
    validateCreateShift,
    validateUpdateShift,
    validateAssignStaff,
} = require("../validators/shift.validator");

const router = express.Router();

// lấy danh sách ca làm việc (Hỗ trợ lọc theo ngày, phòng, nhân viên, chuyên khoa, phân trang)
router.get("/", authMiddleware, validateShiftQuery, getAllShiftsController);

// lấy lịch trực làm việc của một nhân viên/bác sĩ cụ thể
router.get("/staff/:staffId", authMiddleware, validateStaffIdParam, getStaffScheduleController);

// lấy chi tiết thông tin một ca làm việc theo ID
router.get("/:id", authMiddleware, validateShiftId, getShiftByIdController);

// tạo mới ca làm việc (Chỉ Admin)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin"),
    validateCreateShift,
    createShiftController,
);

// cập nhật ca làm việc (Chỉ Admin)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateShiftId,
    validateUpdateShift,
    updateShiftController,
);

// xóa ca làm việc khỏi hệ thống (Chỉ Admin)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateShiftId,
    deleteShiftController,
);

// phân công nhân sự vào ca làm việc (Chỉ Admin)
router.post(
    "/:id/assign",
    authMiddleware,
    roleMiddleware("Admin"),
    validateShiftId,
    validateAssignStaff,
    assignStaffController,
);

// hủy phân công một nhân sự khỏi ca làm việc (Chỉ Admin)
router.delete(
    "/:id/assign/:staffId",
    authMiddleware,
    roleMiddleware("Admin"),
    validateShiftId,
    validateStaffIdParam,
    removeStaffController,
);

module.exports = router;
