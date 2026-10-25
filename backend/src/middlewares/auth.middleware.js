const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        // Không có Authorization header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập",
            });
        }

        const [type, token] = authHeader.split(" ");
        if (type != "Bearer" || !token) {
            return res.status(401).json({
                success: false,
                message: "Định dạng token không hợp lệ",
            });
        }
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn",
        });
    }
}
module.exports = authMiddleware;
