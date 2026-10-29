const { logger } = require("../config/logger");

// Danh mục các biểu thức chính quy (Regex Patterns) nhận diện mẫu tấn công SQL Injection
const SQLI_PATTERNS = [
    {
        name: "Boolean-based OR/AND injection",
        regex: /\b(OR|AND)\b\s+['"]?([^'"]+)['"]?\s*=\s*['"]?\2['"]?/i,
    },
    {
        name: "Boolean-based 1=1 injection",
        regex: /\b(OR|AND)\b\s+1\s*=\s*1\b/i,
    },
    {
        name: "Union-based SQL injection",
        regex: /\bUNION\s+(ALL\s+)?SELECT\b/i,
    },
    {
        name: "Dangerous DDL statement (DROP/ALTER/TRUNCATE)",
        regex: /\b(DROP|ALTER|TRUNCATE)\s+(TABLE|DATABASE|SCHEMA|VIEW)\b/i,
    },
    {
        name: "Dangerous DML delete without condition",
        regex: /\bDELETE\s+FROM\b/i,
    },
    {
        name: "SQL Comment injection",
        regex: /(--[\s\r\n]|--$|\/\*[\s\S]*?\*\/)/,
    },
    {
        name: "Stacked query injection (; SELECT/DROP)",
        regex: /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)\b/i,
    },
    {
        name: "Execution of stored procedure / xp_cmdshell",
        regex: /\b(EXEC|EXECUTE)\s*\(|\bxp_cmdshell\b/i,
    },
    {
        name: "Hex-encoded SQL injection payload",
        regex: /0x[0-9a-fA-F]{8,}/,
    },
];

/**
 * Hàm đệ quy kiểm tra và làm sạch giá trị (xóa null byte, kiểm tra SQLi)
 */
function inspectAndSanitize(value, keyPath = "") {
    if (value === null || value === undefined) {
        return { sanitized: value, violation: null };
    }

    if (typeof value === "string") {
        // 1. Loại bỏ null-byte (\0) để ngăn chặn bypass kiểm tra chuỗi
        const cleanStr = value.replace(/\0/g, "");

        // 2. Quét qua danh sách các mẫu tấn công SQLi
        for (const pattern of SQLI_PATTERNS) {
            if (pattern.regex.test(cleanStr)) {
                return {
                    sanitized: cleanStr,
                    violation: {
                        field: keyPath,
                        pattern: pattern.name,
                        sample: cleanStr.length > 80 ? `${cleanStr.substring(0, 80)}...` : cleanStr,
                    },
                };
            }
        }

        return { sanitized: cleanStr, violation: null };
    }

    if (Array.isArray(value)) {
        const sanitizedArray = [];
        for (let i = 0; i < value.length; i++) {
            const { sanitized, violation } = inspectAndSanitize(value[i], `${keyPath}[${i}]`);
            if (violation) return { sanitized: value, violation };
            sanitizedArray.push(sanitized);
        }
        return { sanitized: sanitizedArray, violation: null };
    }

    if (typeof value === "object") {
        const sanitizedObj = {};
        for (const [k, v] of Object.entries(value)) {
            // Kiểm tra cả tên trường (Key) để phòng chống Object Injection / Parameter Pollution
            for (const pattern of SQLI_PATTERNS) {
                if (pattern.regex.test(k)) {
                    return {
                        sanitized: value,
                        violation: {
                            field: `${keyPath}.${k}`,
                            pattern: pattern.name,
                            sample: k,
                        },
                    };
                }
            }

            const { sanitized, violation } = inspectAndSanitize(v, keyPath ? `${keyPath}.${k}` : k);
            if (violation) return { sanitized: value, violation };
            sanitizedObj[k] = sanitized;
        }
        return { sanitized: sanitizedObj, violation: null };
    }

    return { sanitized: value, violation: null };
}

/**
 * Middleware phát hiện và ngăn chặn SQL Injection chủ động
 */
function sqlInjectionGuardMiddleware(req, res, next) {
    const targets = [
        { name: "query", data: req.query },
        { name: "params", data: req.params },
        { name: "body", data: req.body },
    ];

    for (const target of targets) {
        if (!target.data) continue;

        const { sanitized, violation } = inspectAndSanitize(target.data, target.name);

        if (violation) {
            const clientIp =
                req.headers["x-forwarded-for"] ||
                req.socket?.remoteAddress ||
                req.ip ||
                "Unknown IP";

            // Ghi nhận cảnh báo an ninh mạng vào security.log
            logger.security("Phát hiện mẫu tấn công SQL Injection bị ngăn chặn!", {
                requestId: req.id,
                ip: clientIp,
                method: req.method,
                url: req.originalUrl,
                userAgent: req.headers["user-agent"] || "Unknown",
                violationField: violation.field,
                violationPattern: violation.pattern,
                violationSample: violation.sample,
            });

            // Lập tức từ chối request với mã lỗi 403 Forbidden
            return res.status(403).json({
                success: false,
                message: "Cảnh báo bảo mật: Dữ liệu đầu vào chứa ký tự hoặc mẫu câu lệnh không an toàn!",
                violation: process.env.NODE_ENV === "development" ? violation.pattern : undefined,
            });
        }

        // Cập nhật lại dữ liệu đã được làm sạch null-byte
        req[target.name] = sanitized;
    }

    next();
}

module.exports = sqlInjectionGuardMiddleware;
