const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    getAllServicesController,
    getServiceByIdController,
    createServiceController,
    updateServiceController,
    deleteServiceController,
} = require("../controllers/service.controller");

const {
    validateServiceId,
    validateServiceQuery,
    validateCreateService,
    validateUpdateService,
} = require("../validators/service.validator");

const router = express.Router();

// lấy danh sách dịch vụ (Public)
router.get("/", validateServiceQuery, getAllServicesController);

// lấy chi tiết thông tin một dịch vụ (Public)
router.get("/:id", validateServiceId, getServiceByIdController);

// thêm mới dịch vụ (Chỉ Admin)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin"),
    validateCreateService,
    createServiceController,
);

// cập nhật thông tin dịch vụ (Chỉ Admin)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateServiceId,
    validateUpdateService,
    updateServiceController,
);

// xóa dịch vụ (Chỉ Admin, có Safe Delete Guard bảo vệ toàn vẹn hóa đơn)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateServiceId,
    deleteServiceController,
);

module.exports = router;
