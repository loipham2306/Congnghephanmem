// ========================================================
// VALIDATOR: KIỂM TRA DỮ LIỆU ĐẦU VÀO PHÂN HỆ LỊCH HẸN KHÁM
// ========================================================

const { TIME_REGEX } = require("../constants/shift.constant");
const { ALL_APPOINTMENT_STATUSES } = require("../constants/appointment.constant");
const { todayVN, isValidDateOnly } = require("../utils/date");

function badRequest(res, message) {
    return res.status(400).json({ success: false, message });
}

function validateAppointmentId(req, res, next) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return badRequest(res, "Mã định danh lịch hẹn (:id) không hợp lệ, phải là số nguyên dương!");
    }
    return next();
}

function validateCreateAppointment(req, res, next) {
    const { mabs, mabn, ngayhen, giohen, lydokham } = req.body;

    const doctorId = Number(mabs);
    if (!Number.isInteger(doctorId) || doctorId <= 0) {
        return badRequest(res, "Vui lòng chọn bác sĩ khám bệnh (mabs) hợp lệ!");
    }

    if (["Admin", "LeTan"].includes(req.user?.vaitro)) {
        const patientId = Number(mabn);
        if (!Number.isInteger(patientId) || patientId <= 0) {
            return badRequest(res, "Lễ tân/Admin phải cung cấp mã bệnh nhân (mabn) hợp lệ!");
        }
    }

    if (!isValidDateOnly(ngayhen)) {
        return badRequest(res, "Ngày hẹn khám không hợp lệ! Định dạng yêu cầu là YYYY-MM-DD.");
    }
    if (ngayhen.trim() < todayVN()) {
        return badRequest(res, "Ngày hẹn khám không được là ngày trong quá khứ!");
    }

    if (typeof giohen !== "string" || !TIME_REGEX.test(giohen.trim())) {
        return badRequest(res, "Giờ hẹn khám không hợp lệ! Định dạng yêu cầu là HH:mm.");
    }

    if (lydokham !== undefined && lydokham !== null) {
        if (typeof lydokham !== "string" || lydokham.trim().length > 255) {
            return badRequest(res, "Lý do khám bệnh không được vượt quá 255 ký tự!");
        }
    }

    req.body.ngayhen = ngayhen.trim();
    req.body.giohen = giohen.trim();
    return next();
}

function validateAppointmentStatus(req, res, next) {
    const { trangthai, ghichu, lydohuy } = req.body || {};

    if (!ALL_APPOINTMENT_STATUSES.includes(trangthai)) {
        return badRequest(
            res,
            `Trạng thái lịch hẹn không hợp lệ! Chỉ chấp nhận: ${ALL_APPOINTMENT_STATUSES.join(", ")}`,
        );
    }

    if (trangthai === "DaHuy" && !String(lydohuy || ghichu || "").trim()) {
        return badRequest(res, "Vui lòng nhập lý do hủy lịch (lydohuy)!");
    }

    if (ghichu !== undefined && ghichu !== null) {
        if (typeof ghichu !== "string" || ghichu.trim().length > 255) {
            return badRequest(res, "Ghi chú không được vượt quá 255 ký tự!");
        }
    }
    if (lydohuy !== undefined && lydohuy !== null) {
        if (typeof lydohuy !== "string" || lydohuy.trim().length === 0 || lydohuy.trim().length > 255) {
            return badRequest(res, "Lý do hủy phải có từ 1 đến 255 ký tự!");
        }
    }

    return next();
}

function validateCancelAppointment(req, res, next) {
    const body = req.body || {};
    const reason = body.lydohuy || body.ghichu;
    if (!String(reason || "").trim() || String(reason).trim().length > 255) {
        return badRequest(res, "Vui lòng nhập lý do hủy lịch (tối đa 255 ký tự)!");
    }
    return next();
}

