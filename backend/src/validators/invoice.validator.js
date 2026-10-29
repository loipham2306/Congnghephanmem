// ========================================================
// VALIDATOR: KIỂM TRA DỮ LIỆU ĐẦU VÀO PHÂN HỆ HÓA ĐƠN VIỆN PHÍ
// ========================================================

const { isValidDateOnly } = require("../utils/date");

const PAYMENT_METHODS = ["TienMat", "ChuyenKhoan", "TheThanhToan", "ViDienTu"];
const PAYMENT_STATUSES = ["ChuaThanhToan", "DaThanhToan", "DaHuy"];

// Kiểm tra mã ID hóa đơn trên URL (:id)
function validateInvoiceId(req, res, next) {
    const id = Number(req.params.id);
    if (!id || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "Mã định danh hóa đơn (:id) không hợp lệ, phải là số nguyên dương!",
        });
    }
    next();
}

// Kiểm tra dữ liệu khi khởi tạo hóa đơn
function validateCreateInvoice(req, res, next) {
    const { malsk, phuongthuctt } = req.body;

    if (malsk === undefined || malsk === null || malsk === "") {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp mã lần khám bệnh (malsk) cần lập hóa đơn!",
        });
    }

    const examId = Number(malsk);
    if (isNaN(examId) || examId <= 0 || !Number.isInteger(examId)) {
        return res.status(400).json({
            success: false,
            message: "Mã lần khám (malsk) phải là số nguyên dương!",
        });
    }

    if (phuongthuctt !== undefined && phuongthuctt !== null && phuongthuctt !== "") {
        if (!PAYMENT_METHODS.includes(phuongthuctt)) {
            return res.status(400).json({
                success: false,
                message: `Phương thức thanh toán không hợp lệ! Chỉ chấp nhận: ${PAYMENT_METHODS.join(", ")}`,
            });
        }
    }

    next();
}

// Kiểm tra dữ liệu khi thanh toán hóa đơn
function validateInvoicePayment(req, res, next) {
    const { phuongthuctt } = req.body;

    if (!phuongthuctt || !PAYMENT_METHODS.includes(phuongthuctt)) {
        return res.status(400).json({
            success: false,
            message: `Vui lòng chọn phương thức thanh toán hợp lệ! Chấp nhận: ${PAYMENT_METHODS.join(", ")}`,
        });
    }

    next();
}

// Kiểm tra dữ liệu khi thêm mục viện phí vào hóa đơn
function validateAddInvoiceItem(req, res, next) {
    const { madv, mathuoc, soluong, dongia } = req.body;

    if (!madv && !mathuoc) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng chọn mã dịch vụ (madv) hoặc mã thuốc (mathuoc) cần thanh toán!",
        });
    }

    if (madv && mathuoc) {
        return res.status(400).json({
            success: false,
            message: "Mỗi dòng chi tiết chỉ được phép là dịch vụ hoặc thuốc, không chọn đồng thời cả hai!",
        });
    }

    if (madv !== undefined) {
        const serviceId = Number(madv);
        if (isNaN(serviceId) || serviceId <= 0 || !Number.isInteger(serviceId)) {
            return res.status(400).json({
                success: false,
                message: "Mã dịch vụ (madv) phải là số nguyên dương!",
            });
        }
    }

    if (mathuoc !== undefined) {
        const medicineId = Number(mathuoc);
        if (isNaN(medicineId) || medicineId <= 0 || !Number.isInteger(medicineId)) {
            return res.status(400).json({
                success: false,
                message: "Mã thuốc (mathuoc) phải là số nguyên dương!",
            });
        }
    }

    if (soluong === undefined || soluong === null) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập số lượng (soluong)!",
        });
    }

    const qty = Number(soluong);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
        return res.status(400).json({
            success: false,
            message: "Số lượng (soluong) phải là số nguyên dương lớn hơn 0!",
        });
    }

    if (dongia !== undefined && dongia !== null) {
        const price = Number(dongia);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Đơn giá (dongia) không được là số âm!",
            });
        }
    }

    next();
}

// Kiểm tra query parameters lọc danh sách hóa đơn
function validateInvoiceQuery(req, res, next) {
    const { date, fromDate, toDate, status, paymentMethod, patientId, page, limit } = req.query;

    if (date && !isValidDateOnly(date)) {
        return res.status(400).json({ success: false, message: "Tham số date không đúng định dạng YYYY-MM-DD!" });
    }
    if (fromDate && !isValidDateOnly(fromDate)) {
        return res.status(400).json({ success: false, message: "Tham số fromDate không đúng định dạng YYYY-MM-DD!" });
    }
    if (toDate && !isValidDateOnly(toDate)) {
        return res.status(400).json({ success: false, message: "Tham số toDate không đúng định dạng YYYY-MM-DD!" });
    }
    if (fromDate && toDate && fromDate.trim() > toDate.trim()) {
        return res.status(400).json({ success: false, message: "fromDate không được lớn hơn toDate!" });
    }

    if (status && !PAYMENT_STATUSES.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Trạng thái thanh toán không hợp lệ! Chấp nhận: ${PAYMENT_STATUSES.join(", ")}`,
        });
    }

    if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
        return res.status(400).json({
            success: false,
            message: `Phương thức thanh toán không hợp lệ! Chấp nhận: ${PAYMENT_METHODS.join(", ")}`,
        });
    }

    if (patientId && (!Number.isInteger(Number(patientId)) || Number(patientId) <= 0)) {
        return res.status(400).json({ success: false, message: "patientId phải là số nguyên dương!" });
    }

    if (page && (!Number.isInteger(Number(page)) || Number(page) <= 0)) {
        return res.status(400).json({ success: false, message: "page phải là số nguyên dương!" });
    }
    if (limit && (!Number.isInteger(Number(limit)) || Number(limit) <= 0 || Number(limit) > 100)) {
        return res.status(400).json({ success: false, message: "limit phải từ 1 đến 100!" });
    }

    next();
}

function validateExamIdParam(req, res, next) {
    const malsk = Number(req.params.malsk);
    if (!Number.isInteger(malsk) || malsk <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã lần khám (:malsk) phải là số nguyên dương!",
        });
    }
    return next();
}

function validateRefund(req, res, next) {
    const { sotien, lydo, phuongthuc } = req.body;

    const amount = Number(sotien);
    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Số tiền hoàn (sotien) phải lớn hơn 0!",
        });
    }
    if (!String(lydo || "").trim() || String(lydo).trim().length > 255) {
        return res.status(400).json({
            success: false,
            message: "Lý do hoàn tiền là bắt buộc và không được vượt quá 255 ký tự!",
        });
    }
    if (phuongthuc !== undefined && !PAYMENT_METHODS.includes(phuongthuc)) {
        return res.status(400).json({
            success: false,
            message: `Phương thức hoàn tiền không hợp lệ! Chấp nhận: ${PAYMENT_METHODS.join(", ")}`,
        });
    }

    return next();
}

module.exports = {
    validateInvoiceId,
    validateExamIdParam,
    validateRefund,
    validateCreateInvoice,
    validateInvoicePayment,
    validateAddInvoiceItem,
    validateInvoiceQuery,
};
