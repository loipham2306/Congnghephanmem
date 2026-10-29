// ========================================================
// SERVICE: QUẢN LÝ HÓA ĐƠN VIỆN PHÍ & TRIGGER TÍNH TIỀN
// ========================================================

const prisma = require("../config/prisma");
const { PAYMENT_METHODS } = require("../constants/invoice.constant");
const { startOfDayVN, endOfDayVN } = require("../utils/date");
const { writeAudit } = require("../utils/audit");

function toNumber(value) {
    return value !== null && value !== undefined ? Number(value) : 0;
}

// Định dạng dữ liệu hóa đơn trả về cho client
function formatInvoiceResponse(invoice) {
    if (!invoice) return null;

    const refunds = Array.isArray(invoice.hoantien) ? invoice.hoantien : [];
    const totalRefunded = refunds.reduce((sum, item) => sum + toNumber(item.sotien), 0);

    return {
        mahd: invoice.mahd,
        mabn: invoice.mabn,
        malsk: invoice.malsk,
        ngaylap: invoice.ngaylap,
        ngaythanhtoan: invoice.ngaythanhtoan || null,
        tongtien: toNumber(invoice.tongtien),
        tonghoantien: totalRefunded,
        trangthaithanhtoan: invoice.trangthaithanhtoan,
        phuongthuctt: invoice.phuongthuctt,
        hoantien: refunds.map((item) => ({
            maht: item.maht,
            sotien: toNumber(item.sotien),
            lydo: item.lydo,
            phuongthuc: item.phuongthuc,
            ngaytao: item.ngaytao,
        })),
        benhnhan: invoice.benhnhan
            ? {
                mabn: invoice.benhnhan.mabn,
                hoten: invoice.benhnhan.hoten,
                sdt: invoice.benhnhan.sdt,
                gioitinh: invoice.benhnhan.gioitinh,
                cccd: invoice.benhnhan.cccd,
                sobhyt: invoice.benhnhan.sobhyt,
            }
            : undefined,
        lichsukham: invoice.lichsukham
            ? {
                malsk: invoice.lichsukham.malsk,
                ngay: invoice.lichsukham.ngay,
                trieuchung: invoice.lichsukham.trieuchung,
                chandoan: invoice.lichsukham.chandoan,
                ketluan: invoice.lichsukham.ketluan,
                bacsi: invoice.lichsukham.bacsi
                    ? {
                        mabs: invoice.lichsukham.bacsi.mabs,
                        hocham: invoice.lichsukham.bacsi.hocham,
                        nhanvien: invoice.lichsukham.bacsi.nhanvien
                            ? {
                                hoten: invoice.lichsukham.bacsi.nhanvien.hoten,
                                sdt: invoice.lichsukham.bacsi.nhanvien.sdt,
                            }
                            : undefined,
                        chuyenkhoa: invoice.lichsukham.bacsi.chuyenkhoa
                            ? {
                                mack: invoice.lichsukham.bacsi.chuyenkhoa.mack,
                                tenchuyenkhoa: invoice.lichsukham.bacsi.chuyenkhoa.tenchuyenkhoa,
                            }
                            : undefined,
                    }
                    : undefined,
            }
            : undefined,
        chitiethoadon: Array.isArray(invoice.chitiethoadon)
            ? invoice.chitiethoadon.map((item) => ({
                macthd: item.macthd,
                mahd: item.mahd,
                madv: item.madv,
                mathuoc: item.mathuoc,
                madt: item.madt,
                loai: item.madv ? "DichVu" : "Thuoc",
                ten: item.dichvu ? item.dichvu.tendichvu : (item.thuoc ? item.thuoc.tenthuoc : "Khác"),
                donvitinh: item.thuoc ? item.thuoc.donvitinh : "Lần",
                soluong: item.soluong,
                dongia: Number(item.dongia),
                thanhtien: item.thanhtien ? Number(item.thanhtien) : Number(item.soluong) * Number(item.dongia),
            }))
            : undefined,
    };
}

/**
 * 1. Khởi tạo hóa đơn từ lần khám bệnh (Đồng bộ Dịch vụ khám & Đơn thuốc vào Chi tiết hóa đơn)
 * Database Trigger `trg_cthd_update_tongtien` sẽ tự động tính và cập nhật tổng tiền
 */
