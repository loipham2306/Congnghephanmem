const crypto = require("crypto");
const prisma = require("../config/prisma");
const { generateToken, getAccessTokenExpiresIn } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");
const { invalidateAuthCache } = require("../utils/authCache");
const { writeAudit } = require("../utils/audit");
const { todayVN, parseDateOnly } = require("../utils/date");
const { ROLES, ALL_ROLES } = require("../constants/role.constant");

const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS) > 0
    ? Number(process.env.REFRESH_TOKEN_DAYS)
    : 30;

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES) > 0
    ? Number(process.env.OTP_TTL_MINUTES)
    : 10;

const OTP_MAX_ATTEMPTS = 5;

function httpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function toDateOnly(value) {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function hashOpaqueToken(token) {
    return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function createOpaqueToken() {
    return crypto.randomBytes(48).toString("base64url");
}

function createOtp() {
    return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function safeEqualHex(left, right) {
    try {
        const a = Buffer.from(String(left), "hex");
        const b = Buffer.from(String(right), "hex");
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch (error) {
        return false;
    }
}

function refreshExpiryDate() {
    return new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
}

function buildUserProfile(account) {
    if (!account) return null;

    const profile = {
        matk: account.matk,
        tendangnhap: account.tendangnhap,
        vaitro: account.vaitro,
        trangthai: account.trangthai,
        ngaytao: account.ngaytao,
    };

    if (account.benhnhan) {
        profile.mabn = account.benhnhan.mabn;
        profile.hoten = account.benhnhan.hoten;
        profile.gioitinh = account.benhnhan.gioitinh;
        profile.ngaysinh = toDateOnly(account.benhnhan.ngaysinh);
        profile.sdt = account.benhnhan.sdt;
        profile.diachi = account.benhnhan.diachi;
        profile.cccd = account.benhnhan.cccd;
        profile.sobhyt = account.benhnhan.sobhyt;
    }

    if (account.nhanvien) {
        profile.manv = account.nhanvien.manv;
        profile.hoten = account.nhanvien.hoten;
        profile.gioitinh = account.nhanvien.gioitinh;
        profile.ngaysinh = toDateOnly(account.nhanvien.ngaysinh);
        profile.sdt = account.nhanvien.sdt;
        profile.diachi = account.nhanvien.diachi;
        profile.chucvu = account.nhanvien.chucvu;
        profile.ngayvaolam = toDateOnly(account.nhanvien.ngayvaolam);
        if (account.nhanvien.bacsi) {
            profile.mabs = account.nhanvien.bacsi.mabs;
            profile.mack = account.nhanvien.bacsi.mack;
        }
    }

    return profile;
}

function profileInclude() {
    return {
        benhnhan: true,
        nhanvien: {
            include: {
                bacsi: true,
            },
        },
    };
}

async function issueRefreshToken(client, matk) {
    const rawToken = createOpaqueToken();
    const tokenHash = hashOpaqueToken(rawToken);

    await client.refresh_token.create({
        data: {
            matk: Number(matk),
            token_hash: tokenHash,
            expires_at: refreshExpiryDate(),
        },
    });

    return rawToken;
}

function buildAuthPayload(account, refreshToken) {
    const accessToken = generateToken({
        matk: account.matk,
        vaitro: account.vaitro,
    });

    return {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: getAccessTokenExpiresIn(),
        refreshExpiresInDays: REFRESH_TOKEN_DAYS,
        user: buildUserProfile(account),
    };
}

async function registerService({
    username,
    password,
    hoten,
    gioitinh,
    ngaysinh,
    sdt,
}) {
    const normalizedUserName = username.trim();

    const existingUser = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUserName },
    });

    if (existingUser) {
        throw httpError(409, "Tên tài khoản đã tồn tại");
    }

    const hashedPassword = await hashPassword(password);
    const result = await prisma.$transaction(async (tx) => {
        const account = await tx.taikhoan.create({
            data: {
                tendangnhap: normalizedUserName,
                matkhau: hashedPassword,
                vaitro: ROLES.BENHNHAN,
            },
        });

        const patient = await tx.benhnhan.create({
            data: {
                matk: account.matk,
                hoten,
                gioitinh,
                ngaysinh: parseDateOnly(ngaysinh) || new Date(ngaysinh),
                sdt,
            },
        });

        return { account, patient };
    });

    return {
        matk: result.account.matk,
        tendangnhap: result.account.tendangnhap,
        vaitro: result.account.vaitro,
        mabn: result.patient.mabn,
        hoten: result.patient.hoten,
        gioitinh: result.patient.gioitinh,
        ngaysinh: toDateOnly(result.patient.ngaysinh),
        sdt: result.patient.sdt,
        trangthai: result.account.trangthai,
        ngaytao: result.account.ngaytao,
    };
}

async function loginService({ username, password }) {
    const normalizedUserName = username.trim();

    const user = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUserName },
        include: profileInclude(),
    });

    if (!user) {
        throw httpError(401, "Tên đăng nhập hoặc mật khẩu không đúng!");
    }
    if (user.trangthai !== "HoatDong") {
        throw httpError(401, "Tài khoản đã bị khóa!");
    }

    const isPasswordValid = await comparePassword(password, user.matkhau);
    if (!isPasswordValid) {
        throw httpError(401, "Tên đăng nhập hoặc mật khẩu không đúng!");
    }

    const refreshToken = await issueRefreshToken(prisma, user.matk);
    return buildAuthPayload(user, refreshToken);
}

