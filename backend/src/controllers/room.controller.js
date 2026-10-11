const {
    getAllRoomsService,
    getRoomByIdService,
    createRoomService,
    updateRoomService,
    deleteRoomService,
} = require("../services/room.service");

// [GET] /api/rooms
// Lấy danh sách phòng khám (hỗ trợ lọc chuyên khoa, trạng thái, tìm kiếm và phân trang)
async function getAllRoomsController(req, res, next) {
    try {
        const { specialtyId, status, search, page, limit } = req.query;
        const result = await getAllRoomsService({
            specialtyId,
            status,
            search,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách phòng khám thành công!",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// [GET] /api/rooms/:id
// Lấy chi tiết thông tin một phòng khám theo ID
async function getRoomByIdController(req, res, next) {
    try {
        const { id } = req.params;
        const room = await getRoomByIdService(id);

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin chi tiết phòng khám thành công!",
            data: room,
        });
    } catch (error) {
        return next(error);
    }
}

// [POST] /api/rooms
// Thêm mới một phòng khám (Admin)
async function createRoomController(req, res, next) {
    try {
        const newRoom = await createRoomService(req.body);

        return res.status(201).json({
            success: true,
            message: "Thêm mới phòng khám thành công!",
            data: newRoom,
        });
    } catch (error) {
        return next(error);
    }
}

// [PUT] /api/rooms/:id
// Cập nhật thông tin phòng khám (Admin)
async function updateRoomController(req, res, next) {
    try {
        const { id } = req.params;
        const updatedRoom = await updateRoomService(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin phòng khám thành công!",
            data: updatedRoom,
        });
    } catch (error) {
        return next(error);
    }
}

// [DELETE] /api/rooms/:id
// Xóa một phòng khám khỏi hệ thống (Admin)
async function deleteRoomController(req, res, next) {
    try {
        const { id } = req.params;
        const result = await deleteRoomService(id);

        return res.status(200).json({
            success: true,
            message: `Xóa phòng khám "${result.tenphong}" thành công!`,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getAllRoomsController,
    getRoomByIdController,
    createRoomController,
    updateRoomController,
    deleteRoomController,
};