async function createInvoiceService({ malsk, phuongthuctt }) {
    const examId = Number(malsk);

    // 1. Kiểm tra lần khám bệnh có tồn tại không
    const exam = await prisma.lichsukham.findUnique({
        where: { malsk: examId },
        include: {
            benhnhan: true,
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
        },
    });

    if (!exam) {
        const error = new Error(`Không tìm thấy thông tin lần khám bệnh với mã ID: ${examId}`);
        error.statusCode = 404;
        throw error;
    }

    // 2. Kiểm tra lần khám này đã được lập hóa đơn chưa
    const existingInvoice = await prisma.hoadon.findUnique({
        where: { malsk: examId },
    });
    if (existingInvoice) {
        const error = new Error(`Lần khám bệnh #${examId} đã được lập hóa đơn viện phí trước đó (Hóa đơn #${existingInvoice.mahd})!`);
        error.statusCode = 409;
        throw error;
    }

    // 3. Thực thi Transaction khởi tạo Hóa đơn và nạp các dòng ChiTietHoaDon
    const createdInvoiceId = await prisma.$transaction(async (tx) => {
        // Tạo hóa đơn viện phí
        const invoice = await tx.hoadon.create({
            data: {
                mabn: exam.mabn,
                malsk: examId,
                trangthaithanhtoan: "ChuaThanhToan",
                // Chỉ ghi nhận phương thức khi thực sự thanh toán.
                phuongthuctt: null,
            },
        });

        // Nạp chi tiết các dịch vụ khám đã chỉ định
        if (exam.chitietdichvukham && exam.chitietdichvukham.length > 0) {
            for (const ctdv of exam.chitietdichvukham) {
                await tx.chitiethoadon.create({
                    data: {
                        mahd: invoice.mahd,
                        madv: ctdv.madv,
                        soluong: ctdv.soluong || 1,
                        dongia: ctdv.dichvu.dongia,
                    },
                });
            }
        }

        // Nạp chi tiết các thuốc đã kê trong đơn
        if (exam.donthuoc && exam.donthuoc.chitietdonthuoc && exam.donthuoc.chitietdonthuoc.length > 0) {
            for (const ctdt of exam.donthuoc.chitietdonthuoc) {
                await tx.chitiethoadon.create({
                    data: {
                        mahd: invoice.mahd,
                        mathuoc: ctdt.mathuoc,
                        madt: exam.donthuoc.madt,
                        soluong: ctdt.soluong,
                        dongia: ctdt.thuoc.dongia,
                    },
                });
            }
        }

        return invoice.mahd;
    });

    // 4. Lấy lại hóa đơn hoàn chỉnh từ DB (nơi Trigger PostgreSQL đã tính lại TongTien chính xác)
    const result = await prisma.hoadon.findUnique({
        where: { mahd: createdInvoiceId },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(result);
}

/**
 * 2. Thêm mục viện phí vào hóa đơn (Dịch vụ hoặc Thuốc phát sinh)
 */
async function addInvoiceItemService(invoiceId, itemData) {
    const mahd = Number(invoiceId);
    const { madv, mathuoc, madt, soluong, dongia } = itemData;

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    if (invoice.trangthaithanhtoan !== "ChuaThanhToan") {
        const error = new Error(`Hóa đơn này đang ở trạng thái "${invoice.trangthaithanhtoan}", không thể thêm mục mới!`);
        error.statusCode = 400;
        throw error;
    }

    if (Boolean(madv) === Boolean(mathuoc)) {
        const error = new Error("Mỗi dòng viện phí phải chọn đúng một loại: dịch vụ (madv) hoặc thuốc (mathuoc)!");
        error.statusCode = 400;
        throw error;
    }

    const quantity = Number(soluong);
    if (!Number.isInteger(quantity) || quantity <= 0) {
        const error = new Error("Số lượng (soluong) phải là số nguyên dương!");
        error.statusCode = 400;
        throw error;
    }

    // Giá luôn lấy từ danh mục phía server, không tin tưởng giá do client gửi lên.
    let finalPrice;

    if (madv) {
        const service = await prisma.dichvu.findUnique({
            where: { madv: Number(madv) },
        });
        if (!service) {
            const error = new Error(`Không tìm thấy dịch vụ với mã ID: ${madv}`);
            error.statusCode = 404;
            throw error;
        }
        finalPrice = Number(service.dongia);
    } else {
        const medicine = await prisma.thuoc.findUnique({
            where: { mathuoc: Number(mathuoc) },
        });
        if (!medicine) {
            const error = new Error(`Không tìm thấy thuốc với mã ID: ${mathuoc}`);
            error.statusCode = 404;
            throw error;
        }
        finalPrice = Number(medicine.dongia);
    }

    // Thêm dòng chi tiết (Trigger DB sẽ tự động tính lại TongTien trong HoaDon)
    await prisma.chitiethoadon.create({
        data: {
            mahd,
            madv: madv ? Number(madv) : null,
            mathuoc: mathuoc ? Number(mathuoc) : null,
            madt: madt ? Number(madt) : null,
            soluong: quantity,
            dongia: finalPrice,
        },
    });

    // Lấy lại hóa đơn sau khi Trigger cập nhật
    const updatedInvoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(updatedInvoice);
}

/**
 * 3. Xóa một mục khỏi hóa đơn (Trigger DB tự động giảm trừ TongTien)
 */
async function removeInvoiceItemService(invoiceId, itemId) {
    const mahd = Number(invoiceId);
    const macthd = Number(itemId);

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
    });
    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    if (invoice.trangthaithanhtoan !== "ChuaThanhToan") {
        const error = new Error(`Hóa đơn đã ở trạng thái "${invoice.trangthaithanhtoan}", không thể xóa mục viện phí!`);
        error.statusCode = 400;
        throw error;
    }

    const item = await prisma.chitiethoadon.findFirst({
        where: { macthd, mahd },
    });
    if (!item) {
        const error = new Error(`Mục chi tiết #${macthd} không tồn tại trong hóa đơn #${mahd}!`);
        error.statusCode = 404;
        throw error;
    }

    // Xóa dòng chi tiết
    await prisma.chitiethoadon.delete({
        where: { macthd },
    });

    // Lấy lại hóa đơn sau khi Trigger tự động trừ tiền
    const updatedInvoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: {
            benhnhan: true,
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(updatedInvoice);
}

/**
 * 4. Xác nhận thanh toán hóa đơn viện phí
 */
async function payInvoiceService(invoiceId, { phuongthuctt }) {
    const mahd = Number(invoiceId);

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: {
            benhnhan: true,
            chitiethoadon: true,
        },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    if (invoice.trangthaithanhtoan === "DaThanhToan") {
        const error = new Error(`Hóa đơn #${mahd} đã được thanh toán trước đó!`);
        error.statusCode = 400;
        throw error;
    }

    if (invoice.trangthaithanhtoan === "DaHuy") {
        const error = new Error(`Hóa đơn #${mahd} đã bị hủy, không thể thanh toán!`);
        error.statusCode = 400;
        throw error;
    }

    if (!PAYMENT_METHODS.includes(phuongthuctt)) {
        const error = new Error(`Phương thức thanh toán không hợp lệ! Chỉ chấp nhận: ${PAYMENT_METHODS.join(", ")}`);
        error.statusCode = 400;
        throw error;
    }

    if (Number(invoice.tongtien) <= 0) {
        const error = new Error("Hóa đơn chưa có mục viện phí nào, không thể thanh toán!");
        error.statusCode = 400;
        throw error;
    }

    const updated = await prisma.hoadon.update({
        where: { mahd },
        data: {
            trangthaithanhtoan: "DaThanhToan",
            phuongthuctt,
            ngaythanhtoan: new Date(),
        },
        include: {
            benhnhan: true,
            hoantien: { orderBy: { ngaytao: "asc" } },
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    return formatInvoiceResponse(updated);
}

/**
 * 5. Hủy hóa đơn viện phí
 */
async function cancelInvoiceService(invoiceId, user) {
    const mahd = Number(invoiceId);

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    if (invoice.trangthaithanhtoan === "DaHuy") {
        const error = new Error(`Hóa đơn #${mahd} đã ở trạng thái hủy!`);
        error.statusCode = 400;
        throw error;
    }

    if (invoice.trangthaithanhtoan === "DaThanhToan" && user.vaitro !== "Admin") {
        const error = new Error("Hóa đơn đã được thanh toán, chỉ Quản trị viên (Admin) mới có quyền hủy/hoàn tiền!");
        error.statusCode = 403;
        throw error;
    }

    const refunded = await prisma.hoantien.aggregate({
        where: { mahd },
        _sum: { sotien: true },
    });
    const refundable = Math.max(0, Number(invoice.tongtien) - Number(refunded._sum.sotien || 0));

    const updated = await prisma.$transaction(async (tx) => {
        if (invoice.trangthaithanhtoan === "DaThanhToan" && refundable > 0) {
            await tx.hoantien.create({
                data: {
                    mahd,
                    matk: user.matk,
                    sotien: refundable,
                    lydo: "Hủy hóa đơn đã thanh toán",
                    phuongthuc: invoice.phuongthuctt,
                },
            });
        }

        return tx.hoadon.update({
            where: { mahd },
            data: { trangthaithanhtoan: "DaHuy" },
            include: {
                benhnhan: true,
                hoantien: { orderBy: { ngaytao: "asc" } },
                lichsukham: {
                    include: {
                        bacsi: {
                            include: {
                                nhanvien: true,
                                chuyenkhoa: true,
                            },
                        },
                    },
                },
                chitiethoadon: {
                    include: {
                        dichvu: true,
                        thuoc: true,
                    },
                },
            },
        });
    });

    await writeAudit({
        matk: user.matk,
        hanhdong: "HUY_HOA_DON",
        doituong: "hoadon",
        doituongId: mahd,
        truoc: { trangthai: invoice.trangthaithanhtoan, tongtien: Number(invoice.tongtien) },
        sau: { trangthai: updated.trangthaithanhtoan, hoantien: refundable },
    });

    return formatInvoiceResponse(updated);
}

/**
 * 6. Lấy danh sách hóa đơn (Bộ lọc đa năng & Phân trang)
 */
async function getAllInvoicesService(query = {}) {
    const { date, fromDate, toDate, status, paymentMethod, patientId, search, page = 1, limit = 10 } = query;

    const pageNum = Math.max(1, Math.floor(Number(page) || 1));
    const limitNum = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (date) {
        where.ngaylap = {
            gte: startOfDayVN(date.trim()),
            lte: endOfDayVN(date.trim()),
        };
    } else if (fromDate || toDate) {
        where.ngaylap = {};
        if (fromDate) where.ngaylap.gte = startOfDayVN(fromDate.trim());
        if (toDate) where.ngaylap.lte = endOfDayVN(toDate.trim());
    }

    if (status) {
        where.trangthaithanhtoan = status;
    }

    if (paymentMethod) {
        where.phuongthuctt = paymentMethod;
    }

    if (patientId) {
        where.mabn = Number(patientId);
    }

    if (search && search.trim() !== "") {
        const keyword = search.trim();
        where.benhnhan = {
            is: {
                OR: [
                    { hoten: { contains: keyword, mode: "insensitive" } },
                    { sdt: { contains: keyword } },
                    { cccd: { contains: keyword } },
                ],
            },
        };
    }

    const [invoices, total] = await Promise.all([
        prisma.hoadon.findMany({
            where,
            skip,
            take: limitNum,
            include: {
                benhnhan: true,
                hoantien: { orderBy: { ngaytao: "asc" } },
                lichsukham: {
                    include: {
                        bacsi: {
                            include: {
                                nhanvien: true,
                                chuyenkhoa: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { chitiethoadon: true },
                },
            },
            orderBy: { ngaylap: "desc" },
        }),
        prisma.hoadon.count({ where }),
    ]);

    return {
        data: invoices.map(formatInvoiceResponse),
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
}

/**
 * 7. Lấy chi tiết một hóa đơn
 */
async function getInvoiceByIdService(id, user) {
    const mahd = Number(id);

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: {
            benhnhan: true,
            hoantien: { orderBy: { ngaytao: "asc" } },
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }

    // Nếu là Bệnh nhân, chỉ được xem hóa đơn của chính mình
    if (user.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true },
        });
        if (!patient || invoice.mabn !== patient.mabn) {
            const error = new Error("Bạn không có quyền truy cập hóa đơn này!");
            error.statusCode = 403;
            throw error;
        }
    }

    return formatInvoiceResponse(invoice);
}

/**
 * 8. Bệnh nhân xem các hóa đơn viện phí của chính mình
 */
async function getMyInvoicesService(matk, query = {}) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk: Number(matk) },
        select: { mabn: true },
    });

    if (!patient) {
        const error = new Error("Tài khoản của bạn chưa có hồ sơ bệnh nhân!");
        error.statusCode = 404;
        throw error;
    }

    const where = {
        mabn: patient.mabn,
    };

    if (query.status) {
        where.trangthaithanhtoan = query.status;
    }

    const invoices = await prisma.hoadon.findMany({
        where,
        include: {
            hoantien: { orderBy: { ngaytao: "asc" } },
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: true,
                            chuyenkhoa: true,
                        },
                    },
                },
            },
            chitiethoadon: {
                include: {
                    dichvu: true,
                    thuoc: true,
                },
            },
        },
        orderBy: { ngaylap: "desc" },
    });

    return invoices.map(formatInvoiceResponse);
}

