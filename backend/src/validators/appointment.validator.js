// ========================================================
// VALIDATOR: KIỂM TRA DỮ LIỆU ĐẦU VÀO PHÂN HỆ LỊCH HẸN KHÁM
// ========================================================

const { DATE_REGEX, TIME_REGEX } = require("../constants/shift.constant");

// Kiểm tra mã ID lịch hẹn trên đường dẫn (:id)
function validateAppointmentId(req, res, next) {
    const id = Number(req.params.id);
    if (!id || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "Mã định danh lịch hẹn (:id) không hợp lệ, phải là số nguyên dương!",
        });
    }
    next();
}

// Kiểm tra dữ liệu khi tạo lịch hẹn mới
function validateCreateAppointment(req, res, next) {
    const { mabs, mabn, ngayhen, giohen, lydokham } = req.body;

    // 1. Kiểm tra Bác sĩ
    if (mabs === undefined || mabs === null || mabs === "") {
        return res.status(400).json({
            success: false,
            message: "Vui lòng chọn bác sĩ khám bệnh (mabs)!",
        });
    }
    const doctorId = Number(mabs);
    if (isNaN(doctorId) || doctorId <= 0 || !Number.isInteger(doctorId)) {
        return res.status(400).json({
            success: false,
            message: "Mã bác sĩ (mabs) phải là số nguyên dương hợp lệ!",
        });
    }

    // 2. Nếu là Lễ tân/Admin đặt hộ, cần mabn
    if (["Admin", "LeTan"].includes(req.user?.vaitro)) {
        if (mabn !== undefined && mabn !== null && mabn !== "") {
            const patientId = Number(mabn);
            if (isNaN(patientId) || patientId <= 0 || !Number.isInteger(patientId)) {
                return res.status(400).json({
                    success: false,
                    message: "Mã bệnh nhân (mabn) được chỉ định phải là số nguyên dương!",
                });
            }
        }
    }

    // 3. Kiểm tra Ngày hẹn
    if (!ngayhen || typeof ngayhen !== "string" || !DATE_REGEX.test(ngayhen.trim())) {
        return res.status(400).json({
            success: false,
            message: "Ngày hẹn khám không hợp lệ! Định dạng yêu cầu là YYYY-MM-DD (ví dụ: 2026-10-20).",
        });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (ngayhen.trim() < todayStr) {
        return res.status(400).json({
            success: false,
            message: "Ngày hẹn khám không được là ngày trong quá khứ!",
        });
    }

    // 4. Kiểm tra Giờ hẹn
    if (!giohen || typeof giohen !== "string" || !TIME_REGEX.test(giohen.trim())) {
        return res.status(400).json({
            success: false,
            message: "Giờ hẹn khám không hợp lệ! Định dạng yêu cầu là HH:mm (ví dụ: 08:30 hoặc 14:00).",
        });
    }

    // 5. Kiểm tra Lý do khám (tùy chọn)
    if (lydokham !== undefined && lydokham !== null && typeof lydokham === "string") {
        if (lydokham.trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: "Lý do khám bệnh không được vượt quá 255 ký tự!",
            });
        }
    }

    next();
}

// Kiểm tra dữ liệu khi cập nhật trạng thái lịch hẹn
function validateAppointmentStatus(req, res, next) {
    const { trangthai, ghichu } = req.body;
    const validStatuses = ["ChoXacNhan", "DaXacNhan", "DaKham", "DaHuy"];

    if (!trangthai || !validStatuses.includes(trangthai)) {
        return res.status(400).json({
            success: false,
            message: `Trạng thái lịch hẹn không hợp lệ! Chỉ chấp nhận: ${validStatuses.join(", ")}`,
        });
    }

    if (ghichu !== undefined && ghichu !== null && typeof ghichu === "string") {
        if (ghichu.trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: "Ghi chú không được vượt quá 255 ký tự!",
            });
        }
    }

    next();
}

// Kiểm tra dữ liệu khi dời lịch hẹn / đổi bác sĩ
function validateRescheduleAppointment(req, res, next) {
    const { ngayhen, giohen, mabs } = req.body;

    if (!ngayhen && !giohen && !mabs) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần thay đổi (ngayhen, giohen hoặc mabs)!",
        });
    }

    if (ngayhen !== undefined) {
        if (typeof ngayhen !== "string" || !DATE_REGEX.test(ngayhen.trim())) {
            return res.status(400).json({
                success: false,
                message: "Ngày hẹn khám mới không hợp lệ (định dạng YYYY-MM-DD)!",
            });
        }
        const todayStr = new Date().toISOString().split("T")[0];
        if (ngayhen.trim() < todayStr) {
            return res.status(400).json({
                success: false,
                message: "Ngày hẹn khám mới không được là ngày trong quá khứ!",
            });
        }
    }

    if (giohen !== undefined) {
        if (typeof giohen !== "string" || !TIME_REGEX.test(giohen.trim())) {
            return res.status(400).json({
                success: false,
                message: "Giờ hẹn khám mới không hợp lệ (định dạng HH:mm)!",
            });
        }
    }

    if (mabs !== undefined) {
        const doctorId = Number(mabs);
        if (isNaN(doctorId) || doctorId <= 0 || !Number.isInteger(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Mã bác sĩ mới (mabs) phải là số nguyên dương hợp lệ!",
            });
        }
    }

    next();
}

// Kiểm tra query parameters khi lọc danh sách lịch hẹn
function validateAppointmentQuery(req, res, next) {
    const { date, fromDate, toDate, doctorId, patientId, specialtyId, status, page, limit } = req.query;

    if (date && !DATE_REGEX.test(date.trim())) {
        return res.status(400).json({ success: false, message: "Tham số date không đúng định dạng YYYY-MM-DD!" });
    }
    if (fromDate && !DATE_REGEX.test(fromDate.trim())) {
        return res.status(400).json({ success: false, message: "Tham số fromDate không đúng định dạng YYYY-MM-DD!" });
    }
    if (toDate && !DATE_REGEX.test(toDate.trim())) {
        return res.status(400).json({ success: false, message: "Tham số toDate không đúng định dạng YYYY-MM-DD!" });
    }

    if (doctorId && (isNaN(Number(doctorId)) || Number(doctorId) <= 0)) {
        return res.status(400).json({ success: false, message: "doctorId phải là số nguyên dương!" });
    }
    if (patientId && (isNaN(Number(patientId)) || Number(patientId) <= 0)) {
        return res.status(400).json({ success: false, message: "patientId phải là số nguyên dương!" });
    }
    if (specialtyId && (isNaN(Number(specialtyId)) || Number(specialtyId) <= 0)) {
        return res.status(400).json({ success: false, message: "specialtyId phải là số nguyên dương!" });
    }

    if (status) {
        const validStatuses = ["ChoXacNhan", "DaXacNhan", "DaKham", "DaHuy"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái lọc không hợp lệ! Chỉ chấp nhận: ${validStatuses.join(", ")}`,
            });
        }
    }

    if (page && (isNaN(Number(page)) || Number(page) <= 0)) {
        return res.status(400).json({ success: false, message: "page phải là số nguyên dương!" });
    }
    if (limit && (isNaN(Number(limit)) || Number(limit) <= 0 || Number(limit) > 100)) {
        return res.status(400).json({ success: false, message: "limit phải từ 1 đến 100!" });
    }

    next();
}

module.exports = {
    validateAppointmentId,
    validateCreateAppointment,
    validateAppointmentStatus,
    validateRescheduleAppointment,
    validateAppointmentQuery,
};
