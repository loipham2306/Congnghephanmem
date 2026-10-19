const prisma = require("../config/prisma");

// Helper: Lấy mã bác sĩ (mabs) từ tài khoản người dùng đăng nhập
async function getDoctorIdFromUser(user, explicitDoctorId) {
    if (user.vaitro === "BacSi") {
        const staff = await prisma.nhanvien.findUnique({
            where: { matk: Number(user.matk) },
            include: { bacsi: true },
        });

        if (!staff || !staff.bacsi) {
            const error = new Error("Tài khoản của bạn chưa được liên kết với hồ sơ bác sĩ hợp lệ!");
            error.statusCode = 403;
            throw error;
        }

        return staff.bacsi.mabs;
    }

    if (user.vaitro === "Admin") {
        if (explicitDoctorId) {
            const doctor = await prisma.bacsi.findUnique({
                where: { mabs: Number(explicitDoctorId) },
            });
            if (!doctor) {
                const error = new Error(`Không tìm thấy bác sĩ với mã ID: ${explicitDoctorId}`);
                error.statusCode = 404;
                throw error;
            }
            return doctor.mabs;
        }

        // Nếu Admin không truyền mabs, lấy bác sĩ đầu tiên trong hệ thống làm mặc định
        const defaultDoctor = await prisma.bacsi.findFirst();
        if (!defaultDoctor) {
            const error = new Error("Hệ thống chưa có dữ liệu bác sĩ! Vui lòng tạo bác sĩ trước.");
            error.statusCode = 400;
            throw error;
        }
        return defaultDoctor.mabs;
    }

    const error = new Error("Chỉ Bác sĩ hoặc Quản trị viên mới có quyền thực hiện thao tác này!");
    error.statusCode = 403;
    throw error;
}

// Helper: Định dạng dữ liệu phiếu khám bệnh trả về cho Client
function formatExaminationResponse(exam) {
    if (!exam) return null;

    return {
        malsk: exam.malsk,
        mabn: exam.mabn,
        mabs: exam.mabs,
        ngay: exam.ngay,
        trieuchung: exam.trieuchung,
        chandoan: exam.chandoan,
        ketluan: exam.ketluan,
        benhnhan: exam.benhnhan
            ? {
                mabn: exam.benhnhan.mabn,
                hoten: exam.benhnhan.hoten,
                gioitinh: exam.benhnhan.gioitinh,
                ngaysinh: exam.benhnhan.ngaysinh
                    ? (exam.benhnhan.ngaysinh instanceof Date
                        ? exam.benhnhan.ngaysinh.toISOString().split("T")[0]
                        : exam.benhnhan.ngaysinh)
                    : null,
                sdt: exam.benhnhan.sdt,
                diachi: exam.benhnhan.diachi,
                cccd: exam.benhnhan.cccd,
                sobhyt: exam.benhnhan.sobhyt,
                hosobenhan: exam.benhnhan.hosobenhan
                    ? {
                        nhommau: exam.benhnhan.hosobenhan.nhommau,
                        tiensubenh: exam.benhnhan.hosobenhan.tiensubenh,
                        diung: exam.benhnhan.hosobenhan.diung,
                        ghichu: exam.benhnhan.hosobenhan.ghichu,
                    }
                    : undefined,
            }
            : undefined,
        bacsi: exam.bacsi
            ? {
                mabs: exam.bacsi.mabs,
                hocham: exam.bacsi.hocham,
                kinhnghiem: exam.bacsi.kinhnghiem,
                sogiayphephanhnghe: exam.bacsi.sogiayphephanhnghe,
                hoten: exam.bacsi.nhanvien ? exam.bacsi.nhanvien.hoten : undefined,
                sdt: exam.bacsi.nhanvien ? exam.bacsi.nhanvien.sdt : undefined,
                chuyenkhoa: exam.bacsi.chuyenkhoa
                    ? {
                        mack: exam.bacsi.chuyenkhoa.mack,
                        tenchuyenkhoa: exam.bacsi.chuyenkhoa.tenchuyenkhoa,
                    }
                    : undefined,
            }
            : undefined,
        chitietdichvukham: Array.isArray(exam.chitietdichvukham)
            ? exam.chitietdichvukham.map((item) => ({
                mactdvk: item.mactdvk,
                malsk: item.malsk,
                madv: item.madv,
                tendichvu: item.dichvu ? item.dichvu.tendichvu : "Dịch vụ y tế",
                dongia: item.dichvu ? Number(item.dichvu.dongia) : 0,
                soluong: item.soluong || 1,
                thanhtien: item.dichvu ? Number(item.dichvu.dongia) * (item.soluong || 1) : 0,
                ketqua: item.ketqua,
            }))
            : [],
        donthuoc: exam.donthuoc
            ? {
                madt: exam.donthuoc.madt,
                ngayke: exam.donthuoc.ngayke,
                ghichubacsi: exam.donthuoc.ghichubacsi,
                chitietdonthuoc: Array.isArray(exam.donthuoc.chitietdonthuoc)
                    ? exam.donthuoc.chitietdonthuoc.map((dt) => ({
                        mactdt: dt.mactdt,
                        mathuoc: dt.mathuoc,
                        tenthuoc: dt.thuoc ? dt.thuoc.tenthuoc : "Thuốc",
                        donvitinh: dt.thuoc ? dt.thuoc.donvitinh : "Liều",
                        soluong: dt.soluong,
                        lieudung: dt.lieudung,
                        thoigiansudung: dt.thoigiansudung,
                    }))
                    : [],
            }
            : null,
        hoadon: exam.hoadon
            ? {
                mahd: exam.hoadon.mahd,
                tongtien: Number(exam.hoadon.tongtien || 0),
                trangthaithanhtoan: exam.hoadon.trangthaithanhtoan,
                phuongthuctt: exam.hoadon.phuongthuctt,
            }
            : null,
    };
}


