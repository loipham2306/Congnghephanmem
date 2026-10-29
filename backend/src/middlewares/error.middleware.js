// ========================================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ========================================================

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

    // Chỉ log stack cho lỗi hệ thống 5xx; 4xx là lỗi nghiệp vụ đã được xử lý.
    if (statusCode >= 500) {
        console.error("🔥 [Server Error]:", err.stack || err.message || err);
        if (process.env.NODE_ENV === "production") {
            message = "Lỗi máy chủ nội bộ (Internal Server Error)";
        }
    }

    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}

module.exports = errorMiddleware;
