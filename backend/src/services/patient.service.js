const prisma = require("../config/prisma");
async function getMyProfileService(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk: Number(matk) },
        include: {
            taikhoan: {
                select: {
                    tendangnhap: true,
                    vaitro: true,
                    trangthai: true,
                },
            },
        },
    });

    if (!patient) {
        const error = new Error("Tài khoản chưa có thông tin hồ sơ bệnh nhân");
        error.statusCode = 404;
        throw error;
    }

    return patient;
}

module.exports = {
    getMyProfileService,
};
