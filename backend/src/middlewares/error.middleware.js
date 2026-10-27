// ========================================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ========================================================

const { logger } = require("../config/logger");

function errorMiddleware(err, req, res, next) {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Lỗi máy chủ nội bộ (Internal Server Error)";

    // Bắt và chuẩn hóa các mã lỗi phổ biến từ Prisma ORM
    if (err.code === "P2002") {
        statusCode = 409;
        const target = err.meta?.target ? ` (${err.meta.target.join(", ")})` : "";
        message = `Dữ liệu bị trùng lặp! Trường dữ liệu này đã tồn tại trong hệ thống${target}.`;
    } else if (err.code === "P2025") {
        statusCode = 404;
        message = "Không tìm thấy bản ghi dữ liệu yêu cầu!";
    }

    // Ghi nhận lỗi có cấu trúc vào error.log và app.log
    const errorDetails = {
        requestId: req.id || null,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.socket?.remoteAddress,
        userId: req.user?.matk || null,
        statusCode,
        errorMessage: err.message,
        stack: err.stack,
    };

    if (statusCode >= 500) {
        logger.error(`🔥 [Server Error]: ${err.message}`, errorDetails);
    } else {
        logger.warn(`⚠️ [Client Error]: ${err.message}`, errorDetails);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        requestId: req.id || undefined,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}

module.exports = errorMiddleware;
