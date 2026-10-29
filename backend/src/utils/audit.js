// ========================================================
// UTILS: GHI NHẬT KÝ THAO TÁC NHẠY CẢM (AUDIT LOG)
// ========================================================

const prisma = require("../config/prisma");

function getClientIp(req) {
    if (!req) return null;
    const forwarded = req.headers?.["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
        return forwarded.split(",")[0].trim().slice(0, 45);
    }
    return (req.ip || req.socket?.remoteAddress || null)?.slice(0, 45) || null;
}

/**
 * Ghi audit log. Không được làm hỏng nghiệp vụ chính nếu ghi log thất bại.
 */
async function writeAudit({
    matk = null,
    hanhdong,
    doituong,
    doituongId = null,
    truoc = null,
    sau = null,
    ip = null,
}) {
    try {
        await prisma.nhatky.create({
            data: {
                matk: matk ? Number(matk) : null,
                hanhdong: String(hanhdong).slice(0, 50),
                doituong: String(doituong).slice(0, 50),
                doituongId: doituongId !== null && doituongId !== undefined
                    ? Number(doituongId)
                    : null,
                dulieutruoc: truoc || undefined,
                dulieusau: sau || undefined,
                ip: ip ? String(ip).slice(0, 45) : null,
            },
        });
    } catch (error) {
        console.error("[Audit] Không ghi được nhật ký thao tác:", error.message);
    }
}

module.exports = {
    writeAudit,
    getClientIp,
};
