// ========================================================
// CONTROLLER: PHÂN HỆ HÓA ĐƠN VIỆN PHÍ & THANH TOÁN
// ========================================================

const {
    createInvoiceService,
    addInvoiceItemService,
    removeInvoiceItemService,
    payInvoiceService,
    cancelInvoiceService,
    getAllInvoicesService,
    getInvoiceByIdService,
    getInvoiceByExamService,
    getMyInvoicesService,
    refundInvoiceService,
} = require("../services/invoice.service");

// 1. Khởi tạo hóa đơn từ lần khám bệnh
async function createInvoiceController(req, res, next) {
    try {
        const invoice = await createInvoiceService(req.body);
        return res.status(201).json({
            success: true,
            message: "Khởi tạo hóa đơn viện phí thành công!",
            data: invoice,
        });
    } catch (error) {
        return next(error);
    }
}

// 2. Thêm mục viện phí vào hóa đơn (Dịch vụ hoặc Thuốc)
async function addInvoiceItemController(req, res, next) {
    try {
        const invoice = await addInvoiceItemService(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Thêm mục chi tiết viện phí thành công (Tổng tiền đã được cập nhật tự động)!",
            data: invoice,
        });
    } catch (error) {
        return next(error);
    }
}

// 3. Xóa một mục viện phí khỏi hóa đơn
async function removeInvoiceItemController(req, res, next) {
    try {
        const invoice = await removeInvoiceItemService(req.params.id, req.params.itemId);
        return res.status(200).json({
            success: true,
            message: "Xóa mục viện phí thành công (Tổng tiền đã được giảm trừ tự động)!",
            data: invoice,
        });
    } catch (error) {
        return next(error);
    }
}

// 4. Xác nhận thanh toán hóa đơn
async function payInvoiceController(req, res, next) {
    try {
        const invoice = await payInvoiceService(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Thanh toán hóa đơn viện phí thành công!",
            data: invoice,
        });
    } catch (error) {
        return next(error);
    }
}

// 5. Hủy hóa đơn
async function cancelInvoiceController(req, res, next) {
    try {
        const invoice = await cancelInvoiceService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: "Hủy hóa đơn viện phí thành công!",
            data: invoice,
        });
    } catch (error) {
        return next(error);
    }
}

// 6. Lấy danh sách hóa đơn
async function getAllInvoicesController(req, res, next) {
    try {
        const result = await getAllInvoicesService(req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách hóa đơn thành công!",
            ...result,
        });
    } catch (error) {
        return next(error);
    }
}

// 7. Lấy chi tiết một hóa đơn
async function getInvoiceByIdController(req, res, next) {
    try {
        const invoice = await getInvoiceByIdService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết hóa đơn thành công!",
            data: invoice,
        });
    } catch (error) {
        return next(error);
    }
}

// 8. Lấy hóa đơn theo lần khám
async function getInvoiceByExamController(req, res, next) {
    try {
        const invoice = await getInvoiceByExamService(req.params.malsk, req.user);
        return res.status(200).json({
            success: true,
            message: "Lấy hóa đơn theo lần khám thành công!",
            data: invoice,
        });
    } catch (error) {
        return next(error);
    }
}

// 9. Hoàn tiền hóa đơn (Admin)
async function refundInvoiceController(req, res, next) {
    try {
        const invoice = await refundInvoiceService(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Hoàn tiền hóa đơn thành công!",
            data: invoice,
        });
    } catch (error) {
        return next(error);
    }
}

// 10. Bệnh nhân xem hóa đơn của mình
async function getMyInvoicesController(req, res, next) {
    try {
        const invoices = await getMyInvoicesService(req.user.matk, req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách hóa đơn của bạn thành công!",
            data: invoices,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createInvoiceController,
    addInvoiceItemController,
    removeInvoiceItemController,
    payInvoiceController,
    cancelInvoiceController,
    getAllInvoicesController,
    getInvoiceByIdController,
    getInvoiceByExamController,
    getMyInvoicesController,
    refundInvoiceController,
};
