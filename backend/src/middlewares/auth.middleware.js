const prisma = require("../config/prisma");
const { verifyToken } = require("../utils/jwt");
const {
    getCachedUser,
    setCachedUser,
} = require("../utils/authCache");

function unauthorized(res, message = "Bạn chưa đăng nhập") {
    return res.status(401).json({
        success: false,
        message,
    });
}

/**
 * Xác thực JWT + kiểm tra lại trạng thái tài khoản trong DB.
 * Nhờ vậy tài khoản bị khóa sẽ không thể tiếp tục dùng token cũ.
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return unauthorized(res);
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
        return unauthorized(res, "Định dạng token không hợp lệ");
    }

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch (error) {
        return unauthorized(res, "Token không hợp lệ hoặc đã hết hạn");
    }

    const matk = Number(decoded?.matk);
    if (!Number.isInteger(matk) || matk <= 0) {
        return unauthorized(res, "Token không chứa mã tài khoản hợp lệ");
    }

    let user = getCachedUser(matk);
    if (!user) {
        try {
            const account = await prisma.taikhoan.findUnique({
                where: { matk },
                select: {
                    matk: true,
                    tendangnhap: true,
                    vaitro: true,
                    trangthai: true,
                },
            });

            if (!account) {
                return unauthorized(res, "Tài khoản không tồn tại");
            }
            if (account.trangthai !== "HoatDong") {
                return unauthorized(res, "Tài khoản đã bị khóa");
            }

            user = account;
            setCachedUser(user);
        } catch (error) {
            return next(error);
        }
    }

    req.user = {
        matk: user.matk,
        tendangnhap: user.tendangnhap,
        vaitro: user.vaitro,
    };
    req.tokenPayload = decoded;

    return next();
}

module.exports = authMiddleware;
module.exports.unauthorized = unauthorized;
