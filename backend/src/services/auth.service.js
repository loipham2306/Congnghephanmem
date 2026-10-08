const { use } = require("../app");
const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");

async function registerService({ username, password }) {
    //chuan hoa truoc khi kiem tra
    const normalizedUserName = username.trim();

    // Kiem tra user ton tai khong
    const exitingUser = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUserName },
    });

    //xu ly loi neu ton tai
    if (exitingUser) {
        const error = new Error("Tên tài khoản đã tồn tại");
        error.statusCode = 409;
        throw error;
    }
    //hash password
    const hashedPassword = await hashPassword(password);
    const user = await prisma.taikhoan.create({
        data: {
            tendangnhap: normalizedUserName,
            matkhau: hashedPassword,
            vaitro: "BenhNhan",
        },
    });
    return {
        matk: user.matk,
        tendangnhap: user.tendangnhap,
        vaitro: user.vaitro,
        trangthai: user.trangthai,
        ngaytao: user.ngaytao,
    };
}

async function loginService({ username, password }) {
    //chuan hoa truoc khi kiem tra
    const normalizedUserName = username.trim();

    // Kiem tra user ton tai khong
    const user = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUserName },
    });
    // Kiểm tra user
    if (!user) {
        const error = new Error("Tên đăng nhập hoặc mật khẩu không đúng!");
        error.statusCode = 401;
        throw error;
    }
    //Kiểm tra trạng thái
    if (user.trangthai !== "HoatDong") {
        const error = new Error("Tài khoản đã bị khóa!");
        error.statusCode = 401;
        throw error;
    }
    //Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(password, user.matkhau);
    if (!isPasswordValid) {
        const error = new Error("Tên đăng nhập hoặc mật khẩu không đúng!");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken({
        matk: user.matk,
        vaitro: user.vaitro,
    });

    return {
        user: {
            matk: user.matk,
            tendangnhap: user.tendangnhap,
            vaitro: user.vaitro,
            trangthai: user.trangthai,
        },
        token,
    };
}

module.exports = {
    registerService,
    loginService,
};
