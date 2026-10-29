// ========================================================
// CONSTANT: CẤU HÌNH KHUNG GIỜ ĐẶT LỊCH (SLOT)
// ========================================================

function toPositiveInt(value, fallback) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const SLOT_MINUTES = toPositiveInt(process.env.SLOT_MINUTES, 30);
const MAX_ADVANCE_DAYS = toPositiveInt(process.env.MAX_ADVANCE_DAYS, 30);
const MIN_LEAD_MINUTES = Number.isInteger(Number(process.env.MIN_LEAD_MINUTES))
    ? Number(process.env.MIN_LEAD_MINUTES)
    : 0;

module.exports = {
    SLOT_MINUTES,
    MAX_ADVANCE_DAYS,
    MIN_LEAD_MINUTES,
};
