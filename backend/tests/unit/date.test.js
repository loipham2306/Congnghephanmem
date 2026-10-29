const test = require("node:test");
const assert = require("node:assert/strict");
const {
    todayVN,
    addDaysVN,
    startOfDayVN,
    endOfDayVN,
    dateRangeFromQuery,
    nowTimeVN,
    monthKeyVN,
} = require("../../src/utils/date");

test("todayVN chuyển đúng múi giờ Việt Nam qua nửa đêm UTC", () => {
    const at = new Date("2026-10-26T17:30:00.000Z"); // 00:30 ngày 27/10 tại VN
    assert.equal(todayVN(at), "2026-10-27");
});

test("addDaysVN cộng/trừ ngày chính xác", () => {
    assert.equal(addDaysVN("2026-10-27", 1), "2026-10-28");
    assert.equal(addDaysVN("2026-03-01", -1), "2026-02-28");
});

test("startOfDayVN và endOfDayVN quy đổi đúng UTC+7", () => {
    assert.equal(startOfDayVN("2026-10-27").toISOString(), "2026-10-26T17:00:00.000Z");
    assert.equal(endOfDayVN("2026-10-27").toISOString(), "2026-10-27T16:59:59.999Z");
});

test("dateRangeFromQuery mặc định 30 ngày gần nhất", () => {
    const range = dateRangeFromQuery(undefined, "2026-10-27", 30);
    assert.equal(range.endStr, "2026-10-27");
    assert.equal(range.startStr, "2026-09-28");
});

test("isValidDateOnly chặn ngày không tồn tại", () => {
    const { isValidDateOnly } = require("../../src/utils/date");
    assert.equal(isValidDateOnly("2026-02-31"), false);
    assert.equal(isValidDateOnly("2026-02-28"), true);
    assert.equal(isValidDateOnly("2026-13-01"), false);
});

test("monthKeyVN lấy tháng theo giờ Việt Nam", () => {
    assert.equal(monthKeyVN(new Date("2026-10-31T18:00:00.000Z")), "2026-11");
});

test("nowTimeVN trả giờ/phút theo Việt Nam", () => {
    const value = nowTimeVN(new Date("2026-10-27T01:05:00.000Z"));
    assert.deepEqual(
        { hour: value.hour, minute: value.minute },
        { hour: 8, minute: 5 },
    );
});
