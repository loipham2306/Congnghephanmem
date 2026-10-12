const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    getAllDoctorsController,
    getDoctorByIdController,
    getDoctorScheduleController,
    createDoctorController,
    updateDoctorController,
    deleteDoctorController,
} = require("../controllers/doctor.controller");

const {
    validateDoctorId,
    validateDoctorQuery,
    validateDoctorScheduleQuery,
    validateCreateDoctor,
    validateUpdateDoctor,
} = require("../validators/doctor.validator");

const router = express.Router();

// lấy danh sách bác sĩ (Public - phục vụ tìm kiếm & đặt lịch khám)
router.get("/", validateDoctorQuery, getAllDoctorsController);

// lấy chi tiết thông tin một bác sĩ (Public)
router.get("/:id", validateDoctorId, getDoctorByIdController);

// lấy lịch làm việc / ca trực của bác sĩ (Public - phục vụ chọn ca khi đặt lịch)
router.get(
    "/:id/schedule",
    validateDoctorId,
    validateDoctorScheduleQuery,
    getDoctorScheduleController,
);

// thêm mới bác sĩ (Chỉ Admin)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin"),
    validateCreateDoctor,
    createDoctorController,
);

// cập nhật thông tin bác sĩ (Chỉ Admin)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateDoctorId,
    validateUpdateDoctor,
    updateDoctorController,
);

// xóa bác sĩ (Chỉ Admin, có Safe Delete Guard bảo vệ toàn vẹn lịch sử y tế)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateDoctorId,
    deleteDoctorController,
);

module.exports = router;