async function getMeService(matk) {
    const account = await prisma.taikhoan.findUnique({
        where: { matk: Number(matk) },
        include: profileInclude(),
    });

    if (!account) {
        throw httpError(404, "Không tìm thấy tài khoản");
    }
    return buildUserProfile(account);
}

async function rotateRefreshTokenService(rawRefreshToken) {
    if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
        throw httpError(401, "Refresh token không hợp lệ");
    }

    const tokenHash = hashOpaqueToken(rawRefreshToken);
    const stored = await prisma.refresh_token.findUnique({
        where: { token_hash: tokenHash },
        include: {
            taikhoan: {
                include: profileInclude(),
            },
        },
    });

    if (!stored) {
        throw httpError(401, "Refresh token không hợp lệ");
    }

    if (stored.revoked_at) {
        // Phát hiện dùng lại refresh token đã thu hồi: thu hồi toàn bộ phiên của tài khoản.
        await prisma.refresh_token.updateMany({
            where: { matk: stored.matk, revoked_at: null },
            data: { revoked_at: new Date() },
        });
        throw httpError(401, "Refresh token đã bị thu hồi, vui lòng đăng nhập lại");
    }

    if (stored.expires_at.getTime() <= Date.now()) {
        throw httpError(401, "Refresh token đã hết hạn, vui lòng đăng nhập lại");
    }

    if (!stored.taikhoan || stored.taikhoan.trangthai !== "HoatDong") {
        throw httpError(401, "Tài khoản đã bị khóa");
    }

    const newRawToken = createOpaqueToken();
    const newHash = hashOpaqueToken(newRawToken);

    await prisma.$transaction(async (tx) => {
        const updated = await tx.refresh_token.updateMany({
            where: { mrt: stored.mrt, revoked_at: null },
            data: {
                revoked_at: new Date(),
                replaced_by_hash: newHash,
            },
        });

        if (updated.count !== 1) {
            throw httpError(401, "Refresh token đã được sử dụng, vui lòng đăng nhập lại");
        }

        await tx.refresh_token.create({
            data: {
                matk: stored.matk,
                token_hash: newHash,
                expires_at: refreshExpiryDate(),
            },
        });
    });

    return buildAuthPayload(stored.taikhoan, newRawToken);
}

async function logoutService(rawRefreshToken) {
    if (!rawRefreshToken || typeof rawRefreshToken !== "string") {
        return { revoked: false };
    }

    const result = await prisma.refresh_token.updateMany({
        where: {
            token_hash: hashOpaqueToken(rawRefreshToken),
            revoked_at: null,
        },
        data: { revoked_at: new Date() },
    });

    return { revoked: result.count > 0 };
}

async function changePasswordService(matk, oldPassword, newPassword) {
    const account = await prisma.taikhoan.findUnique({
        where: { matk: Number(matk) },
    });

    if (!account) {
        throw httpError(404, "Không tìm thấy tài khoản");
    }

    const valid = await comparePassword(oldPassword, account.matkhau);
    if (!valid) {
        throw httpError(400, "Mật khẩu hiện tại không đúng");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
        prisma.taikhoan.update({
            where: { matk: account.matk },
            data: { matkhau: hashedPassword },
        }),
        prisma.refresh_token.updateMany({
            where: { matk: account.matk, revoked_at: null },
            data: { revoked_at: new Date() },
        }),
    ]);

    invalidateAuthCache(account.matk);
    return { changed: true };
}

