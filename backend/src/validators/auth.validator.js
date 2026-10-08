function validateRegister(req, res, next) {
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
