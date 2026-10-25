// ========================================================
// SERVICE: BÁO CÁO & THỐNG KÊ DOANH THU, LƯỢT KHÁM CHO ADMIN
// ========================================================

const prisma = require("../config/prisma");

/**
 * 1. Báo cáo tổng quan Dashboard
 */
async function getOverviewStatisticsService() {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfToday = new Date(`${todayStr}T23:59:59.999Z`);

    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const [
        totalPatients,
        totalDoctors,
        todayAppointments,
        todayExams,
        totalRevenueAgg,
        todayRevenueAgg,
        monthRevenueAgg,
        unpaidInvoicesCount,
        pendingAppointmentsCount,
    ] = await Promise.all([
        prisma.benhnhan.count(),
        prisma.bacsi.count(),
        prisma.lichhen.count({
            where: { ngayhen: new Date(todayStr) },
        }),
        prisma.lichsukham.count({
            where: { ngay: { gte: startOfToday, lte: endOfToday } },
        }),
        prisma.hoadon.aggregate({
            where: { trangthaithanhtoan: "DaThanhToan" },
            _sum: { tongtien: true },
        }),
        prisma.hoadon.aggregate({
            where: {
                trangthaithanhtoan: "DaThanhToan",
                ngaylap: { gte: startOfToday, lte: endOfToday },
            },
            _sum: { tongtien: true },
        }),
        prisma.hoadon.aggregate({
            where: {
                trangthaithanhtoan: "DaThanhToan",
                ngaylap: { gte: startOfMonth, lte: endOfMonth },
            },
            _sum: { tongtien: true },
        }),
        prisma.hoadon.count({
            where: { trangthaithanhtoan: "ChuaThanhToan" },
        }),
        prisma.lichhen.count({
            where: { trangthai: "ChoXacNhan" },
        }),
    ]);

    return {
        tongbenhnhan: totalPatients,
        tongbacsi: totalDoctors,
        lichhen_homnay: todayAppointments,
        lichhen_choxacnhan: pendingAppointmentsCount,
        luotkham_homnay: todayExams,
        doanhthu_homnay: todayRevenueAgg._sum.tongtien ? Number(todayRevenueAgg._sum.tongtien) : 0,
        doanhthu_thangnay: monthRevenueAgg._sum.tongtien ? Number(monthRevenueAgg._sum.tongtien) : 0,
        tongdoanhthu: totalRevenueAgg._sum.tongtien ? Number(totalRevenueAgg._sum.tongtien) : 0,
        hoadon_chuathanhtoan: unpaidInvoicesCount,
    };
}

/**
 * 2. Thống kê chi tiết doanh thu theo khoảng thời gian và phương thức thanh toán
 */
