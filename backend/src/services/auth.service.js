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

async function getAllUsersService() {
    const accounts = await prisma.taikhoan.findMany({
        include: {
            nhanvien: true,
            benhnhan: true,
        },
        orderBy: { matk: "asc" },
    });

    return accounts.map((acc) => {
        const isStaff = !!acc.nhanvien;
        const isPatient = !!acc.benhnhan;
        const name = acc.nhanvien?.hoten || acc.benhnhan?.hoten || (acc.tendangnhap === 'admin' ? 'Quản Trị Viên Hệ Thống' : (acc.tendangnhap === 'ketoan' ? 'Kế Toán Viên (Thu Ngân)' : acc.tendangnhap));
        const phone = acc.nhanvien?.sdt || acc.benhnhan?.sdt || '';
        const role = acc.vaitro;

        return {
            id: acc.matk,
            matk: acc.matk,
            username: acc.tendangnhap,
            name,
            email: `${acc.tendangnhap}@phongkham.vn`,
            role,
            status: acc.trangthai === "HoatDong" ? "ACTIVE" : "LOCKED",
            rawStatus: acc.trangthai,
            phone,
            gender: acc.nhanvien?.gioitinh || acc.benhnhan?.gioitinh || 'Nam',
            createdAt: acc.ngaytao,
            lastLogin: new Date(acc.ngaytao).toISOString().replace("T", " ").substring(0, 16),
            isStaff,
            isPatient
        };
    });
}

async function toggleUserStatusService(userId) {
    const matk = Number(userId);
    const user = await prisma.taikhoan.findUnique({ where: { matk } });
    if (!user) {
        const error = new Error(`Không tìm thấy tài khoản với ID: ${matk}`);
        error.statusCode = 404;
        throw error;
    }

    const newStatus = user.trangthai === "HoatDong" ? "KhoaTaiKhoan" : "HoatDong";
    const updated = await prisma.taikhoan.update({
        where: { matk },
        data: { trangthai: newStatus },
    });

    return {
        matk: updated.matk,
        tendangnhap: updated.tendangnhap,
        trangthai: updated.trangthai,
        status: updated.trangthai === "HoatDong" ? "ACTIVE" : "LOCKED",
    };
}

async function createUserService({ username, password, hoten, vaitro, sdt, gioitinh }) {
    const normalizedUsername = (username || '').trim();
    if (!normalizedUsername) {
        const error = new Error("Tên đăng nhập không được để trống!");
        error.statusCode = 400;
        throw error;
    }

    const existing = await prisma.taikhoan.findUnique({
        where: { tendangnhap: normalizedUsername }
    });
    if (existing) {
        const error = new Error("Tên tài khoản đã tồn tại trong hệ thống!");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await hashPassword(password || "123456");
    const validRole = ["Admin", "BacSi", "YTa", "LeTan", "BenhNhan"].includes(vaitro) ? vaitro : "Admin";

    const account = await prisma.$transaction(async (tx) => {
        const acc = await tx.taikhoan.create({
            data: {
                tendangnhap: normalizedUsername,
                matkhau: hashedPassword,
                vaitro: validRole,
                trangthai: "HoatDong"
            }
        });

        if (validRole === "BenhNhan") {
            await tx.benhnhan.create({
                data: {
                    matk: acc.matk,
                    hoten: hoten || normalizedUsername,
                    gioitinh: gioitinh === "Nu" ? "Nu" : "Nam",
                    ngaysinh: new Date("2000-01-01"),
                    sdt: sdt || "0900000000"
                }
            });
        } else {
            await tx.nhanvien.create({
                data: {
                    matk: acc.matk,
                    hoten: hoten || normalizedUsername,
                    gioitinh: gioitinh === "Nu" ? "Nu" : "Nam",
                    ngaysinh: new Date("1990-01-01"),
                    sdt: sdt || "0900000000",
                    chucvu: ["BacSi", "YTa", "LeTan"].includes(validRole) ? validRole : "QuanLy",
                    ngayvaolam: new Date()
                }
            });
        }

        return acc;
    });

    return {
        matk: account.matk,
        tendangnhap: account.tendangnhap,
        vaitro: account.vaitro,
        hoten: hoten || normalizedUsername,
        trangthai: account.trangthai
    };
}

module.exports = {
    registerService,
    loginService,
    getAllUsersService,
    toggleUserStatusService,
    createUserService,
};