// Bác sĩ tạo phiếu khám bệnh & chỉ định cận lâm sàng
// Tự động cập nhật trạng thái lịch hẹn thành 'DaKham' nếu có liên kết malh

async function createExaminationService({ mabn, mabs, malh, trieuchung, chandoan, ketluan, services }, user) {
    const doctorId = await getDoctorIdFromUser(user, mabs);

    // Kiểm tra bệnh nhân có tồn tại không
    const patient = await prisma.benhnhan.findUnique({
        where: { mabn: Number(mabn) },
        include: { hosobenhan: true },
    });
    if (!patient) {
        const error = new Error(`Không tìm thấy bệnh nhân với mã ID: ${mabn}`);
        error.statusCode = 404;
        throw error;
    }

    // Nếu có truyền malh, kiểm tra tính hợp lệ của lịch hẹn
    let appointment = null;
    if (malh) {
        appointment = await prisma.lichhen.findUnique({
            where: { malh: Number(malh) },
        });
        if (!appointment) {
            const error = new Error(`Không tìm thấy lịch hẹn khám với mã ID: ${malh}`);
            error.statusCode = 404;
            throw error;
        }
        if (appointment.mabn !== Number(mabn)) {
            const error = new Error(`Lịch hẹn #${malh} không thuộc về bệnh nhân #${mabn}!`);
            error.statusCode = 400;
            throw error;
        }
    }

    // Nếu có dịch vụ cận lâm sàng, kiểm tra tất cả madv có tồn tại
    if (Array.isArray(services) && services.length > 0) {
        const serviceIds = services.map((s) => Number(s.madv));
        const foundServices = await prisma.dichvu.findMany({
            where: { madv: { in: serviceIds } },
            select: { madv: true },
        });

        const foundIds = new Set(foundServices.map((s) => s.madv));
        const missingIds = serviceIds.filter((id) => !foundIds.has(id));
        if (missingIds.length > 0) {
            const error = new Error(`Các mã dịch vụ cận lâm sàng sau không tồn tại trên hệ thống: [${missingIds.join(", ")}]`);
            error.statusCode = 404;
            throw error;
        }
    }

    // Thực thi Transaction nguyên tử
    const createdExam = await prisma.$transaction(async (tx) => {
        // Tạo phiếu khám bệnh (lichsukham)
        const exam = await tx.lichsukham.create({
            data: {
                mabn: Number(mabn),
                mabs: doctorId,
                trieuchung: trieuchung || null,
                chandoan: chandoan || null,
                ketluan: ketluan || null,
            },
        });

        // Thêm các chỉ định cận lâm sàng (chitietdichvukham)
        if (Array.isArray(services) && services.length > 0) {
            for (const item of services) {
                await tx.chitietdichvukham.create({
                    data: {
                        malsk: exam.malsk,
                        madv: Number(item.madv),
                        soluong: item.soluong || 1,
                        ketqua: item.ketqua || null,
                    },
                });
            }
        }

        // Nếu có lịch hẹn, cập nhật trạng thái lịch hẹn thành 'DaKham'
        if (appointment && appointment.trangthai !== "DaKham") {
            await tx.lichhen.update({
                where: { malh: appointment.malh },
                data: { trangthai: "DaKham" },
            });
        }

        return exam;
    });

    // Lấy lại đầy đủ quan hệ để trả về cho Client
    const fullExam = await prisma.lichsukham.findUnique({
        where: { malsk: createdExam.malsk },
        include: {
            benhnhan: {
                include: { hosobenhan: true },
            },
            bacsi: {
                include: {
                    nhanvien: true,
                    chuyenkhoa: true,
                },
            },
            chitietdichvukham: {
                include: { dichvu: true },
            },
            donthuoc: {
                include: {
                    chitietdonthuoc: {
                        include: { thuoc: true },
                    },
                },
            },
            hoadon: true,
        },
    });

    return formatExaminationResponse(fullExam);
}


