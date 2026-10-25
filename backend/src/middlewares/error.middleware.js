// ========================================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ========================================================

function errorMiddleware(err, req, res, next) {
    // Log lỗi chi tiết trên máy chủ
    console.error("🔥 [Server Error]:", err.stack || err.message || err);

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

    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}

module.exports = errorMiddleware;
