// Định nghĩa các hằng số và helper xử lý thời gian cho ca làm việc (Shift)
const SHIFT_ROLES = {
    MAIN_DOCTOR: "Bác sĩ khám chính",
    ASSISTANT_DOCTOR: "Bác sĩ phụ tá",
    SUPPORT_NURSE: "Y tá hỗ trợ",
    STAFF: "Nhân viên trực phòng",
};

// Biểu thức chính quy kiểm tra định dạng giờ (HH:mm hoặc HH:mm:ss) và ngày (YYYY-MM-DD)
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Chuyển đổi chuỗi giờ (ví dụ: "07:30" hoặc "07:30:00") thành đối tượng Date (chuẩn Prisma @db.Time(6))
 * Prisma PostgreSQL ánh xạ TIME sang Date với mốc ngày 1970-01-01
 */
function parseTimeToDate(timeStr) {
    if (!timeStr || typeof timeStr !== "string") return null;

    const parts = timeStr.trim().split(":");
    if (parts.length < 2) return null;

    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].padStart(2, "0");
    const seconds = parts[2] ? parts[2].padStart(2, "0") : "00";

    return new Date(`1970-01-01T${hours}:${minutes}:${seconds}.000Z`);
}

/**
 * Lấy số phút tính từ 00:00 để so sánh khoảng thời gian giao nhau chính xác
 * Hỗ trợ cả Date object lẫn chuỗi "HH:mm:ss"
 */
function getTimeInMinutes(value) {
    if (!value) return 0;

    if (value instanceof Date) {
        // Đối với Date từ Prisma (@db.Time(6)), dùng UTC hours và minutes để tránh ảnh hưởng múi giờ
        return value.getUTCHours() * 60 + value.getUTCMinutes();
    }

    if (typeof value === "string") {
        const parts = value.trim().split(":");
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
    }

    return 0;
}

/**
 * Định dạng Date object hoặc chuỗi giờ thành chuỗi hiển thị "HH:mm"
 */
function formatTime(dateValue) {
    if (!dateValue) return "";

    if (dateValue instanceof Date) {
        const hours = String(dateValue.getUTCHours()).padStart(2, "0");
        const minutes = String(dateValue.getUTCMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    if (typeof dateValue === "string") {
        const parts = dateValue.split(":");
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
        }
        return dateValue;
    }

    return "";
}

/**
 * Kiểm tra xem 2 khoảng thời gian [startA, endA] và [startB, endB] có giao nhau không
 * (startA < endB && endA > startB)
 */
function isTimeOverlap(startA, endA, startB, endB) {
    const sA = getTimeInMinutes(startA);
    const eA = getTimeInMinutes(endA);
    const sB = getTimeInMinutes(startB);
    const eB = getTimeInMinutes(endB);

    return sA < eB && eA > sB;
}

module.exports = {
    SHIFT_ROLES,
    TIME_REGEX,
    DATE_REGEX,
    parseTimeToDate,
    getTimeInMinutes,
    formatTime,
    isTimeOverlap,
};
