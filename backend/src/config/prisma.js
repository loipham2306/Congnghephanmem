const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { logger } = require("./logger");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Ngưỡng thời gian xác định truy vấn chậm (Slow Query Threshold in milliseconds)
const SLOW_QUERY_THRESHOLD_MS = Number(process.env.SLOW_QUERY_THRESHOLD_MS) || 200;

const prisma = new PrismaClient({
    adapter,
    log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
    ],
});

// Lắng nghe sự kiện truy vấn để phát hiện và cảnh báo Slow Queries
prisma.$on("query", (e) => {
    if (e.duration >= SLOW_QUERY_THRESHOLD_MS) {
        logger.warn(`⚡ [SLOW QUERY ALERT] Truy vấn CSDL mất ${e.duration}ms!`, {
            duration: `${e.duration}ms`,
            query: e.query,
            params: e.params,
        });
    }
});

// Lắng nghe sự kiện cảnh báo từ Prisma
prisma.$on("warn", (e) => {
    logger.warn(`⚠️ [Prisma Warning]: ${e.message}`);
});

// Lắng nghe sự kiện lỗi từ Prisma
prisma.$on("error", (e) => {
    logger.error(`🔥 [Prisma Error]: ${e.message}`);
});

module.exports = prisma;