// Lấy danh sách phiếu khám bệnh (Lọc theo bệnh nhân, bác sĩ, ngày khám, từ khóa, phân trang)

async function getAllExaminationsService(query, user) {
    const { mabn, mabs, fromDate, toDate, search, page, limit } = query;

    const where = {};

    // Phân quyền cho Bệnh nhân: chỉ xem phiếu khám của chính mình
    if (user.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true },
        });
        if (!patient) {
            return {
                examinations: [],
                pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
            };
        }
        where.mabn = patient.mabn;
    } else {
        if (mabn) where.mabn = Number(mabn);
    }

    if (mabs) where.mabs = Number(mabs);

    if (fromDate || toDate) {
        where.ngay = {};
        if (fromDate) {
            where.ngay.gte = new Date(fromDate);
        }
        if (toDate) {
            const endOfDay = new Date(toDate);
            endOfDay.setHours(23, 59, 59, 999);
            where.ngay.lte = endOfDay;
        }
    }

    if (search) {
        where.OR = [
            { chandoan: { contains: search, mode: "insensitive" } },
            { trieuchung: { contains: search, mode: "insensitive" } },
            { ketluan: { contains: search, mode: "insensitive" } },
            { benhnhan: { hoten: { contains: search, mode: "insensitive" } } },
            { benhnhan: { sdt: { contains: search } } },
        ];
    }

    // Xử lý phân trang
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, exams] = await Promise.all([
        prisma.lichsukham.count({ where }),
        prisma.lichsukham.findMany({
            where,
            include: {
                benhnhan: {
                    include: { hosobenhan: true },
                },
                bacsi: {
                    include: {
                        nhanvien: true,
                        chuyenkhoa: true,
                    },
                },
                chitietdichvukham: {
                    include: { dichvu: true },
                },
                donthuoc: true,
                hoadon: true,
            },
            orderBy: { ngay: "desc" },
            skip,
            take: limitNum,
        }),
    ]);

    return {
        examinations: exams.map(formatExaminationResponse),
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
}

// Xem chi tiết thông tin một phiếu khám bệnh
async function getExaminationByIdService(id, user) {
    const examId = Number(id);

    const exam = await prisma.lichsukham.findUnique({
        where: { malsk: examId },
        include: {
            benhnhan: {
                include: { hosobenhan: true },
            },
            bacsi: {
                include: {
                    nhanvien: true,
                    chuyenkhoa: true,
                },
            },
            chitietdichvukham: {
                include: { dichvu: true },
            },
            donthuoc: {
                include: {
                    chitietdonthuoc: {
                        include: { thuoc: true },
                    },
                },
            },
            hoadon: true,
        },
    });

    if (!exam) {
        const error = new Error(`Không tìm thấy phiếu khám bệnh với mã ID: ${examId}`);
        error.statusCode = 404;
        throw error;
    }

    // Bảo mật: Bệnh nhân chỉ xem được phiếu khám của chính mình
    if (user.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true },
        });
        if (!patient || exam.mabn !== patient.mabn) {
            const error = new Error("Bạn không có quyền truy cập phiếu khám bệnh này!");
            error.statusCode = 403;
            throw error;
        }
    }

    return formatExaminationResponse(exam);
}

