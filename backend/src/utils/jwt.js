const jwt = require("jsonwebtoken");
function generateToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw Error("JWT_SECRET chưa được cấu hình");
    return jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
}

function verifyToken(token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw Error("JWT_SECRET chưa được cấu hình");
    return jwt.verify(token, secret);
}
module.exports = {
    generateToken,
    verifyToken,
};
