// ========================================================
// CONSTANT: HÓA ĐƠN, THANH TOÁN & HOÀN TIỀN
// ========================================================

const PAYMENT_METHODS = Object.freeze([
    "TienMat",
    "ChuyenKhoan",
    "TheThanhToan",
    "ViDienTu",
]);

const PAYMENT_STATUS = Object.freeze({
    CHUA_THANH_TOAN: "ChuaThanhToan",
    DA_THANH_TOAN: "DaThanhToan",
    DA_HUY: "DaHuy",
});

const ALL_PAYMENT_STATUSES = Object.freeze(Object.values(PAYMENT_STATUS));

module.exports = {
    PAYMENT_METHODS,
    PAYMENT_STATUS,
    ALL_PAYMENT_STATUSES,
};
