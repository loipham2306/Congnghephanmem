// ========================================================
// CONTROLLER: PHÂN HỆ LỊCH HẸN KHÁM BỆNH (APPOINTMENT)
// ========================================================

const {
    createAppointmentService,
    getMyAppointmentsService,
    getAllAppointmentsService,
    getAppointmentByIdService,
    updateAppointmentStatusService,
    rescheduleAppointmentService,
    cancelAppointmentService,
} = require("../services/appointment.service");

// 1. Đặt lịch khám bệnh mới
async function createAppointmentController(req, res, next) {
    try {
        const appointment = await createAppointmentService(req.user, req.body);
        return res.status(201).json({
            success: true,
            message: "Đặt lịch khám bệnh thành công!",
            data: appointment,
        });
    } catch (error) {
        return next(error);
    }
}

// 2. Bệnh nhân xem lịch hẹn của chính mình
async function getMyAppointmentsController(req, res, next) {
    try {
        const appointments = await getMyAppointmentsService(req.user.matk, req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lịch hẹn của bạn thành công!",
            data: appointments,
        });
    } catch (error) {
        return next(error);
    }
}

// 3. Nhân viên y tế & Admin: Lấy danh sách toàn bộ lịch hẹn
async function getAllAppointmentsController(req, res, next) {
    try {
        const result = await getAllAppointmentsService(req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lịch hẹn thành công!",
            ...result,
        });
    } catch (error) {
        return next(error);
    }
}

// 4. Xem chi tiết một lịch hẹn
async function getAppointmentByIdController(req, res, next) {
    try {
        const appointment = await getAppointmentByIdService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết lịch hẹn thành công!",
            data: appointment,
        });
    } catch (error) {
        return next(error);
    }
}

// 5. Cập nhật trạng thái lịch hẹn (Duyệt, Hủy, Đã khám)
async function updateAppointmentStatusController(req, res, next) {
    try {
        const appointment = await updateAppointmentStatusService(
            req.params.id,
            req.body,
            req.user
        );
        return res.status(200).json({
            success: true,
            message: `Cập nhật trạng thái lịch hẹn thành công (${appointment.trangthai})!`,
            data: appointment,
        });
    } catch (error) {
        return next(error);
    }
}

// 6. Dời ngày giờ khám / đổi bác sĩ
async function rescheduleAppointmentController(req, res, next) {
    try {
        const appointment = await rescheduleAppointmentService(
            req.params.id,
            req.body,
            req.user
        );
        return res.status(200).json({
            success: true,
            message: "Dời lịch hẹn khám thành công!",
            data: appointment,
        });
    } catch (error) {
        return next(error);
    }
}

// 7. Hủy lịch hẹn
async function cancelAppointmentController(req, res, next) {
    try {
        const appointment = await cancelAppointmentService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: "Đã hủy lịch hẹn khám thành công!",
            data: appointment,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createAppointmentController,
    getMyAppointmentsController,
    getAllAppointmentsController,
    getAppointmentByIdController,
    updateAppointmentStatusController,
    rescheduleAppointmentController,
    cancelAppointmentController,
};
