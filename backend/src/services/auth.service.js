const { use } = require("../app");
const prisma = require("../config/prisma");
const { generateToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");

async function registerService({
    username,
    password,
    hoten,
    gioitinh,
    ngaysinh,
    sdt,
}) {
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
    const result = await prisma.$transaction(async (tx) => {
        const account = await tx.taikhoan.create({
            data: {
                tendangnhap: normalizedUserName,
                matkhau: hashedPassword,
                vaitro: "BenhNhan",
            },
        });

        const patient = await tx.benhnhan.create({
            data: {
                matk: account.matk,
                hoten,
                gioitinh,
                ngaysinh: new Date(ngaysinh),
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
        ngaysinh: result.patient.ngaysinh,
        sdt: result.patient.sdt,

        trangthai: result.account.trangthai,
        ngaytao: result.account.ngaytao,
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