// Bác sĩ cập nhật phiếu khám bệnh (Triệu chứng, chẩn đoán, kết luận)
async function updateExaminationService(id, { trieuchung, chandoan, ketluan }, user) {
    const examId = Number(id);

    const existingExam = await prisma.lichsukham.findUnique({
        where: { malsk: examId },
        include: { hoadon: true },
    });

    if (!existingExam) {
        const error = new Error(`Không tìm thấy phiếu khám bệnh với mã ID: ${examId}`);
        error.statusCode = 404;
        throw error;
    }

    const updatedExam = await prisma.lichsukham.update({
        where: { malsk: examId },
        data: {
            ...(trieuchung !== undefined && { trieuchung }),
            ...(chandoan !== undefined && { chandoan }),
            ...(ketluan !== undefined && { ketluan }),
        },
        include: {
            benhnhan: {
                include: { hosobenhan: true },
            },
            bacsi: {
                include: {
                    nhanvien: true,
                    chuyenkhoa: true,
                },
            },
            chitietdichvukham: {
                include: { dichvu: true },
            },
            donthuoc: true,
            hoadon: true,
        },
    });

    return formatExaminationResponse(updatedExam);
}

// Bác sĩ chỉ định bổ sung danh sách dịch vụ cận lâm sàng cho lần khám đã tạo
// Nếu đã có hóa đơn (chưa thanh toán), tự động đồng bộ vào chitiethoadon
async function addServicesToExaminationService(id, services, user) {
    const examId = Number(id);

    const exam = await prisma.lichsukham.findUnique({
        where: { malsk: examId },
        include: { hoadon: true },
    });

    if (!exam) {
        const error = new Error(`Không tìm thấy phiếu khám bệnh với mã ID: ${examId}`);
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra trạng thái hóa đơn viện phí
    if (exam.hoadon && exam.hoadon.trangthaithanhtoan === "DaThanhToan") {
        const error = new Error("Lần khám này đã thanh toán hóa đơn viện phí, không thể chỉ định bổ sung dịch vụ cận lâm sàng!");
        error.statusCode = 400;
        throw error;
    }

    // Kiểm tra tất cả mã dịch vụ có tồn tại
    const serviceIds = services.map((s) => Number(s.madv));
    const foundServices = await prisma.dichvu.findMany({
        where: { madv: { in: serviceIds } },
    });

    const foundMap = new Map(foundServices.map((s) => [s.madv, s]));
    const missingIds = serviceIds.filter((madv) => !foundMap.has(madv));
    if (missingIds.length > 0) {
        const error = new Error(`Các mã dịch vụ cận lâm sàng sau không tồn tại: [${missingIds.join(", ")}]`);
        error.statusCode = 404;
        throw error;
    }

    // Thực thi transaction thêm dịch vụ cận lâm sàng và đồng bộ hóa đơn (nếu có)
    await prisma.$transaction(async (tx) => {
        for (const item of services) {
            const numMadv = Number(item.madv);
            const qty = item.soluong || 1;
            const dvInfo = foundMap.get(numMadv);

            await tx.chitietdichvukham.create({
                data: {
                    malsk: examId,
                    madv: numMadv,
                    soluong: qty,
                    ketqua: item.ketqua || null,
                },
            });

            // Nếu đã có hóa đơn chưa thanh toán, nạp bổ sung vào chitiethoadon
            if (exam.hoadon && exam.hoadon.trangthaithanhtoan === "ChuaThanhToan") {
                await tx.chitiethoadon.create({
                    data: {
                        mahd: exam.hoadon.mahd,
                        madv: numMadv,
                        soluong: qty,
                        dongia: dvInfo.dongia,
                    },
                });
            }
        }
    });

    return getExaminationByIdService(examId, user);
}

// Cập nhật kết quả khám cận lâm sàng cho một dịch vụ cụ thể
async function updateServiceResultService(id, detailId, ketqua, user) {
    const examId = Number(id);
    const ctdvkId = Number(detailId);

    const detail = await prisma.chitietdichvukham.findFirst({
        where: {
            mactdvk: ctdvkId,
            malsk: examId,
        },
        include: { dichvu: true },
    });

    if (!detail) {
        const error = new Error(`Không tìm thấy chỉ định dịch vụ cận lâm sàng #${ctdvkId} trong phiếu khám #${examId}!`);
        error.statusCode = 404;
        throw error;
    }

    const updatedDetail = await prisma.chitietdichvukham.update({
        where: { mactdvk: ctdvkId },
        data: { ketqua },
        include: { dichvu: true },
    });

    return {
        mactdvk: updatedDetail.mactdvk,
        malsk: updatedDetail.malsk,
        madv: updatedDetail.madv,
        tendichvu: updatedDetail.dichvu ? updatedDetail.dichvu.tendichvu : "Dịch vụ y tế",
        dongia: updatedDetail.dichvu ? Number(updatedDetail.dichvu.dongia) : 0,
        soluong: updatedDetail.soluong,
        ketqua: updatedDetail.ketqua,
    };
}

// Hủy một chỉ định cận lâm sàng khỏi phiếu khám
// Kiểm tra an toàn: Không cho phép hủy nếu hóa đơn đã thanh toán
async function removeServiceFromExaminationService(id, detailId, user) {
    const examId = Number(id);
    const ctdvkId = Number(detailId);

    const exam = await prisma.lichsukham.findUnique({
        where: { malsk: examId },
        include: { hoadon: true },
    });

    if (!exam) {
        const error = new Error(`Không tìm thấy phiếu khám bệnh với mã ID: ${examId}`);
        error.statusCode = 404;
        throw error;
    }

    if (exam.hoadon && exam.hoadon.trangthaithanhtoan === "DaThanhToan") {
        const error = new Error("Lần khám này đã thanh toán viện phí, không thể xóa dịch vụ cận lâm sàng!");
        error.statusCode = 400;
        throw error;
    }

    const detail = await prisma.chitietdichvukham.findFirst({
        where: {
            mactdvk: ctdvkId,
            malsk: examId,
        },
        include: { dichvu: true },
    });

    if (!detail) {
        const error = new Error(`Không tìm thấy chỉ định dịch vụ #${ctdvkId} trong phiếu khám #${examId}`);
        error.statusCode = 404;
        throw error;
    }

    await prisma.$transaction(async (tx) => {
        // Nếu có hóa đơn chưa thanh toán, xóa dòng dịch vụ tương ứng khỏi chitiethoadon
        if (exam.hoadon) {
            await tx.chitiethoadon.deleteMany({
                where: {
                    mahd: exam.hoadon.mahd,
                    madv: detail.madv,
                },
            });
        }

        // Xóa khỏi chi tiết dịch vụ khám
        await tx.chitietdichvukham.delete({
            where: { mactdvk: ctdvkId },
        });
    });

    return {
        mactdvk: ctdvkId,
        malsk: examId,
        madv: detail.madv,
        tendichvu: detail.dichvu ? detail.dichvu.tendichvu : "Dịch vụ",
    };
}

// Xóa phiếu khám bệnh (Safe Delete Guard)
// Chỉ cho phép xóa khi chưa thanh toán viện phí và chưa kê đơn thuốc
async function deleteExaminationService(id, user) {
    const examId = Number(id);

    const exam = await prisma.lichsukham.findUnique({
        where: { malsk: examId },
        include: {
            hoadon: true,
            donthuoc: true,
        },
    });

    if (!exam) {
        const error = new Error(`Không tìm thấy phiếu khám bệnh với mã ID: ${examId}`);
        error.statusCode = 404;
        throw error;
    }

    if (exam.hoadon && exam.hoadon.trangthaithanhtoan === "DaThanhToan") {
        const error = new Error(`Phiếu khám bệnh #${examId} đã hoàn tất thanh toán hóa đơn viện phí (#${exam.hoadon.mahd}), không thể xóa!`);
        error.statusCode = 400;
        throw error;
    }

    if (exam.donthuoc) {
        const error = new Error(`Phiếu khám bệnh #${examId} đã có đơn thuốc (#${exam.donthuoc.madt}), vui lòng hủy đơn thuốc trước khi xóa phiếu khám!`);
        error.statusCode = 400;
        throw error;
    }

    await prisma.lichsukham.delete({
        where: { malsk: examId },
    });

    return {
        malsk: examId,
        mabn: exam.mabn,
        mabs: exam.mabs,
    };
}

module.exports = {
    createExaminationService,
    getAllExaminationsService,
    getExaminationByIdService,
    updateExaminationService,
    addServicesToExaminationService,
    updateServiceResultService,
    removeServiceFromExaminationService,
    deleteExaminationService,
};
