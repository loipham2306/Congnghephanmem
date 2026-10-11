// Định nghĩa trạng thái phòng khám

const ROOM_STATUS = {
    READY: "SanSang",
    IN_USE: "DangSuDung",
    MAINTENANCE: "BaoTri",
};

const VALID_ROOM_STATUSES = Object.values(ROOM_STATUS);

module.exports = {
    ROOM_STATUS,
    VALID_ROOM_STATUSES,
};
