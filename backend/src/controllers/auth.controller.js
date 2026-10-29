const authService = require("../services/auth.service");
const { getClientIp } = require("../utils/audit");

function ok(res, data, message, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}

async function registerController(req, res, next) {
    try {
        const result = await authService.registerService(req.body);
        return ok(res, result, "Đăng ký tài khoản thành công", 201);
    } catch (error) {
        return next(error);
    }
}

async function loginController(req, res, next) {
    try {
        const result = await authService.loginService(req.body);
        return ok(res, result, "Đăng nhập thành công");
    } catch (error) {
        return next(error);
    }
}

async function meController(req, res, next) {
    try {
        const result = await authService.getMeService(req.user.matk);
        return ok(res, result, "Lấy thông tin tài khoản thành công");
    } catch (error) {
        return next(error);
    }
}

async function refreshTokenController(req, res, next) {
    try {
        const result = await authService.rotateRefreshTokenService(req.body.refreshToken);
        return ok(res, result, "Làm mới phiên đăng nhập thành công");
    } catch (error) {
        return next(error);
    }
}

async function logoutController(req, res, next) {
    try {
        const result = await authService.logoutService(req.body.refreshToken);
        return ok(res, result, "Đăng xuất thành công");
    } catch (error) {
        return next(error);
    }
}

async function changePasswordController(req, res, next) {
    try {
        const result = await authService.changePasswordService(
            req.user.matk,
            req.body.oldPassword,
            req.body.newPassword,
        );
        return ok(res, result, "Đổi mật khẩu thành công, vui lòng đăng nhập lại");
    } catch (error) {
        return next(error);
    }
}

async function forgotPasswordController(req, res, next) {
    try {
        const result = await authService.forgotPasswordService(req.body.username);
        return ok(res, result, result.message);
    } catch (error) {
        return next(error);
    }
}

async function resetPasswordController(req, res, next) {
    try {
        const result = await authService.resetPasswordService(req.body);
        return ok(res, result, "Đặt lại mật khẩu thành công, vui lòng đăng nhập lại");
    } catch (error) {
        return next(error);
    }
}

async function listAccountsController(req, res, next) {
    try {
        const result = await authService.listAccountsService(req.query);
        return ok(res, result, "Lấy danh sách tài khoản thành công");
    } catch (error) {
        return next(error);
    }
}

async function createAccountController(req, res, next) {
    try {
        const result = await authService.createAccountService(
            req.body,
            req.user,
            getClientIp(req),
        );
        return ok(res, result, "Tạo tài khoản thành công", 201);
    } catch (error) {
        return next(error);
    }
}

async function updateAccountStatusController(req, res, next) {
    try {
        const result = await authService.updateAccountStatusService(
            req.params.id,
            req.body.trangthai,
            req.user,
            getClientIp(req),
        );
        return ok(res, result, "Cập nhật trạng thái tài khoản thành công");
    } catch (error) {
        return next(error);
    }
}

async function resetAccountPasswordController(req, res, next) {
    try {
        const result = await authService.resetAccountPasswordService(
            req.params.id,
            req.body.newPassword,
            req.user,
            getClientIp(req),
        );
        return ok(res, result, "Đặt lại mật khẩu tài khoản thành công");
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    registerController,
    loginController,
    meController,
    refreshTokenController,
    logoutController,
    changePasswordController,
    forgotPasswordController,
    resetPasswordController,
    listAccountsController,
    createAccountController,
    updateAccountStatusController,
    resetAccountPasswordController,
};
