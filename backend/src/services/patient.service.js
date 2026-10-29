const prisma = require("../config/prisma");
const { parseDateOnly } = require("../utils/date");
const { writeAudit } = require("../utils/audit");

// Tạo hồ sơ bệnh nhân tại quầy (bệnh nhân vãng lai, chưa có tài khoản portal)
async function createPatientService(payload, actor = null, ip = null) {
    const {
        hoten,
        gioitinh,
        ngaysinh,
        sdt,
        diachi,
        cccd,
        sobhyt,
    } = payload;

    if (cccd || sobhyt) {
        const duplicate = await prisma.benhnhan.findFirst({
            where: {
                OR: [
                    ...(cccd ? [{ cccd }] : []),
                    ...(sobhyt ? [{ sobhyt }] : []),
                ],
            },
        });

        if (duplicate) {
            const error = new Error(
                duplicate.cccd === cccd
                    ? "Số CCCD đã tồn tại trong hệ thống"
                    : "Số thẻ BHYT đã tồn tại trong hệ thống",
            );
            error.statusCode = 409;
            throw error;
        }
    }

    const patient = await prisma.benhnhan.create({
        data: {
            hoten,
            gioitinh,
            ngaysinh: parseDateOnly(ngaysinh) || new Date(ngaysinh),
            sdt,
            diachi: diachi || null,
            cccd: cccd || null,
            sobhyt: sobhyt || null,
        },
    });

    await writeAudit({
        matk: actor?.matk,
        hanhdong: "TAO_BENH_NHAN",
        doituong: "benhnhan",
        doituongId: patient.mabn,
        sau: { hoten: patient.hoten, sdt: patient.sdt },
        ip,
    });

    return patient;
}

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
    if (ngaysinh !== undefined) dataToUpdate.ngaysinh = parseDateOnly(ngaysinh) || new Date(ngaysinh);
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

// 3. Lấy hồ sơ bệnh án & tiền sử bệnh
async function getMyMedicalRecordService(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk },
        select: {
            mabn: true,
            hoten: true,
            sdt: true,
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

    if (!patient) {
        const error = new Error("Không tìm thấy thông tin bệnh nhân");
        error.statusCode = 404;
        throw error;
    }

    // Nếu bệnh nhân chưa có hồ sơ bệnh án, tự động khởi tạo mặc định (tránh lỗi 404 gây crash UI)
    if (!patient.hosobenhan) {
        const newRecord = await prisma.hosobenhan.create({
            data: {
                mahsba: patient.mabn,
                nhommau: "ChuaRo",
                tiensubenh: null,
                diung: null,
                ghichu: null,
            },
        });
        return {
            ...newRecord,
            benhnhan: {
                hoten: patient.hoten,
                sdt: patient.sdt,
            },
        };
    }

    return {
        ...patient.hosobenhan,
        benhnhan: {
            hoten: patient.hoten,
            sdt: patient.sdt,
        },
    };
}

// 4. Cập nhật hồ sơ bệnh án & tiền sử bệnh của chính mình
async function updateMyMedicalRecordService(matk, medicalRecordData) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk },
        select: { mabn: true, hoten: true, sdt: true },
    });

    if (!patient) {
        const error = new Error("Không tìm thấy thông tin bệnh nhân");
        error.statusCode = 404;
        throw error;
    }

    const { nhommau, tiensubenh, diung, ghichu } = medicalRecordData;
    const updateData = {};
    if (nhommau !== undefined) updateData.nhommau = nhommau;
    if (tiensubenh !== undefined) updateData.tiensubenh = tiensubenh;
    if (diung !== undefined) updateData.diung = diung;
    if (ghichu !== undefined) updateData.ghichu = ghichu;

    const updatedRecord = await prisma.hosobenhan.upsert({
        where: { mahsba: patient.mabn },
        create: {
            mahsba: patient.mabn,
            nhommau: nhommau || "ChuaRo",
            tiensubenh: tiensubenh || null,
            diung: diung || null,
            ghichu: ghichu || null,
        },
        update: updateData,
    });

    return {
        ...updatedRecord,
        benhnhan: {
            hoten: patient.hoten,
            sdt: patient.sdt,
        },
    };
}

// 5. Lấy danh sách lịch sử khám bệnh (kèm Bác sĩ, Đơn thuốc, Dịch vụ chỉ định & Hóa đơn)
async function getMyMedicalHistoryService(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk },
        select: { mabn: true },
    });

    if (!patient) {
        const error = new Error("Không tìm thấy thông tin bệnh nhân");
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
                    mabs: true,
                    hocham: true,
                    nhanvien: { select: { hoten: true, sdt: true } },
                    chuyenkhoa: { select: { tenchuyenkhoa: true } },
                },
            },
            donthuoc: {
                select: {
                    madt: true,
                    ngayke: true,
                    ghichubacsi: true,
                    chitietdonthuoc: {
                        select: {
                            mactdt: true,
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
            chitietdichvukham: {
                select: {
                    mactdvk: true,
                    soluong: true,
                    ketqua: true,
                    dichvu: {
                        select: { tendichvu: true, dongia: true },
                    },
                },
            },
            hoadon: {
                select: {
                    mahd: true,
                    tongtien: true,
                    trangthaithanhtoan: true,
                    phuongthuctt: true,
                },
            },
        },
        orderBy: {
            ngay: "desc",
        },
    });

    return medicalHistory;
}

