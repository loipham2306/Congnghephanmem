// ========================================================
// CACHE NGẮN HẠN TRẠNG THÁI TÀI KHOẢN
// ========================================================
// Giảm 1 truy vấn DB cho mỗi request nhưng vẫn đảm bảo tài khoản bị khóa
// sẽ mất quyền truy cập trong tối đa AUTH_CACHE_TTL_MS.

const CACHE_TTL_MS = Number(process.env.AUTH_CACHE_TTL_MS) > 0
    ? Number(process.env.AUTH_CACHE_TTL_MS)
    : 15000;

const cache = new Map();

function getCachedUser(matk) {
    const key = Number(matk);
    const entry = cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
        cache.delete(key);
        return null;
    }
    return entry.user;
}

function setCachedUser(user) {
    if (!user || !user.matk) return;
    cache.set(Number(user.matk), {
        user,
        expiresAt: Date.now() + CACHE_TTL_MS,
    });
}

function invalidateAuthCache(matk) {
    cache.delete(Number(matk));
}

function clearAuthCache() {
    cache.clear();
}

module.exports = {
    CACHE_TTL_MS,
    getCachedUser,
    setCachedUser,
    invalidateAuthCache,
    clearAuthCache,
};
