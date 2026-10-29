const test = require("node:test");
const assert = require("node:assert/strict");
const {
    APPOINTMENT_STATUS,
    SLOT_HOLDING_STATUSES,
    canTransition,
    canRoleSetStatus,
} = require("../../src/constants/appointment.constant");

test("luồng trạng thái lịch hẹn hợp lệ", () => {
    assert.equal(canTransition(APPOINTMENT_STATUS.CHO_XAC_NHAN, APPOINTMENT_STATUS.DA_XAC_NHAN), true);
    assert.equal(canTransition(APPOINTMENT_STATUS.DA_XAC_NHAN, APPOINTMENT_STATUS.DA_TIEP_DON), true);
    assert.equal(canTransition(APPOINTMENT_STATUS.DA_TIEP_DON, APPOINTMENT_STATUS.DA_KHAM), true);
    assert.equal(canTransition(APPOINTMENT_STATUS.DA_XAC_NHAN, APPOINTMENT_STATUS.DA_HUY), true);
});

test("không thể quay lui hoặc khám lại lịch đã hủy", () => {
    assert.equal(canTransition(APPOINTMENT_STATUS.DA_KHAM, APPOINTMENT_STATUS.DA_HUY), false);
    assert.equal(canTransition(APPOINTMENT_STATUS.DA_HUY, APPOINTMENT_STATUS.DA_XAC_NHAN), false);
    assert.equal(canTransition(APPOINTMENT_STATUS.CHO_XAC_NHAN, APPOINTMENT_STATUS.DA_KHAM), false);
});

test("bệnh nhân chỉ được hủy lịch", () => {
    assert.equal(canRoleSetStatus("BenhNhan", APPOINTMENT_STATUS.DA_HUY), true);
    assert.equal(canRoleSetStatus("BenhNhan", APPOINTMENT_STATUS.DA_XAC_NHAN), false);
    assert.equal(canRoleSetStatus("LeTan", APPOINTMENT_STATUS.DA_TIEP_DON), true);
    assert.equal(canRoleSetStatus("BacSi", APPOINTMENT_STATUS.DA_KHAM), true);
});

test("các trạng thái còn giữ slot gồm chờ xác nhận, đã xác nhận, đã tiếp đón", () => {
    assert.deepEqual(SLOT_HOLDING_STATUSES, ["ChoXacNhan", "DaXacNhan", "DaTiepDon"]);
});
