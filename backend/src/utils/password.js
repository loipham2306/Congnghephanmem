const bcrypt = require("bcrypt");
async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}
async function comparePassword(password, hash) {
    if (!password || !hash) return false;
    return bcrypt.compare(password, hash);
}

module.exports = {
    hashPassword,
    comparePassword,
};
