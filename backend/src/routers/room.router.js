const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    getAllRoomsController,
    getRoomByIdController,
    createRoomController,
    updateRoomController,
    deleteRoomController,
} = require("../controllers/room.controller");

const {
    validateRoomId,
    validateRoomQuery,
    validateCreateRoom,
    validateUpdateRoom,
} = require("../validators/room.validator");

const router = express.Router();

// lấy danh sách phòng khám
router.get("/", validateRoomQuery, getAllRoomsController);

// lấy chi tiết thông tin một phòng khám
router.get("/:id", validateRoomId, getRoomByIdController);

// thêm mới phòng khám (Chỉ Admin)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("Admin"),
    validateCreateRoom,
    createRoomController,
);

// cập nhật thông tin phòng khám (Chỉ Admin)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateRoomId,
    validateUpdateRoom,
    updateRoomController,
);

// xóa phòng khám (Chỉ Admin, có Safe Delete Guard bảo vệ lịch ca làm việc)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("Admin"),
    validateRoomId,
    deleteRoomController,
);

module.exports = router;