async function getRevenueStatisticsService({ startDate, endDate, groupBy = "day" } = {}) {
    const now = new Date();
    let start, end;

    if (startDate) {
        start = new Date(`${startDate.trim()}T00:00:00.000Z`);
    } else {
        // Mặc định 30 ngày trước
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (endDate) {
        end = new Date(`${endDate.trim()}T23:59:59.999Z`);
    } else {
        end = now;
    }

    // Lấy các hóa đơn đã thanh toán trong khoảng thời gian
    const invoices = await prisma.hoadon.findMany({
        where: {
            trangthaithanhtoan: "DaThanhToan",
            ngaylap: { gte: start, lte: end },
        },
        include: {
            chitiethoadon: true,
        },
        orderBy: { ngaylap: "asc" },
    });

    let totalRevenue = 0;
    const paymentMethods = {
        TienMat: 0,
        ChuyenKhoan: 0,
        TheThanhToan: 0,
        ViDienTu: 0,
        ChuaXacDinh: 0,
    };

    let serviceRevenue = 0;
    let medicineRevenue = 0;
    const timelineMap = {};

    for (const inv of invoices) {
        const amount = Number(inv.tongtien) || 0;
        totalRevenue += amount;

        // Phân loại theo phương thức thanh toán
        const method = inv.phuongthuctt || "ChuaXacDinh";
        if (paymentMethods[method] !== undefined) {
            paymentMethods[method] += amount;
        } else {
            paymentMethods[method] = amount;
        }

        // Phân loại Dịch vụ vs Thuốc qua ChiTietHoaDon
        if (inv.chitiethoadon && inv.chitiethoadon.length > 0) {
            for (const item of inv.chitiethoadon) {
                const itemTotal = item.thanhtien ? Number(item.thanhtien) : Number(item.soluong) * Number(item.dongia);
                if (item.madv) {
                    serviceRevenue += itemTotal;
                } else if (item.mathuoc) {
                    medicineRevenue += itemTotal;
                }
            }
        }

        // Gom nhóm theo timeline
        const invDate = inv.ngaylap instanceof Date ? inv.ngaylap : new Date(inv.ngaylap);
        const timeKey = groupBy === "month"
            ? `${invDate.getUTCFullYear()}-${String(invDate.getUTCMonth() + 1).padStart(2, "0")}`
            : invDate.toISOString().split("T")[0];

        if (!timelineMap[timeKey]) {
            timelineMap[timeKey] = {
                moc_thoigian: timeKey,
                doanhthu: 0,
                so_hoadon: 0,
            };
        }
        timelineMap[timeKey].doanhthu += amount;
        timelineMap[timeKey].so_hoadon += 1;
    }

    const timeline = Object.values(timelineMap);

    return {
        khoang_thoigian: {
            tu_ngay: start.toISOString().split("T")[0],
            den_ngay: end.toISOString().split("T")[0],
            kieu_gomnhom: groupBy,
        },
        tong_doanhthu: totalRevenue,
        so_hoadon_dathanhtoan: invoices.length,
        theo_phuongthuc: paymentMethods,
        theo_loai: {
            dichvu_kham: serviceRevenue,
            thuoc: medicineRevenue,
        },
        bieudo_doanhthu: timeline,
    };
}

/**
 * 3. Thống kê số lượt khám bệnh theo Chuyên khoa, Bác sĩ và Trạng thái lịch hẹn
 */
async function getExaminationStatisticsService({ startDate, endDate } = {}) {
    const now = new Date();
    let start, end;

    if (startDate) {
        start = new Date(`${startDate.trim()}T00:00:00.000Z`);
    } else {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (endDate) {
        end = new Date(`${endDate.trim()}T23:59:59.999Z`);
    } else {
        end = now;
    }

    // 1. Tổng số ca khám bệnh thực tế (LichSuKham)
    const examinations = await prisma.lichsukham.findMany({
        where: {
            ngay: { gte: start, lte: end },
        },
        include: {
            bacsi: {
                include: {
                    nhanvien: { select: { hoten: true } },
                    chuyenkhoa: { select: { mack: true, tenchuyenkhoa: true } },
                },
            },
        },
    });

    const specialtyMap = {};
    const doctorMap = {};

    for (const exam of examinations) {
        // Gom nhóm theo chuyên khoa
        const specName = exam.bacsi?.chuyenkhoa?.tenchuyenkhoa || "Chưa phân khoa";
        specialtyMap[specName] = (specialtyMap[specName] || 0) + 1;

        // Gom nhóm theo bác sĩ
        const docName = exam.bacsi?.nhanvien?.hoten || `Bác sĩ #${exam.mabs}`;
        doctorMap[docName] = (doctorMap[docName] || 0) + 1;
    }

    // 2. Thống kê tình trạng Lịch hẹn (LichHen)
    const startDay = new Date(start.toISOString().split("T")[0]);
    const endDay = new Date(end.toISOString().split("T")[0]);

    const appointmentCounts = await prisma.lichhen.groupBy({
        by: ["trangthai"],
        where: {
            ngayhen: { gte: startDay, lte: endDay },
        },
        _count: { malh: true },
    });

    const appointmentStatusMap = {
        ChoXacNhan: 0,
        DaXacNhan: 0,
        DaKham: 0,
        DaHuy: 0,
    };

    let totalAppointments = 0;
    for (const ac of appointmentCounts) {
        appointmentStatusMap[ac.trangthai] = ac._count.malh;
        totalAppointments += ac._count.malh;
    }

    return {
        khoang_thoigian: {
            tu_ngay: start.toISOString().split("T")[0],
            den_ngay: end.toISOString().split("T")[0],
        },
        tong_luotkham_thucte: examinations.length,
        tong_lichhen: totalAppointments,
        theo_chuyenkhoa: Object.entries(specialtyMap).map(([chuyenkhoa, soluong]) => ({
            chuyenkhoa,
            so_luotkham: soluong,
        })),
        theo_bacsi: Object.entries(doctorMap).map(([bacsi, soluong]) => ({
            bacsi,
            so_luotkham: soluong,
        })).sort((a, b) => b.so_luotkham - a.so_luotkham),
        trangthai_lichhen: appointmentStatusMap,
    };
}

/**
 * 4. Top dịch vụ cận lâm sàng được chỉ định nhiều nhất
 */
async function getTopServicesService({ limit = 5 } = {}) {
    const limitNum = Number(limit) || 5;

    const grouped = await prisma.chitietdichvukham.groupBy({
        by: ["madv"],
        _count: { mactdvk: true },
        _sum: { soluong: true },
        orderBy: {
            _count: { mactdvk: "desc" },
        },
        take: limitNum,
    });

    const serviceIds = grouped.map((g) => g.madv);
    const services = await prisma.dichvu.findMany({
        where: { madv: { in: serviceIds } },
        include: {
            chuyenkhoa: { select: { tenchuyenkhoa: true } },
        },
    });

    const serviceMap = {};
    for (const s of services) {
        serviceMap[s.madv] = s;
    }

    return grouped.map((g) => {
        const s = serviceMap[g.madv];
        return {
            madv: g.madv,
            tendichvu: s ? s.tendichvu : "Dịch vụ đã xóa",
            dongia: s ? Number(s.dongia) : 0,
            chuyenkhoa: s?.chuyenkhoa?.tenchuyenkhoa || "Chung",
            soluong_chidinh: g._count.mactdvk,
            tong_soluong: g._sum.soluong || g._count.mactdvk,
        };
    });
}

/**
 * 5. Top thuốc được kê đơn nhiều nhất
 */
async function getTopMedicinesService({ limit = 5 } = {}) {
    const limitNum = Number(limit) || 5;

    const grouped = await prisma.chitietdonthuoc.groupBy({
        by: ["mathuoc"],
        _count: { mactdt: true },
        _sum: { soluong: true },
        orderBy: {
            _sum: { soluong: "desc" },
        },
        take: limitNum,
    });

    const medicineIds = grouped.map((g) => g.mathuoc);
    const medicines = await prisma.thuoc.findMany({
        where: { mathuoc: { in: medicineIds } },
    });

    const medicineMap = {};
    for (const m of medicines) {
        medicineMap[m.mathuoc] = m;
    }

    return grouped.map((g) => {
        const m = medicineMap[g.mathuoc];
        return {
            mathuoc: g.mathuoc,
            tenthuoc: m ? m.tenthuoc : "Thuốc đã xóa",
            donvitinh: m ? m.donvitinh : "Viên",
            dongia: m ? Number(m.dongia) : 0,
            solan_kethuoc: g._count.mactdt,
            tong_soluong_xuat: g._sum.soluong || 0,
        };
    });
}

module.exports = {
    getOverviewStatisticsService,
    getRevenueStatisticsService,
    getExaminationStatisticsService,
    getTopServicesService,
    getTopMedicinesService,
};