async function forgotPasswordService(username) {
    const normalized = String(username).trim();
    const account = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalized },
    });

    const genericMessage = "Nếu tài khoản tồn tại, mã OTP đã được gửi tới số điện thoại đã đăng ký.";

    if (!account || account.trangthai !== "HoatDong") {
        return { message: genericMessage };
    }

    const otp = createOtp();
    const otpHash = hashOpaqueToken(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.$transaction([
        prisma.password_reset.updateMany({
            where: { matk: account.matk, used_at: null },
            data: { used_at: new Date() },
        }),
        prisma.password_reset.create({
            data: {
                matk: account.matk,
                otp_hash: otpHash,
                expires_at: expiresAt,
            },
        }),
    ]);

    // Chưa tích hợp SMS/Email: chỉ trả OTP ở môi trường phát triển để tester dùng.
    const debugOtp = process.env.NODE_ENV !== "production" ? otp : undefined;
    if (debugOtp) {
        console.log(`[Auth] OTP đặt lại mật khẩu cho ${normalized}: ${debugOtp}`);
    }

    return {
        message: genericMessage,
        ...(debugOtp ? { devOtp: debugOtp } : {}),
    };
}

async function resetPasswordService({ username, otp, newPassword }) {
    const normalized = String(username).trim();
    const account = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalized },
    });

    if (!account) {
        throw httpError(400, "Mã OTP không hợp lệ hoặc đã hết hạn");
    }

    const reset = await prisma.password_reset.findFirst({
        where: { matk: account.matk, used_at: null },
        orderBy: { created_at: "desc" },
    });

    if (!reset || reset.expires_at.getTime() <= Date.now() || reset.attempts >= OTP_MAX_ATTEMPTS) {
        throw httpError(400, "Mã OTP không hợp lệ hoặc đã hết hạn");
    }

    if (!safeEqualHex(hashOpaqueToken(otp), reset.otp_hash)) {
        await prisma.password_reset.update({
            where: { mpr: reset.mpr },
            data: { attempts: { increment: 1 } },
        });
        throw httpError(400, "Mã OTP không đúng");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
        prisma.taikhoan.update({
            where: { matk: account.matk },
            data: { matkhau: hashedPassword },
        }),
        prisma.password_reset.update({
            where: { mpr: reset.mpr },
            data: { used_at: new Date() },
        }),
        prisma.refresh_token.updateMany({
            where: { matk: account.matk, revoked_at: null },
            data: { revoked_at: new Date() },
        }),
    ]);

    invalidateAuthCache(account.matk);
    return { reset: true };
}

async function listAccountsService({ page = 1, limit = 20, vaitro, trangthai, search }) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const where = {};
    if (vaitro) where.vaitro = vaitro;
    if (trangthai) where.trangthai = trangthai;
    if (search) {
        where.OR = [
            { tendangnhap: { contains: search, mode: "insensitive" } },
            { benhnhan: { is: { hoten: { contains: search, mode: "insensitive" } } } },
            { nhanvien: { is: { hoten: { contains: search, mode: "insensitive" } } } },
        ];
    }

    const [accounts, total] = await Promise.all([
        prisma.taikhoan.findMany({
            where,
            include: profileInclude(),
            orderBy: { matk: "desc" },
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
        }),
        prisma.taikhoan.count({ where }),
    ]);

    return {
        data: accounts.map(buildUserProfile),
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
}

