const { registerService, loginService } = require("../services/auth.service");

async function registerController(req, res, next) {
    try {
        const result = await registerService(req.body);
        res.status(201).json({
            message: "Đăng ký tài khoản thành công",
            user: result,
        });
    } catch (error) {
        next(error);
    }
}
async function loginController(req, res, next) {
    try {
        const result = await loginService(req.body);
        res.status(201).json({
            message: "Đăng nhập tài khoản thành công",
            user: result,
        });
    } catch (error) {
        next(error);
    }
}
module.exports = {
    registerController,
    loginController,
};
