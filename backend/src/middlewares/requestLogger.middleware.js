const crypto = require("crypto");
const { logger } = require("../config/logger");

/**
 * Middleware tạo RequestId và ghi log truy vết vòng đời từng Request
 */
function requestLoggerMiddleware(req, res, next) {
    const startTime = Date.now();

    // 1. Nhận diện hoặc tạo mới Request ID duy nhất (Correlation ID)
    const requestId =
        req.headers["x-request-id"] ||
        `req-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

    req.id = requestId;
    res.setHeader("X-Request-Id", requestId);

    // 2. Ghi nhận khi Request bắt đầu
    const clientIp =
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        req.ip ||
        "Unknown IP";

    logger.debug(`[HTTP IN] ${req.method} ${req.originalUrl}`, {
        requestId,
        ip: clientIp,
        userAgent: req.headers["user-agent"] || "Unknown",
    });

    // 3. Lắng nghe khi Response hoàn tất để đo lường hiệu năng
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        const logPayload = {
            requestId,
            method: req.method,
            url: req.originalUrl,
            status: statusCode,
            duration: `${duration}ms`,
            ip: clientIp,
            userId: req.user?.matk || null,
            role: req.user?.vaitro || "Guest",
        };

        if (statusCode >= 500) {
            logger.error(`[HTTP ${statusCode}] ${req.method} ${req.originalUrl} (${duration}ms)`, logPayload);
        } else if (statusCode >= 400) {
            logger.warn(`[HTTP ${statusCode}] ${req.method} ${req.originalUrl} (${duration}ms)`, logPayload);
        } else {
            logger.info(`[HTTP ${statusCode}] ${req.method} ${req.originalUrl} (${duration}ms)`, logPayload);
        }
    });

    next();
}

module.exports = requestLoggerMiddleware;
