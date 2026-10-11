const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    getAllSpecialtiesController,
    getSpecialtyByIdController,
    createSpecialtyController,
    updateSpecialtyController,
    deleteSpecialtyController,
} = require("../controllers/specialty.controller");

const {
    validateSpecialtyId,
    validateCreateSpecialty,
    validateUpdateSpecialty,
    validateSpecialtyQuery,
} = require("../validators/specialty.validator");

const router = express.Router();

// lấy danh sách chuyên khoa
router.get("/", validateSpecialtyQuery, getAllSpecialtiesController);

// lấy chi tiết chuyên khoa theo id
router.get("/:id", validateSpecialtyId, getSpecialtyByIdController);

// admin thêm mới chuyên khoa
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin"),
    validateCreateSpecialty,
    createSpecialtyController,
);

// admin cập nhật thông tin chuyên khoa
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateSpecialtyId,
    validateUpdateSpecialty,
    updateSpecialtyController,
);

// admin xóa 1 chuyên khoa
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateSpecialtyId,
    deleteSpecialtyController,
);

module.exports = router;
