const express = require("express");
const authController = require("../controllers/auth.controller");
const {
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
} = require("../validators/auth.validator");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const router = express.Router();

// 1. Xác thực công khai
router.post("/register", validateRegister, authController.registerController);
router.post("/login", validateLogin, authController.loginController);
router.post("/refresh", validateRefreshToken, authController.refreshTokenController);
router.post("/logout", validateRefreshToken, authController.logoutController);

// 2. Quên / đặt lại mật khẩu (OTP)
router.post("/forgot-password", validateForgotPassword, authController.forgotPasswordController);
router.post("/reset-password", validateResetPassword, authController.resetPasswordController);

// 3. Tài khoản đang đăng nhập
router.get("/me", authMiddleware, authController.meController);
router.get("/profile", authMiddleware, authController.meController);
router.put(
    "/me/password",
    authMiddleware,
    validateChangePassword,
    authController.changePasswordController,
);

// 4. Quản trị tài khoản (Admin)
router.get(
    "/accounts",
    authMiddleware,
    roleMiddleware("Admin"),
    authController.listAccountsController,
);
router.post(
    "/accounts",
    authMiddleware,
    roleMiddleware("Admin"),
    validateCreateAccount,
    authController.createAccountController,
);
router.patch(
    "/accounts/:id/status",
    authMiddleware,
    roleMiddleware("Admin"),
    validateAccountId,
    validateAccountStatus,
    authController.updateAccountStatusController,
);
router.post(
    "/accounts/:id/reset-password",
    authMiddleware,
    roleMiddleware("Admin"),
    validateAccountId,
    validateResetAccountPassword,
    authController.resetAccountPasswordController,
);

module.exports = router;
