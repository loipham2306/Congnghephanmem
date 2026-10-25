function roleMiddleware(...allowedRoles) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Chưa xác thực ",
                });
            }
            const userRole = req.user.vaitro;
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Bạn không có quyền truy cập vào tài nguyên này. Tài nguyên chỉ dành cho các vai trò: ${allowedRoles.join(", ")}`,
                });
            }
            next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: "Xác thực vai trò thất bại",
            });
        }
    };
}
module.exports = {
    roleMiddleware,
};
