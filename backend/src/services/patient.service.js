const prisma = require("../config/prisma");
async function getMyProfileService(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk: Number(matk) },
        select: {
            mabn: true,
            matk: true,
            hoten: true,
            gioitinh: true,
            ngaysinh: true,
            sdt: true,
            diachi: true,
            cccd: true,
            sobhyt: true,
            ngaydangky: true,
            taikhoan: {
                select: {
                    tendangnhap: true,
                    vaitro: true,
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

//cập nhật hồ sơ
async function updateMyProfileService(matk, profileData) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk },
    });
    if (!patient) {
        const error = new Error("Không tìm thấy bệnh nhân");
        error.statusCode = 404;
        throw error;
    }
    const { hoten, gioitinh, ngaysinh, sdt, diachi, cccd, sobhyt } =
        profileData;
    const dataToUpdate = {};
    if (hoten !== undefined) dataToUpdate.hoten = hoten;
    if (gioitinh !== undefined) dataToUpdate.gioitinh = gioitinh;
    if (ngaysinh !== undefined) dataToUpdate.ngaysinh = new Date(ngaysinh);
    if (sdt !== undefined) dataToUpdate.sdt = sdt;
    if (diachi !== undefined) dataToUpdate.diachi = diachi;
    if (cccd !== undefined) dataToUpdate.cccd = cccd;
    if (sobhyt !== undefined) dataToUpdate.sobhyt = sobhyt;

    const updatedPatient = await prisma.benhnhan.update({
        where: { matk },
        data: dataToUpdate,
    });
    return updatedPatient;
}

// lay ho so benh an
async function getMyMedicalRecordService(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk },
        select: {
            mabn: true,
            hosobenhan: {
                select: {
                    mahsba: true,
                    nhommau: true,
                    tiensubenh: true,
                    diung: true,
                    ghichu: true,
                },
            },
        },
    });

    if (!patient) throw new Error("Không tìm thấy thông tin bệnh nhân");
    if (!patient.hosobenhan) {
        const error = new Error("Chưa có hồ sơ bệnh án cho bệnh nhân này");
        error.statusCode = 404;
        throw error;
    }
    return patient.hosobenhan;
}

//lay thong tin lich su kham
async function getMyMedicalHistoryService(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: {
            matk,
        },
        select: {
            mabn: true,
        },
    });

    if (!patient) {
        const error = new Error("Không tìm thấy bệnh nhân");
        error.statusCode = 404;
        throw error;
    }

    const medicalHistory = await prisma.lichsukham.findMany({
        where: {
            mabn: patient.mabn,
        },
        select: {
            malsk: true,
            ngay: true,
            trieuchung: true,
            chandoan: true,
            ketluan: true,
            bacsi: {
                select: {
                    hocham: true,
                    nhanvien: { select: { hoten: true } },
                    chuyenkhoa: { select: { tenchuyenkhoa: true } }, // Bổ sung chuyên khoa
                },
            },
            donthuoc: {
                select: {
                    madt: true,
                    ngayke: true,
                    ghichubacsi: true,
                    chitietdonthuoc: {
                        select: {
                            soluong: true,
                            lieudung: true,
                            thoigiansudung: true,
                            thuoc: {
                                select: { tenthuoc: true, donvitinh: true },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            ngay: "desc",
        },
    });

    return medicalHistory;
}
module.exports = {
    getMyProfileService,
    updateMyProfileService,
    getMyMedicalRecordService,
    getMyMedicalHistoryService,
};
