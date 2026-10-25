const {
    getAllShiftsService,
    getShiftByIdService,
    createShiftService,
    updateShiftService,
    deleteShiftService,
    assignStaffToShiftService,
    removeStaffFromShiftService,
    getStaffScheduleService,
} = require("../services/shift.service");

// [GET] /api/shifts
// Lấy danh sách ca làm việc (hỗ trợ lọc ngày, phòng, nhân viên, chuyên khoa, phân trang)
async function getAllShiftsController(req, res, next) {
    try {
        const { date, fromDate, toDate, roomId, staffId, specialtyId, page, limit } = req.query;
        const result = await getAllShiftsService({
            date,
            fromDate,
            toDate,
            roomId,
            staffId,
            specialtyId,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách ca làm việc thành công!",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// [GET] /api/shifts/:id
// Lấy chi tiết thông tin một ca làm việc theo mã ID
async function getShiftByIdController(req, res, next) {
    try {
        const { id } = req.params;
        const shift = await getShiftByIdService(id);

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin chi tiết ca làm việc thành công!",
            data: shift,
        });
    } catch (error) {
        return next(error);
    }
}

// [POST] /api/shifts
// Thêm mới một ca làm việc (Chỉ Admin)
async function createShiftController(req, res, next) {
    try {
        const newShift = await createShiftService(req.body);

        return res.status(201).json({
            success: true,
            message: "Tạo mới ca làm việc thành công!",
            data: newShift,
        });
    } catch (error) {
        return next(error);
    }
}

// [PUT] /api/shifts/:id
// Cập nhật thông tin ca làm việc (Chỉ Admin)
async function updateShiftController(req, res, next) {
    try {
        const { id } = req.params;
        const updatedShift = await updateShiftService(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật ca làm việc thành công!",
            data: updatedShift,
        });
    } catch (error) {
        return next(error);
    }
}

// [DELETE] /api/shifts/:id
// Xóa một ca làm việc khỏi hệ thống (Chỉ Admin)
async function deleteShiftController(req, res, next) {
    try {
        const { id } = req.params;
        const result = await deleteShiftService(id);

        return res.status(200).json({
            success: true,
            message: `Xóa ca làm việc ngày ${result.ngay} (${result.giobatdau} - ${result.gioketthuc}) tại phòng ${result.tenphong} thành công!`,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// [POST] /api/shifts/:id/assign
// Phân công nhân sự vào ca làm việc (Chỉ Admin)
async function assignStaffController(req, res, next) {
    try {
        const { id } = req.params;
        const result = await assignStaffToShiftService(id, req.body);

        return res.status(201).json({
            success: true,
            message: `Phân công nhân viên "${result.nhanvien.hoten}" vào ca thành công!`,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// [DELETE] /api/shifts/:id/assign/:staffId
// Hủy phân công một nhân sự khỏi ca làm việc (Chỉ Admin)
async function removeStaffController(req, res, next) {
    try {
        const { id, staffId } = req.params;
        const result = await removeStaffFromShiftService(id, staffId);

        return res.status(200).json({
            success: true,
            message: `Hủy phân công nhân viên "${result.hoten}" khỏi ca làm việc thành công!`,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// [GET] /api/shifts/staff/:staffId
// Lấy lịch trực cá nhân của một nhân viên/bác sĩ
async function getStaffScheduleController(req, res, next) {
    try {
        const { staffId } = req.params;
        const { fromDate, toDate } = req.query;
        const result = await getStaffScheduleService(staffId, { fromDate, toDate });

        return res.status(200).json({
            success: true,
            message: `Lấy lịch trực của nhân viên "${result.nhanvien.hoten}" thành công!`,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getAllShiftsController,
    getShiftByIdController,
    createShiftController,
    updateShiftController,
    deleteShiftController,
    assignStaffController,
    removeStaffController,
    getStaffScheduleController,
};
