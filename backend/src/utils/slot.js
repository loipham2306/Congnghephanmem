// ========================================================
// UTILS: TÍNH TOÁN KHUNG GIỜ (SLOT) ĐẶT LỊCH
// ========================================================

const { SLOT_MINUTES } = require("../constants/slot.constant");
const { getTimeInMinutes } = require("../constants/shift.constant");

function toMinutes(value) {
    return getTimeInMinutes(value);
}

function fromMinutes(totalMinutes) {
    const safe = Math.max(0, Math.min(24 * 60 - 1, Number(totalMinutes) || 0));
    const hours = Math.floor(safe / 60);
    const minutes = safe % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function normalizeSlotTime(timeStr) {
    if (typeof timeStr !== "string") return null;
    const parts = timeStr.trim().split(":");
    if (parts.length < 2) return null;
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function isAlignedToSlot(timeStr, slotMinutes = SLOT_MINUTES) {
    const normalized = normalizeSlotTime(timeStr);
    if (!normalized) return false;
    const minutes = toMinutes(normalized);
    const step = Number(slotMinutes) > 0 ? Number(slotMinutes) : SLOT_MINUTES;
    return minutes % step === 0;
}

/**
 * Sinh danh sách slot trong khoảng [start, end).
 * start/end có thể là Date (@db.Time) hoặc chuỗi HH:mm.
 */
function generateSlots(startValue, endValue, slotMinutes = SLOT_MINUTES) {
    const start = toMinutes(startValue);
    const end = toMinutes(endValue);
    const step = Number(slotMinutes) > 0 ? Number(slotMinutes) : SLOT_MINUTES;
    const slots = [];

    for (let cursor = start; cursor + step <= end; cursor += step) {
        slots.push(fromMinutes(cursor));
    }

    return slots;
}

module.exports = {
    toMinutes,
    fromMinutes,
    normalizeSlotTime,
    isAlignedToSlot,
    generateSlots,
};
