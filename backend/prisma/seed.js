require("dotenv").config();

const prisma = require("../src/config/prisma");
const { hashPassword } = require("../src/utils/password");
const { parseDateOnly, todayVN } = require("../src/utils/date");

async function main() {
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    const specialty = await prisma.chuyenkhoa.upsert({
        where: { tenchuyenkhoa: "Nội tổng quát" },
        update: {},
        create: {
            tenchuyenkhoa: "Nội tổng quát",
            mota: "Chuyên khoa nội tổng quát",
        },
    });

    await prisma.dichvu.upsert({
        where: { madv: 1 },
        update: {},
        create: {
            madv: 1,
            tendichvu: "Khám nội tổng quát",
            dongia: 150000,
            mack: specialty.mack,
        },
    });

    let account = await prisma.taikhoan.findUnique({
        where: { tendangnhap: adminUsername },
    });

    if (!account) {
        account = await prisma.taikhoan.create({
            data: {
                tendangnhap: adminUsername,
                matkhau: await hashPassword(adminPassword),
                vaitro: "Admin",
            },
        });
        console.log(`Đã tạo tài khoản Admin: ${adminUsername}`);
    } else {
        console.log(`Tài khoản ${adminUsername} đã tồn tại, giữ nguyên mật khẩu.`);
    }

    const staff = await prisma.nhanvien.findUnique({
        where: { matk: account.matk },
    });

    if (!staff) {
        await prisma.nhanvien.create({
            data: {
                matk: account.matk,
                hoten: "Quản trị viên",
                gioitinh: "Khac",
                ngaysinh: parseDateOnly("1990-01-01"),
                sdt: process.env.ADMIN_PHONE || "0900000000",
                diachi: "Phòng khám",
                chucvu: "QuanLy",
                ngayvaolam: parseDateOnly(todayVN()),
            },
        });
        console.log("Đã tạo hồ sơ nhân viên cho Admin.");
    }

    console.log("Seed dữ liệu tối thiểu hoàn tất.");
}

main()
    .catch((error) => {
        console.error("Seed thất bại:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
