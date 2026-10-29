// ========================================================
// VALIDATOR: KIỂM TRA THAM SỐ PHÂN HỆ THỐNG KÊ & BÁO CÁO
// ========================================================

const { isValidDateOnly } = require("../utils/date");

function validateDateRangeQuery(req, res, next) {
    const { startDate, endDate, groupBy, limit } = req.query;

    if (startDate && !isValidDateOnly(startDate)) {
        return res.status(400).json({
            success: false,
            message: "Tham số startDate không hợp lệ! Định dạng yêu cầu là YYYY-MM-DD.",
        });
    }

    if (endDate && !isValidDateOnly(endDate)) {
        return res.status(400).json({
            success: false,
            message: "Tham số endDate không hợp lệ! Định dạng yêu cầu là YYYY-MM-DD.",
        });
    }

    if (startDate && endDate && startDate.trim() > endDate.trim()) {
        return res.status(400).json({
            success: false,
            message: "Ngày bắt đầu (startDate) không được lớn hơn ngày kết thúc (endDate)!",
        });
    }

    if (groupBy && !["day", "month"].includes(groupBy.trim())) {
        return res.status(400).json({
            success: false,
            message: "Tham số groupBy chỉ chấp nhận giá trị 'day' hoặc 'month'!",
        });
    }

    if (limit && (!Number.isInteger(Number(limit)) || Number(limit) <= 0 || Number(limit) > 50)) {
        return res.status(400).json({
            success: false,
            message: "Tham số limit phải là số nguyên dương từ 1 đến 50!",
        });
    }

    next();
}

module.exports = {
    validateDateRangeQuery,
};
