const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");
const {
    getMyProfileController,
    getMyMedicalRecordController,
    getMyMedicalHistoryController,
    updateMyProfileController,
} = require("../controllers/patient.controller");

const router = express.Router();
// lay thong tin benh nhan
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyProfileController,
);
// lay thong tin benh an
router.get(
    "/me/medical-record",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyMedicalRecordController,
);
//lay thong tin lich su kham
router.get(
    "/me/medical-history",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    getMyMedicalHistoryController,
);
// cập nhật hồ sơ bệnh nhân
router.put(
    "/me",
    authMiddleware,
    roleMiddleware("BenhNhan"),
    updateMyProfileController,
);
module.exports = router;
