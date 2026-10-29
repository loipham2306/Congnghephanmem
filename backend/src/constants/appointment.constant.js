// ========================================================
// CONSTANT: TRẠNG THÁI LỊCH HẸN & LUỒNG CHUYỂN TRẠNG THÁI
// ========================================================

const APPOINTMENT_STATUS = Object.freeze({
    CHO_XAC_NHAN: "ChoXacNhan",
    DA_XAC_NHAN: "DaXacNhan",
    DA_TIEP_DON: "DaTiepDon",
    DA_KHAM: "DaKham",
    DA_HUY: "DaHuy",
});

const ALL_APPOINTMENT_STATUSES = Object.freeze(Object.values(APPOINTMENT_STATUS));

// Các trạng thái còn giữ chỗ trên slot (dùng cho chống trùng + partial unique index)
const SLOT_HOLDING_STATUSES = Object.freeze([
    APPOINTMENT_STATUS.CHO_XAC_NHAN,
    APPOINTMENT_STATUS.DA_XAC_NHAN,
    APPOINTMENT_STATUS.DA_TIEP_DON,
]);

// Luồng chuyển trạng thái hợp lệ
const ALLOWED_TRANSITIONS = Object.freeze({
    [APPOINTMENT_STATUS.CHO_XAC_NHAN]: [
        APPOINTMENT_STATUS.DA_XAC_NHAN,
        APPOINTMENT_STATUS.DA_HUY,
    ],
    [APPOINTMENT_STATUS.DA_XAC_NHAN]: [
        APPOINTMENT_STATUS.DA_TIEP_DON,
        APPOINTMENT_STATUS.DA_KHAM,
        APPOINTMENT_STATUS.DA_HUY,
    ],
    [APPOINTMENT_STATUS.DA_TIEP_DON]: [
        APPOINTMENT_STATUS.DA_KHAM,
        APPOINTMENT_STATUS.DA_HUY,
    ],
    [APPOINTMENT_STATUS.DA_KHAM]: [],
    [APPOINTMENT_STATUS.DA_HUY]: [],
});

// Vai trò được phép đặt một trạng thái đích (bệnh nhân chỉ được hủy lịch của mình)
const ROLE_ALLOWED_TARGET_STATUSES = Object.freeze({
    Admin: [APPOINTMENT_STATUS.DA_XAC_NHAN, APPOINTMENT_STATUS.DA_TIEP_DON, APPOINTMENT_STATUS.DA_KHAM, APPOINTMENT_STATUS.DA_HUY],
    LeTan: [APPOINTMENT_STATUS.DA_XAC_NHAN, APPOINTMENT_STATUS.DA_TIEP_DON, APPOINTMENT_STATUS.DA_HUY],
    BacSi: [APPOINTMENT_STATUS.DA_XAC_NHAN, APPOINTMENT_STATUS.DA_KHAM, APPOINTMENT_STATUS.DA_HUY],
    YTa: [],
    BenhNhan: [APPOINTMENT_STATUS.DA_HUY],
});

function canTransition(fromStatus, toStatus) {
    const allowed = ALLOWED_TRANSITIONS[fromStatus];
    return Array.isArray(allowed) && allowed.includes(toStatus);
}

function canRoleSetStatus(role, toStatus) {
    const allowed = ROLE_ALLOWED_TARGET_STATUSES[role];
    return Array.isArray(allowed) && allowed.includes(toStatus);
}

module.exports = {
    APPOINTMENT_STATUS,
    ALL_APPOINTMENT_STATUSES,
    SLOT_HOLDING_STATUSES,
    ALLOWED_TRANSITIONS,
    ROLE_ALLOWED_TARGET_STATUSES,
    canTransition,
    canRoleSetStatus,
};