function validateRescheduleAppointment(req, res, next) {
    const { ngayhen, giohen, mabs } = req.body || {};

    if (ngayhen === undefined && giohen === undefined && mabs === undefined) {
        return badRequest(res, "Vui lòng cung cấp ít nhất một thông tin cần thay đổi (ngayhen, giohen hoặc mabs)!");
    }

    if (ngayhen !== undefined) {
        if (!isValidDateOnly(ngayhen)) {
            return badRequest(res, "Ngày hẹn khám mới không hợp lệ (định dạng YYYY-MM-DD)!");
        }
        if (ngayhen.trim() < todayVN()) {
            return badRequest(res, "Ngày hẹn khám mới không được là ngày trong quá khứ!");
        }
        req.body.ngayhen = ngayhen.trim();
    }

    if (giohen !== undefined) {
        if (typeof giohen !== "string" || !TIME_REGEX.test(giohen.trim())) {
            return badRequest(res, "Giờ hẹn khám mới không hợp lệ (định dạng HH:mm)!");
        }
        req.body.giohen = giohen.trim();
    }

    if (mabs !== undefined) {
        const doctorId = Number(mabs);
        if (!Number.isInteger(doctorId) || doctorId <= 0) {
            return badRequest(res, "Mã bác sĩ mới (mabs) phải là số nguyên dương hợp lệ!");
        }
    }

    return next();
}

function validateAppointmentQuery(req, res, next) {
    const { date, fromDate, toDate, doctorId, patientId, specialtyId, status, page, limit } = req.query;

    if (date && !isValidDateOnly(date)) {
        return badRequest(res, "Tham số date không đúng định dạng YYYY-MM-DD!");
    }
    if (fromDate && !isValidDateOnly(fromDate)) {
        return badRequest(res, "Tham số fromDate không đúng định dạng YYYY-MM-DD!");
    }
    if (toDate && !isValidDateOnly(toDate)) {
        return badRequest(res, "Tham số toDate không đúng định dạng YYYY-MM-DD!");
    }
    if (fromDate && toDate && fromDate.trim() > toDate.trim()) {
        return badRequest(res, "fromDate không được lớn hơn toDate!");
    }

    for (const [name, value] of Object.entries({ doctorId, patientId, specialtyId })) {
        if (value && (!Number.isInteger(Number(value)) || Number(value) <= 0)) {
            return badRequest(res, `${name} phải là số nguyên dương!`);
        }
    }

    if (status && !ALL_APPOINTMENT_STATUSES.includes(status)) {
        return badRequest(
            res,
            `Trạng thái lọc không hợp lệ! Chỉ chấp nhận: ${ALL_APPOINTMENT_STATUSES.join(", ")}`,
        );
    }

    if (page && (!Number.isInteger(Number(page)) || Number(page) <= 0)) {
        return badRequest(res, "page phải là số nguyên dương!");
    }
    if (limit && (!Number.isInteger(Number(limit)) || Number(limit) <= 0 || Number(limit) > 100)) {
        return badRequest(res, "limit phải từ 1 đến 100!");
    }

    return next();
}

function validateAvailableSlotsQuery(req, res, next) {
    const { mabs, ngayhen } = req.query;

    if (!Number.isInteger(Number(mabs)) || Number(mabs) <= 0) {
        return badRequest(res, "Tham số mabs phải là số nguyên dương!");
    }
    if (!isValidDateOnly(ngayhen)) {
        return badRequest(res, "Tham số ngayhen không đúng định dạng YYYY-MM-DD!");
    }
    if (ngayhen.trim() < todayVN()) {
        return badRequest(res, "Không thể xem khung giờ trống của ngày trong quá khứ!");
    }

    return next();
}

function validateQueueQuery(req, res, next) {
    const { date, mabs } = req.query;

    if (date && !isValidDateOnly(date)) {
        return badRequest(res, "Tham số date không đúng định dạng YYYY-MM-DD!");
    }
    if (mabs && (!Number.isInteger(Number(mabs)) || Number(mabs) <= 0)) {
        return badRequest(res, "Tham số mabs phải là số nguyên dương!");
    }

    return next();
}

module.exports = {
    validateAppointmentId,
    validateCreateAppointment,
    validateAppointmentStatus,
    validateCancelAppointment,
    validateRescheduleAppointment,
    validateAppointmentQuery,
    validateAvailableSlotsQuery,
    validateQueueQuery,
};