// 6. Lấy chi tiết 1 lần khám bệnh cụ thể
async function getMyMedicalHistoryDetailService(matk, malsk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk },
        select: { mabn: true },
    });

    if (!patient) {
        const error = new Error("Không tìm thấy thông tin bệnh nhân");
        error.statusCode = 404;
        throw error;
    }

    const record = await prisma.lichsukham.findFirst({
        where: {
            malsk: Number(malsk),
            mabn: patient.mabn,
        },
        select: {
            malsk: true,
            mabn: true,
            ngay: true,
            trieuchung: true,
            chandoan: true,
            ketluan: true,
            bacsi: {
                select: {
                    mabs: true,
                    hocham: true,
                    nhanvien: { select: { hoten: true, sdt: true } },
                    chuyenkhoa: { select: { tenchuyenkhoa: true } },
                },
            },
            donthuoc: {
                select: {
                    madt: true,
                    ngayke: true,
                    ghichubacsi: true,
                    chitietdonthuoc: {
                        select: {
                            mactdt: true,
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
            chitietdichvukham: {
                select: {
                    mactdvk: true,
                    soluong: true,
                    ketqua: true,
                    dichvu: {
                        select: { tendichvu: true, dongia: true },
                    },
                },
            },
            hoadon: {
                select: {
                    mahd: true,
                    tongtien: true,
                    trangthaithanhtoan: true,
                    phuongthuctt: true,
                },
            },
        },
    });

    if (!record) {
        const error = new Error("Không tìm thấy thông tin lần khám bệnh này!");
        error.statusCode = 404;
        throw error;
    }

    return record;
}

// 7. Dành cho Bác sĩ & Admin: Tra cứu hồ sơ & tiền sử bệnh án theo mã bệnh nhân (mabn)
async function getPatientMedicalRecordByIdService(patientId) {
    const patient = await prisma.benhnhan.findUnique({
        where: { mabn: Number(patientId) },
        select: {
            mabn: true,
            hoten: true,
            gioitinh: true,
            ngaysinh: true,
            sdt: true,
            diachi: true,
            cccd: true,
            sobhyt: true,
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

    if (!patient) {
        const error = new Error("Không tìm thấy bệnh nhân!");
        error.statusCode = 404;
        throw error;
    }

    return patient;
}

// 8. Dành cho Bác sĩ & Admin: Cập nhật hồ sơ & tiền sử bệnh án khi khám bệnh
async function updatePatientMedicalRecordByIdService(patientId, medicalRecordData) {
    const patient = await prisma.benhnhan.findUnique({
        where: { mabn: Number(patientId) },
        select: { mabn: true, hoten: true, sdt: true },
    });

    if (!patient) {
        const error = new Error("Không tìm thấy bệnh nhân!");
        error.statusCode = 404;
        throw error;
    }

    const { nhommau, tiensubenh, diung, ghichu } = medicalRecordData;
    const updateData = {};
    if (nhommau !== undefined) updateData.nhommau = nhommau;
    if (tiensubenh !== undefined) updateData.tiensubenh = tiensubenh;
    if (diung !== undefined) updateData.diung = diung;
    if (ghichu !== undefined) updateData.ghichu = ghichu;

    const updatedRecord = await prisma.hosobenhan.upsert({
        where: { mahsba: patient.mabn },
        create: {
            mahsba: patient.mabn,
            nhommau: nhommau || "ChuaRo",
            tiensubenh: tiensubenh || null,
            diung: diung || null,
            ghichu: ghichu || null,
        },
        update: updateData,
    });

    return {
        ...updatedRecord,
        benhnhan: {
            hoten: patient.hoten,
            sdt: patient.sdt,
        },
    };
}

// 9. Dành cho Admin & Lễ tân: Lấy danh sách tất cả bệnh nhân (hỗ trợ tìm kiếm, lọc, phân trang)
async function getAllPatientsService({ page = 1, limit = 10, search, gender } = {}) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (gender) {
        where.gioitinh = gender;
    }
    if (search && search.trim() !== "") {
        const keyword = search.trim();
        where.OR = [
            { hoten: { contains: keyword, mode: "insensitive" } },
            { sdt: { contains: keyword } },
            { cccd: { contains: keyword } },
            { sobhyt: { contains: keyword, mode: "insensitive" } },
        ];
    }

    const [patients, total] = await Promise.all([
        prisma.benhnhan.findMany({
            where,
            skip,
            take: limitNum,
            include: {
                taikhoan: {
                    select: {
                        matk: true,
                        tendangnhap: true,
                        trangthai: true,
                    },
                },
                hosobenhan: {
                    select: {
                        nhommau: true,
                        tiensubenh: true,
                        diung: true,
                    },
                },
                _count: {
                    select: {
                        lichhen: true,
                        lichsukham: true,
                        hoadon: true,
                    },
                },
            },
            orderBy: {
                mabn: "desc",
            },
        }),
        prisma.benhnhan.count({ where }),
    ]);

    return {
        data: patients,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
}

// 10. Dành cho Admin: Xóa bệnh nhân theo ID (có Safe Delete Guard)
async function deletePatientByIdService(patientId) {
    const mabn = Number(patientId);

    const patient = await prisma.benhnhan.findUnique({
        where: { mabn },
        include: {
            _count: {
                select: {
                    lichsukham: true,
                    hoadon: true,
                },
            },
        },
    });

    if (!patient) {
        const error = new Error(`Không tìm thấy bệnh nhân với mã ID: ${mabn}`);
        error.statusCode = 404;
        throw error;
    }

    // Safe Delete Guard: Chặn xóa nếu đã phát sinh lịch sử khám hoặc hóa đơn viện phí
    const hasHistory = patient._count.lichsukham > 0;
    const hasInvoice = patient._count.hoadon > 0;

    if (hasHistory || hasInvoice) {
        const error = new Error(
            `Không thể xóa bệnh nhân "${patient.hoten}" (ID: ${mabn}) vì đã có ${patient._count.lichsukham} lần khám bệnh và ${patient._count.hoadon} hóa đơn viện phí liên kết. Theo quy định pháp luật y tế, hồ sơ y khoa thật không được phép xóa cứng! Hãy chuyển trạng thái tài khoản sang "KhoaTaiKhoan" nếu muốn ngưng hoạt động.`
        );
        error.statusCode = 400;
        throw error;
    }

    // Nếu chưa phát sinh lịch sử khám/hóa đơn, cho phép xóa sạch trong Transaction
    await prisma.$transaction(async (tx) => {
        await tx.hosobenhan.deleteMany({ where: { mahsba: mabn } });
        await tx.lichhen.deleteMany({ where: { mabn } });
        await tx.benhnhan.delete({ where: { mabn } });
        if (patient.matk) {
            await tx.taikhoan.delete({ where: { matk: patient.matk } });
        }
    });

    return {
        mabn: patient.mabn,
        hoten: patient.hoten,
        message: `Đã xóa thành công bệnh nhân "${patient.hoten}" và tài khoản liên kết!`,
    };
}

// 11. Bệnh nhân tự yêu cầu xóa tài khoản cá nhân (có Safe Delete Guard)
async function deleteMyAccountService(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk: Number(matk) },
        include: {
            _count: {
                select: {
                    lichsukham: true,
                    hoadon: true,
                },
            },
        },
    });

    if (!patient) {
        const error = new Error("Không tìm thấy thông tin bệnh nhân tương ứng với tài khoản này!");
        error.statusCode = 404;
        throw error;
    }

    const hasHistory = patient._count.lichsukham > 0;
    const hasInvoice = patient._count.hoadon > 0;

    if (hasHistory || hasInvoice) {
        const error = new Error(
            "Tài khoản của bạn đã phát sinh lịch sử khám chữa bệnh hoặc hóa đơn viện phí tại phòng khám, do đó không thể xóa vĩnh viễn theo quy định y tế! Vui lòng liên hệ quản trị viên hoặc lễ tân để được hỗ trợ khóa tài khoản."
        );
        error.statusCode = 400;
        throw error;
    }

    await prisma.$transaction(async (tx) => {
        await tx.hosobenhan.deleteMany({ where: { mahsba: patient.mabn } });
        await tx.lichhen.deleteMany({ where: { mabn: patient.mabn } });
        await tx.benhnhan.delete({ where: { mabn: patient.mabn } });
        await tx.taikhoan.delete({ where: { matk: Number(matk) } });
    });

    return {
        mabn: patient.mabn,
        hoten: patient.hoten,
        message: "Tài khoản của bạn đã được xóa thành công khỏi hệ thống!",
    };
}

// 12. Bệnh nhân tự làm trống / reset tiền sử bệnh án
async function resetMyMedicalRecordService(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk: Number(matk) },
        select: { mabn: true, hoten: true },
    });

    if (!patient) {
        const error = new Error("Không tìm thấy thông tin bệnh nhân!");
        error.statusCode = 404;
        throw error;
    }

    const updatedRecord = await prisma.hosobenhan.upsert({
        where: { mahsba: patient.mabn },
        create: {
            mahsba: patient.mabn,
            nhommau: "ChuaRo",
            tiensubenh: null,
            diung: null,
            ghichu: null,
        },
        update: {
            nhommau: "ChuaRo",
            tiensubenh: null,
            diung: null,
            ghichu: null,
        },
    });

    return {
        ...updatedRecord,
        message: "Đã làm trống (reset) tiền sử bệnh án thành công!",
    };
}

module.exports = {
    createPatientService,
    getMyProfileService,
    updateMyProfileService,
    getMyMedicalRecordService,
    updateMyMedicalRecordService,
    getMyMedicalHistoryService,
    getMyMedicalHistoryDetailService,
    getPatientMedicalRecordByIdService,
    updatePatientMedicalRecordByIdService,
    getAllPatientsService,
    deletePatientByIdService,
    deleteMyAccountService,
    resetMyMedicalRecordService,
};

