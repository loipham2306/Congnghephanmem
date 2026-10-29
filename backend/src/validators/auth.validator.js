const { ALL_ROLES } = require("../constants/role.constant");
const { isValidDateOnly, todayVN } = require("../utils/date");

function badRequest(res, message) {
    return res.status(400).json({
        success: false,
        message,
    });
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidPhone(value) {
    return typeof value === "string" && /^\d{10}$/.test(value.trim());
}

function isValidBirthDate(value) {
    if (!isValidDateOnly(value)) return false;
    return value.trim() <= todayVN();
}

function validateRegister(req, res, next) {
    const { username, password, hoten, gioitinh, ngaysinh, sdt } = req.body;

    if (!isNonEmptyString(username)) {
        return badRequest(res, "Username là bắt buộc");
    }
    if (username.trim().length < 3 || username.trim().length > 50) {
        return badRequest(res, "Username phải có từ 3 đến 50 ký tự");
    }
    if (!isNonEmptyString(password) || password.length < 6) {
        return badRequest(res, "Password phải có ít nhất 6 ký tự");
    }
    if (!isNonEmptyString(hoten) || hoten.trim().length < 2 || hoten.trim().length > 100) {
        return badRequest(res, "Họ tên phải có từ 2 đến 100 ký tự");
    }
    if (!["Nam", "Nu", "Khac"].includes(gioitinh)) {
        return badRequest(res, "Giới tính không hợp lệ");
    }
    if (!isValidBirthDate(ngaysinh)) {
        return badRequest(res, "Ngày sinh không hợp lệ (định dạng YYYY-MM-DD và không ở tương lai)");
    }
    if (!isValidPhone(sdt)) {
        return badRequest(res, "Số điện thoại phải gồm đúng 10 chữ số");
    }

    req.body.username = username.trim();
    req.body.hoten = hoten.trim();
    req.body.sdt = sdt.trim();
    req.body.ngaysinh = ngaysinh.trim();

    return next();
}

function validateLogin(req, res, next) {
    const { username, password } = req.body;

    if (!isNonEmptyString(username)) {
        return badRequest(res, "Username là bắt buộc");
    }
    if (!isNonEmptyString(password)) {
        return badRequest(res, "Password là bắt buộc");
    }

    req.body.username = username.trim();
    return next();
}

function validateRefreshToken(req, res, next) {
    if (!isNonEmptyString(req.body.refreshToken)) {
        return badRequest(res, "refreshToken là bắt buộc");
    }
    req.body.refreshToken = req.body.refreshToken.trim();
    return next();
}

function validateChangePassword(req, res, next) {
    const { oldPassword, newPassword } = req.body;

    if (!isNonEmptyString(oldPassword)) {
        return badRequest(res, "Mật khẩu hiện tại là bắt buộc");
    }
    if (!isNonEmptyString(newPassword) || newPassword.length < 6) {
        return badRequest(res, "Mật khẩu mới phải có ít nhất 6 ký tự");
    }
    if (oldPassword === newPassword) {
        return badRequest(res, "Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    return next();
}

function validateForgotPassword(req, res, next) {
    if (!isNonEmptyString(req.body.username)) {
        return badRequest(res, "Username là bắt buộc");
    }
    req.body.username = req.body.username.trim();
    return next();
}

function validateResetPassword(req, res, next) {
    const { username, otp, newPassword } = req.body;

    if (!isNonEmptyString(username)) {
        return badRequest(res, "Username là bắt buộc");
    }
    if (!/^\d{6}$/.test(String(otp || "").trim())) {
        return badRequest(res, "Mã OTP phải gồm đúng 6 chữ số");
    }
    if (!isNonEmptyString(newPassword) || newPassword.length < 6) {
        return badRequest(res, "Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    req.body.username = username.trim();
    req.body.otp = String(otp).trim();
    return next();
}

function validateAccountId(req, res, next) {
    const matk = Number(req.params.id);
    if (!Number.isInteger(matk) || matk <= 0) {
        return badRequest(res, "Mã tài khoản (:id) phải là số nguyên dương");
    }
    return next();
}

function validateCreateAccount(req, res, next) {
    const {
        username,
        password,
        vaitro,
        hoten,
        gioitinh,
        ngaysinh,
        sdt,
        cccd,
        sobhyt,
        ngayvaolam,
    } = req.body;

    if (!isNonEmptyString(username) || username.trim().length < 3 || username.trim().length > 50) {
        return badRequest(res, "Username phải có từ 3 đến 50 ký tự");
    }
    if (!isNonEmptyString(password) || password.length < 6) {
        return badRequest(res, "Password phải có ít nhất 6 ký tự");
    }
    if (!ALL_ROLES.includes(vaitro)) {
        return badRequest(res, `Vai trò phải là một trong: ${ALL_ROLES.join(", ")}`);
    }
    if (!isNonEmptyString(hoten) || hoten.trim().length < 2 || hoten.trim().length > 100) {
        return badRequest(res, "Họ tên phải có từ 2 đến 100 ký tự");
    }
    if (!["Nam", "Nu", "Khac"].includes(gioitinh)) {
        return badRequest(res, "Giới tính không hợp lệ");
    }
    if (!isValidBirthDate(ngaysinh)) {
        return badRequest(res, "Ngày sinh không hợp lệ");
    }
    if (!isValidPhone(sdt)) {
        return badRequest(res, "Số điện thoại phải gồm đúng 10 chữ số");
    }
    if (cccd !== undefined && cccd !== null && cccd !== "" && !/^\d{12}$/.test(String(cccd))) {
        return badRequest(res, "CCCD phải gồm đúng 12 chữ số");
    }
    if (sobhyt !== undefined && sobhyt !== null && sobhyt !== "" && String(sobhyt).length > 20) {
        return badRequest(res, "Số BHYT không được vượt quá 20 ký tự");
    }
    if (
        vaitro !== "BenhNhan"
        && req.body.chucvu !== undefined
        && !["BacSi", "YTa", "LeTan", "QuanLy"].includes(req.body.chucvu)
    ) {
        return badRequest(res, "Chức vụ không hợp lệ");
    }
    if (vaitro !== "BenhNhan" && ngayvaolam !== undefined && ngayvaolam !== null && ngayvaolam !== "") {
        if (!isValidDateOnly(ngayvaolam)) {
            return badRequest(res, "Ngày vào làm không hợp lệ");
        }
    }

    req.body.username = username.trim();
    req.body.hoten = hoten.trim();
    req.body.sdt = sdt.trim();
    req.body.ngaysinh = ngaysinh.trim();
    req.body.diachi = req.body.diachi ? String(req.body.diachi).trim() : null;
    req.body.cccd = cccd ? String(cccd).trim() : null;
    req.body.sobhyt = sobhyt ? String(sobhyt).trim() : null;

    return next();
}

function validateAccountStatus(req, res, next) {
    if (!["HoatDong", "KhoaTaiKhoan"].includes(req.body.trangthai)) {
        return badRequest(res, "Trạng thái phải là HoatDong hoặc KhoaTaiKhoan");
    }
    return next();
}

function validateResetAccountPassword(req, res, next) {
    if (!isNonEmptyString(req.body.newPassword) || req.body.newPassword.length < 6) {
        return badRequest(res, "Mật khẩu mới phải có ít nhất 6 ký tự");
    }
    return next();
}

module.exports = {
    validateRegister,
    validateLogin,
    validateRefreshToken,
    validateChangePassword,
    validateForgotPassword,
    validateResetPassword,
    validateAccountId,
    validateCreateAccount,
    validateAccountStatus,
    validateResetAccountPassword,
};