async function createAccountService(payload, actor, ip = null) {
    const {
        username,
        password,
        vaitro,
        hoten,
        gioitinh,
        ngaysinh,
        sdt,
        diachi,
        cccd,
        sobhyt,
        chucvu,
        ngayvaolam,
    } = payload;

    if (!ALL_ROLES.includes(vaitro)) {
        throw httpError(400, "Vai trò không hợp lệ");
    }

    const normalizedUserName = username.trim();
    const existed = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUserName },
    });
    if (existed) {
        throw httpError(409, "Tên tài khoản đã tồn tại");
    }

    const hashedPassword = await hashPassword(password);
    const roleToChucVu = {
        [ROLES.ADMIN]: "QuanLy",
        [ROLES.BACSI]: "BacSi",
        [ROLES.YTA]: "YTa",
        [ROLES.LETAN]: "LeTan",
    };

    if (vaitro !== ROLES.BENHNHAN && chucvu && chucvu !== roleToChucVu[vaitro]) {
        throw httpError(400, "Chức vụ không khớp với vai trò tài khoản");
    }

    const account = await prisma.$transaction(async (tx) => {
        const created = await tx.taikhoan.create({
            data: {
                tendangnhap: normalizedUserName,
                matkhau: hashedPassword,
                vaitro,
            },
        });

        if (vaitro === ROLES.BENHNHAN) {
            await tx.benhnhan.create({
                data: {
                    matk: created.matk,
                    hoten,
                    gioitinh,
                    ngaysinh: parseDateOnly(ngaysinh) || new Date(ngaysinh),
                    sdt,
                    diachi: diachi || null,
                    cccd: cccd || null,
                    sobhyt: sobhyt || null,
                },
            });
        } else {
            if (!roleToChucVu[vaitro]) {
                throw httpError(400, "Nhân viên phải có chức vụ hợp lệ");
            }

            await tx.nhanvien.create({
                data: {
                    matk: created.matk,
                    hoten,
                    gioitinh,
                    ngaysinh: parseDateOnly(ngaysinh) || new Date(ngaysinh),
                    sdt,
                    diachi: diachi || null,
                    chucvu: roleToChucVu[vaitro],
                    ngayvaolam: parseDateOnly(ngayvaolam) || parseDateOnly(todayVN()),
                },
            });
        }

        return tx.taikhoan.findUnique({
            where: { matk: created.matk },
            include: profileInclude(),
        });
    });

    await writeAudit({
        matk: actor?.matk,
        hanhdong: "TAO_TAI_KHOAN",
        doituong: "taikhoan",
        doituongId: account.matk,
        sau: { tendangnhap: account.tendangnhap, vaitro: account.vaitro },
        ip,
    });

    return buildUserProfile(account);
}

async function updateAccountStatusService(matk, trangthai, actor, ip = null) {
    const targetId = Number(matk);

    if (!["HoatDong", "KhoaTaiKhoan"].includes(trangthai)) {
        throw httpError(400, "Trạng thái tài khoản không hợp lệ");
    }
    if (Number(actor?.matk) === targetId && trangthai !== "HoatDong") {
        throw httpError(400, "Bạn không thể tự khóa tài khoản của chính mình");
    }

    const before = await prisma.taikhoan.findUnique({
        where: { matk: targetId },
    });
    if (!before) {
        throw httpError(404, "Không tìm thấy tài khoản");
    }

    const updated = await prisma.taikhoan.update({
        where: { matk: targetId },
        data: { trangthai },
        include: profileInclude(),
    });

    if (trangthai !== "HoatDong") {
        await prisma.refresh_token.updateMany({
            where: { matk: targetId, revoked_at: null },
            data: { revoked_at: new Date() },
        });
    }

    invalidateAuthCache(targetId);

    await writeAudit({
        matk: actor?.matk,
        hanhdong: "DOI_TRANG_THAI_TAI_KHOAN",
        doituong: "taikhoan",
        doituongId: targetId,
        truoc: { trangthai: before.trangthai },
        sau: { trangthai: updated.trangthai },
        ip,
    });

    return buildUserProfile(updated);
}

async function resetAccountPasswordService(matk, newPassword, actor, ip = null) {
    const targetId = Number(matk);
    const account = await prisma.taikhoan.findUnique({
        where: { matk: targetId },
    });
    if (!account) {
        throw httpError(404, "Không tìm thấy tài khoản");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction([
        prisma.taikhoan.update({
            where: { matk: targetId },
            data: { matkhau: hashedPassword },
        }),
        prisma.refresh_token.updateMany({
            where: { matk: targetId, revoked_at: null },
            data: { revoked_at: new Date() },
        }),
    ]);

    invalidateAuthCache(targetId);

    await writeAudit({
        matk: actor?.matk,
        hanhdong: "DAT_LAI_MAT_KHAU",
        doituong: "taikhoan",
        doituongId: targetId,
        ip,
    });

    return { reset: true };
}

module.exports = {
    registerService,
    loginService,
    getMeService,
    rotateRefreshTokenService,
    logoutService,
    changePasswordService,
    forgotPasswordService,
    resetPasswordService,
    listAccountsService,
    createAccountService,
    updateAccountStatusService,
    resetAccountPasswordService,
};
