const path = require("path");
const fs = require("fs");
const { createLogger, format, transports } = require("winston");

// Đảm bảo thư mục lưu file log luôn tồn tại
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Danh sách các trường dữ liệu nhạy cảm cần tự động che giấu (Data Masking)
const SENSITIVE_KEYS = [
    "matkhau",
    "password",
    "token",
    "accesstoken",
    "refreshtoken",
    "authorization",
    "cccd",
    "sobhyt",
    "secret",
];

/**
 * Hàm đệ quy che giấu thông tin nhạy cảm trước khi ghi log
 */
function maskSensitiveData(obj) {
    if (!obj || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return obj.map(maskSensitiveData);
    }

    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
            masked[key] = "***HIDDEN***";
        } else if (typeof value === "object" && value !== null) {
            masked[key] = maskSensitiveData(value);
        } else {
            masked[key] = value;
        }
    }
    return masked;
}

// Custom format Masking
const maskFormat = format((info) => {
    return maskSensitiveData(info);
});

// Định dạng log hiển thị trên Console
const consoleFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    maskFormat(),
    format.printf(({ timestamp, level, message, requestId, ...meta }) => {
        const reqPrefix = requestId ? `[${requestId}] ` : "";
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `[${timestamp}] ${level}: ${reqPrefix}${message}${metaStr}`;
    })
);

// Định dạng log lưu vào File
const fileFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    maskFormat(),
    format.json()
);

// 1. Khởi tạo Winston Logger trung tâm cho ứng dụng
const logger = createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    transports: [
        new transports.Console({
            format: consoleFormat,
        }),
        new transports.File({
            filename: path.join(logDir, "app.log"),
            format: fileFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
        new transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            format: fileFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
    exitOnError: false,
});

// 2. Khởi tạo Logger chuyên trách cho Sự kiện Bảo mật (Security Audit Log)
const securityLogger = createLogger({
    level: "warn",
    transports: [
        new transports.File({
            filename: path.join(logDir, "security.log"),
            format: fileFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
    exitOnError: false,
});

/**
 * Helper ghi nhận cảnh báo vi phạm bảo mật (SQL Injection, Unauthorized, Bypass attempt)
 */
logger.security = function (message, meta = {}) {
    const maskedMeta = maskSensitiveData(meta);
    logger.warn(`🛡️ [SECURITY ALERT] ${message}`, maskedMeta);
    securityLogger.warn(message, {
        category: "SECURITY_ALERT",
        ...maskedMeta,
    });
};

module.exports = {
    logger,
    securityLogger,
    maskSensitiveData,
};