/**
 * 9. Lấy hóa đơn theo lần khám (dùng cho màn hình thu ngân)
 */
async function getInvoiceByExamService(malsk, user) {
    const examId = Number(malsk);
    const invoice = await prisma.hoadon.findUnique({
        where: { malsk: examId },
        include: {
            benhnhan: true,
            hoantien: { orderBy: { ngaytao: "asc" } },
            lichsukham: {
                include: {
                    bacsi: {
                        include: { nhanvien: true, chuyenkhoa: true },
                    },
                },
            },
            chitiethoadon: {
                include: { dichvu: true, thuoc: true },
            },
        },
    });

    if (!invoice) {
        const error = new Error(`Lần khám #${examId} chưa được lập hóa đơn`);
        error.statusCode = 404;
        throw error;
    }

    if (user.vaitro === "BenhNhan") {
        const patient = await prisma.benhnhan.findUnique({
            where: { matk: Number(user.matk) },
            select: { mabn: true },
        });
        if (!patient || invoice.mabn !== patient.mabn) {
            const error = new Error("Bạn không có quyền truy cập hóa đơn này!");
            error.statusCode = 403;
            throw error;
        }
    }

    return formatInvoiceResponse(invoice);
}

/**
 * 10. Hoàn tiền một phần / toàn bộ hóa đơn (chỉ Admin)
 */
