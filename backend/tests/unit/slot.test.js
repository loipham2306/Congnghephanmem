const test = require("node:test");
const assert = require("node:assert/strict");
const {
    toMinutes,
    fromMinutes,
    normalizeSlotTime,
    isAlignedToSlot,
    generateSlots,
} = require("../../src/utils/slot");

test("toMinutes/fromMinutes chuyển đổi giờ", () => {
    assert.equal(toMinutes("08:30"), 510);
    assert.equal(fromMinutes(510), "08:30");
    assert.equal(fromMinutes(0), "00:00");
});

test("normalizeSlotTime chuẩn hóa HH:mm", () => {
    assert.equal(normalizeSlotTime("8:5"), "08:05");
    assert.equal(normalizeSlotTime("25:00"), null);
    assert.equal(normalizeSlotTime("abc"), null);
});

test("isAlignedToSlot chỉ nhận bội số của slot", () => {
    assert.equal(isAlignedToSlot("08:00", 30), true);
    assert.equal(isAlignedToSlot("08:30", 30), true);
    assert.equal(isAlignedToSlot("08:15", 30), false);
    assert.equal(isAlignedToSlot("08:20", 20), true);
});

test("generateSlots sinh đúng các mốc trong ca", () => {
    assert.deepEqual(
        generateSlots("08:00", "09:00", 30),
        ["08:00", "08:30"],
    );
    assert.deepEqual(generateSlots("07:30", "09:00", 30), ["07:30", "08:00", "08:30"]);
});
