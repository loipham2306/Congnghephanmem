// ========================================================
// UTILS: XỬ LÝ NGÀY/GIỜ THEO MÚI GIỜ VIỆT NAM (UTC+7)
// ========================================================
// Toàn bộ hệ thống phải dùng các helper này thay cho new Date().toISOString()
// để tránh lệch ngày trong khoảng 00:00 - 07:00 giờ Việt Nam.

const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";
const VN_OFFSET = "+07:00";
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function pad2(value) {
    return String(value).padStart(2, "0");
}

/**
 * Trả về ngày hiện tại theo múi giờ Việt Nam, định dạng YYYY-MM-DD.
 */
function todayVN(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: VN_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const map = {};
    for (const part of parts) {
        if (part.type !== "literal") map[part.type] = part.value;
    }
    return `${map.year}-${map.month}-${map.day}`;
}

/**
 * Định dạng một Date bất kỳ thành YYYY-MM-DD theo giờ Việt Nam.
 */
function formatDateVN(date) {
    if (!date) return null;
    return todayVN(date instanceof Date ? date : new Date(date));
}

/**
 * Chuẩn hóa chuỗi ngày YYYY-MM-DD thành Date dùng cho cột @db.Date của Prisma.
 * Prisma @db.Date nhận mốc UTC 00:00, không phụ thuộc múi giờ máy chủ.
 */
function parseDateOnly(dateStr) {
    if (typeof dateStr !== "string" || !DATE_ONLY_REGEX.test(dateStr.trim())) {
        return null;
    }
    return new Date(`${dateStr.trim()}T00:00:00.000Z`);
}

function isValidDateOnly(dateStr) {
    if (typeof dateStr !== "string" || !DATE_ONLY_REGEX.test(dateStr.trim())) {
        return false;
    }
    const normalized = dateStr.trim();
    const parsed = parseDateOnly(normalized);
    if (!(parsed instanceof Date) || Number.isNaN(parsed.getTime())) {
        return false;
    }
    // Chặn các ngày không tồn tại như 2026-02-31 (JS tự cuộn sang tháng sau).
    return parsed.toISOString().slice(0, 10) === normalized;
}

/**
 * Mốc bắt đầu ngày theo giờ Việt Nam (dùng cho cột timestamp).
 */
function startOfDayVN(dateStr) {
    return new Date(`${dateStr}T00:00:00.000${VN_OFFSET}`);
}

/**
 * Mốc kết thúc ngày theo giờ Việt Nam (dùng cho cột timestamp).
 */
function endOfDayVN(dateStr) {
    return new Date(`${dateStr}T23:59:59.999${VN_OFFSET}`);
}

/**
 * Cộng/trừ ngày trên chuỗi YYYY-MM-DD.
 */
function addDaysVN(dateStr, days) {
    const base = parseDateOnly(dateStr);
    if (!base) return null;
    base.setUTCDate(base.getUTCDate() + Number(days));
    return base.toISOString().slice(0, 10);
}

/**
 * Khoảng ngày mặc định cho báo cáo: N ngày gần nhất tính đến hôm nay (giờ VN).
 */
function dateRangeFromQuery(startDate, endDate, defaultDays = 30) {
    const endStr = isValidDateOnly(endDate) ? endDate.trim() : todayVN();
    const startStr = isValidDateOnly(startDate)
        ? startDate.trim()
        : addDaysVN(endStr, -(Math.max(1, defaultDays) - 1));

    return {
        startStr,
        endStr,
        start: startOfDayVN(startStr),
        end: endOfDayVN(endStr),
    };
}

/**
 * Khóa tháng theo giờ Việt Nam, định dạng YYYY-MM.
 */
function monthKeyVN(date) {
    return formatDateVN(date).slice(0, 7);
}

/**
 * Giờ/phút hiện tại theo Việt Nam.
 */
function nowTimeVN(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: VN_TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(date);

    const map = {};
    for (const part of parts) {
        if (part.type !== "literal") map[part.type] = part.value;
    }
    const hour = Number(map.hour);
    const minute = Number(map.minute);
    return { hour, minute, minutes: hour * 60 + minute };
}

/**
 * Ghép ngày + giờ Việt Nam thành Date tuyệt đối (dùng để so sánh với hiện tại).
 */
function combineDateAndTimeVN(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00${VN_OFFSET}`);
}

/**
 * Kiểm tra một mốc ngày + giờ đã qua chưa (theo giờ Việt Nam).
 */
function isPastDateTimeVN(dateStr, timeStr) {
    const target = combineDateAndTimeVN(dateStr, timeStr);
    return target.getTime() < Date.now();
}

module.exports = {
    VN_TIME_ZONE,
    VN_OFFSET,
    DATE_ONLY_REGEX,
    todayVN,
    formatDateVN,
    parseDateOnly,
    isValidDateOnly,
    startOfDayVN,
    endOfDayVN,
    addDaysVN,
    dateRangeFromQuery,
    monthKeyVN,
    nowTimeVN,
    combineDateAndTimeVN,
    isPastDateTimeVN,
    pad2,
};