async function refundInvoiceService(invoiceId, { sotien, lydo, phuongthuc }, user) {
    const mahd = Number(invoiceId);

    if (user.vaitro !== "Admin") {
        const error = new Error("Chỉ Quản trị viên (Admin) mới có quyền hoàn tiền!");
        error.statusCode = 403;
        throw error;
    }

    const invoice = await prisma.hoadon.findUnique({
        where: { mahd },
        include: { hoantien: true },
    });

    if (!invoice) {
        const error = new Error(`Không tìm thấy hóa đơn với mã ID: ${mahd}`);
        error.statusCode = 404;
        throw error;
    }
    if (invoice.trangthaithanhtoan !== "DaThanhToan") {
        const error = new Error("Chỉ có thể hoàn tiền cho hóa đơn đã thanh toán!");
        error.statusCode = 400;
        throw error;
    }

    const amount = Number(sotien);
    if (!Number.isFinite(amount) || amount <= 0) {
        const error = new Error("Số tiền hoàn phải lớn hơn 0!");
        error.statusCode = 400;
        throw error;
    }

    const refundedBefore = (invoice.hoantien || []).reduce(
        (sum, item) => sum + Number(item.sotien),
        0,
    );
    const refundable = Number(invoice.tongtien) - refundedBefore;

    if (amount > refundable) {
        const error = new Error(`Số tiền hoàn vượt quá số tiền còn lại có thể hoàn (${refundable})!`);
        error.statusCode = 400;
        throw error;
    }

    if (!String(lydo || "").trim()) {
        const error = new Error("Vui lòng nhập lý do hoàn tiền!");
        error.statusCode = 400;
        throw error;
    }

    const refundMethod = phuongthuc || invoice.phuongthuctt;
    if (!PAYMENT_METHODS.includes(refundMethod)) {
        const error = new Error("Phương thức hoàn tiền không hợp lệ!");
        error.statusCode = 400;
        throw error;
    }

    const updated = await prisma.$transaction(async (tx) => {
        await tx.hoantien.create({
            data: {
                mahd,
                matk: user.matk,
                sotien: amount,
                lydo: String(lydo).trim().slice(0, 255),
                phuongthuc: refundMethod,
            },
        });

        if (refundedBefore + amount >= Number(invoice.tongtien)) {
            await tx.hoadon.update({
                where: { mahd },
                data: { trangthaithanhtoan: "DaHuy" },
            });
        }

        return tx.hoadon.findUnique({
            where: { mahd },
            include: {
                benhnhan: true,
                hoantien: { orderBy: { ngaytao: "asc" } },
                lichsukham: {
                    include: {
                        bacsi: { include: { nhanvien: true, chuyenkhoa: true } },
                    },
                },
                chitiethoadon: {
                    include: { dichvu: true, thuoc: true },
                },
            },
        });
    });

    await writeAudit({
        matk: user.matk,
        hanhdong: "HOAN_TIEN",
        doituong: "hoadon",
        doituongId: mahd,
        sau: { sotien: amount, lydo: String(lydo).trim() },
    });

    return formatInvoiceResponse(updated);
}

module.exports = {
    createInvoiceService,
    addInvoiceItemService,
    removeInvoiceItemService,
    payInvoiceService,
    cancelInvoiceService,
    getAllInvoicesService,
    getInvoiceByIdService,
    getInvoiceByExamService,
    getMyInvoicesService,
    refundInvoiceService,
};
