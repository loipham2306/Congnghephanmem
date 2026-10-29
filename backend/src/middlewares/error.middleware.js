const { logger } = require("../config/logger");

function errorMiddleware(err, req, res, next) {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal server error";

    if (err.code === "P2002") {
        statusCode = 409;
        const target = err.meta?.target ? ` (${err.meta.target.join(", ")})` : "";
        message = `Duplicate data${target}.`;
    } else if (err.code === "P2025") {
        statusCode = 404;
        message = "Requested record was not found.";
    }

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
        logger.error(`Server Error: ${err.message}`, errorDetails);
        if (process.env.NODE_ENV === "production") {
            message = "Internal server error";
        }
    } else {
        logger.warn(`Client Error: ${err.message}`, errorDetails);
    }

    return res.status(statusCode).json({
        success: false,
        message,
        requestId: req.id || undefined,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}

module.exports = errorMiddleware;
