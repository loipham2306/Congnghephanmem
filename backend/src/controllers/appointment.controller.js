// ========================================================
// CONTROLLER: PHÂN HỆ LỊCH HẸN KHÁM BỆNH (APPOINTMENT)
// ========================================================

const {
    createAppointmentService,
    getAvailableSlotsService,
    getMyAppointmentsService,
    getAllAppointmentsService,
    getAppointmentByIdService,
    updateAppointmentStatusService,
    rescheduleAppointmentService,
    cancelAppointmentService,
    checkInAppointmentService,
    getQueueService,
} = require("../services/appointment.service");

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

async function getAvailableSlotsController(req, res, next) {
    try {
        const result = await getAvailableSlotsService(req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách khung giờ còn trống thành công!",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

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

async function updateAppointmentStatusController(req, res, next) {
    try {
        const appointment = await updateAppointmentStatusService(
            req.params.id,
            req.body,
            req.user,
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

async function rescheduleAppointmentController(req, res, next) {
    try {
        const appointment = await rescheduleAppointmentService(
            req.params.id,
            req.body,
            req.user,
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

async function cancelAppointmentController(req, res, next) {
    try {
        const body = req.body || {};
        const appointment = await cancelAppointmentService(
            req.params.id,
            req.user,
            body.lydohuy || body.ghichu,
        );
        return res.status(200).json({
            success: true,
            message: "Đã hủy lịch hẹn khám thành công!",
            data: appointment,
        });
    } catch (error) {
        return next(error);
    }
}

async function checkInAppointmentController(req, res, next) {
    try {
        const appointment = await checkInAppointmentService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: `Đã tiếp đón bệnh nhân, số thứ tự: ${appointment.sohangcho}`,
            data: appointment,
        });
    } catch (error) {
        return next(error);
    }
}

async function getQueueController(req, res, next) {
    try {
        const result = await getQueueService(req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy hàng chờ khám thành công!",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createAppointmentController,
    getAvailableSlotsController,
    getMyAppointmentsController,
    getAllAppointmentsController,
    getAppointmentByIdController,
    updateAppointmentStatusController,
    rescheduleAppointmentController,
    cancelAppointmentController,
    checkInAppointmentController,
    getQueueController,
};
