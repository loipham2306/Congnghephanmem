const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const {
    createPatientController,
    getMyProfileController,
    getMyMedicalRecordController,
    updateMyMedicalRecordController,
    getMyMedicalHistoryController,
    getMyMedicalHistoryDetailController,
    updateMyProfileController,
    getPatientMedicalRecordByIdController,
    updatePatientMedicalRecordByIdController,
    getAllPatientsController,
    deletePatientByIdController,
    deleteMyAccountController,
    resetMyMedicalRecordController,
} = require("../controllers/patient.controller");

const {
    validateCreatePatient,
    validateUpdateProfile,
    validateUpdateMedicalRecord,
    validateIdParam,
    validatePatientQuery,
} = require("../validators/patient.validator");

const router = express.Router();

// ========================================================
// 1. DÀNH CHO BỆNH NHÂN ĐĂNG NHẬP (/api/patients/me/...)
// ========================================================

// 1.1. Lấy thông tin cá nhân của bệnh nhân
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyProfileController,
);

// 1.2. Cập nhật hồ sơ cá nhân của bệnh nhân
router.put(
    "/me",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    validateUpdateProfile,
    updateMyProfileController,
);

// 1.3. Lấy thông tin hồ sơ bệnh án & tiền sử bệnh
router.get(
    "/me/medical-record",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyMedicalRecordController,
);

// 1.4. Cập nhật thông tin hồ sơ bệnh án & tiền sử bệnh
router.put(
    "/me/medical-record",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    validateUpdateMedicalRecord,
    updateMyMedicalRecordController,
);

// 1.5. Xóa / làm trống (reset) tiền sử bệnh án
router.delete(
    "/me/medical-record",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    resetMyMedicalRecordController,
);

// 1.6. Lấy danh sách lịch sử khám bệnh
router.get(
    "/me/medical-history",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyMedicalHistoryController,
);

// 1.7. Lấy chi tiết 1 lần khám bệnh cụ thể
router.get(
    "/me/medical-history/:id",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    validateIdParam,
    getMyMedicalHistoryDetailController,
);

// 1.8. Bệnh nhân tự yêu cầu xóa tài khoản (chỉ áp dụng nếu chưa có lịch sử khám/hóa đơn)
router.delete(
    "/me",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    deleteMyAccountController,
);

// ========================================================
// 2. DÀNH CHO BÁC SĨ & QUẢN TRỊ VIÊN (/api/patients/...)
// ========================================================

// 2.0. Lễ tân tạo hồ sơ bệnh nhân vãng lai tại quầy
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "LeTan"),
    validateCreatePatient,
    createPatientController,
);

// 2.1. Lấy danh sách toàn bộ bệnh nhân (Admin, LeTan, BacSi)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("Admin", "LeTan", "BacSi"),
    validatePatientQuery,
    getAllPatientsController,
);

// 2.2. Tra cứu hồ sơ & tiền sử bệnh án của bệnh nhân theo mã bệnh nhân (mabn)
router.get(
    "/:id/medical-record",
    authMiddleware,
    roleMiddleware("BacSi", "Admin"),
    validateIdParam,
    getPatientMedicalRecordByIdController,
);

// 2.3. Bác sĩ cập nhật hồ sơ & tiền sử bệnh án cho bệnh nhân khi khám bệnh
router.put(
    "/:id/medical-record",
    authMiddleware,
    roleMiddleware("BacSi", "Admin"),
    validateIdParam,
    validateUpdateMedicalRecord,
    updatePatientMedicalRecordByIdController,
);

// 2.4. Admin xóa bệnh nhân theo ID (có Safe Delete Guard)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateIdParam,
    deletePatientByIdController,
);

module.exports = router;


