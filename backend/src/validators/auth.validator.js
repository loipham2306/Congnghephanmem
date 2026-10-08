function validateRegister(req, res, next) {
    const { username, password, hoten, gioitinh, ngaysinh, sdt } = req.body;

    if (!username || typeof username !== "string") {
        return res.status(400).json({
            success: false,
            message: "Username là bắt buộc",
        });
    }

    if (!password || typeof password !== "string") {
        return res.status(400).json({
            success: false,
            message: "Password là bắt buộc",
        });
    }

    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Username phải có ít nhất 3 ký tự",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password phải có ít nhất 6 ký tự",
        });
    }
    if (!hoten || typeof hoten !== "string") {
        return res.status(400).json({
            success: false,
            message: "Họ tên là bắt buộc",
        });
    }
    if (!gioitinh || typeof gioitinh !== "string") {
        return res.status(400).json({
            success: false,
            message: "Giới tính là bắt buộc",
        });
    }
    if (gioitinh !== "Nam" && gioitinh !== "Nu") {
        return res.status(400).json({
            success: false,
            message: "Giới tính không hợp lệ",
        });
    }
    if (!ngaysinh || typeof ngaysinh !== "string") {
        return res.status(400).json({
            success: false,
            message: "Ngày sinh là bắt buộc",
        });
    }
    if (
        new Date(ngaysinh).getFullYear() < 1900 ||
        new Date(ngaysinh).getFullYear() > 2026
    ) {
        return res.status(400).json({
            success: false,
            message: "Ngày sinh không hợp lệ",
        });
    }
    if (!sdt || typeof sdt !== "string") {
        return res.status(400).json({
            success: false,
            message: "Số điện thoại là bắt buộc",
        });
    }
    if (sdt.length !== 10) {
        return res.status(400).json({
            success: false,
            message: "Số điện thoại không hợp lệ",
        });
    }
    req.body.username = normalizedUsername;

    next();
}
function validateLogin(req, res, next) {
    const { username, password } = req.body;

    if (!username || typeof username !== "string") {
        return res.status(400).json({
            success: false,
            message: "Username là bắt buộc",
        });
    }

    if (!password || typeof password !== "string") {
        return res.status(400).json({
            success: false,
            message: "Password là bắt buộc",
        });
    }

    req.body.username = username.trim();

    next();
}

module.exports = {
    validateRegister,
    validateLogin,
};
