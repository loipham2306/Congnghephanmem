// ========================================================
// SERVICE: BÁO CÁO & THỐNG KÊ DOANH THU, LƯỢT KHÁM CHO ADMIN
// ========================================================

const prisma = require("../config/prisma");
const {
    todayVN,
    startOfDayVN,
    endOfDayVN,
    parseDateOnly,
    dateRangeFromQuery,
    formatDateVN,
    monthKeyVN,
} = require("../utils/date");

function num(value) {
    return value !== null && value !== undefined ? Number(value) : 0;
}

function paidInvoiceWhere(start, end) {
    // Lấy mọi hóa đơn đã từng phát sinh tiền thu, kể cả hóa đơn sau đó bị hủy/hoàn đủ.
    // Nếu lọc trangthai=DaThanhToan thì hóa đơn hoàn đủ (DaHuy) sẽ biến mất khỏi doanh thu gộp,
    // trong khi hoàn tiền vẫn bị trừ -> báo cáo âm sai.
    return {
        OR: [
            { ngaythanhtoan: { gte: start, lte: end } },
            {
                ngaythanhtoan: null,
                trangthaithanhtoan: "DaThanhToan",
                ngaylap: { gte: start, lte: end },
            },
        ],
    };
}

async function sumRevenue(start, end) {
    const [gross, refund] = await Promise.all([
        prisma.hoadon.aggregate({
            where: paidInvoiceWhere(start, end),
            _sum: { tongtien: true },
        }),
        prisma.hoantien.aggregate({
            where: { ngaytao: { gte: start, lte: end } },
            _sum: { sotien: true },
        }),
    ]);

    const grossAmount = num(gross._sum.tongtien);
    const refundAmount = num(refund._sum.sotien);
    return {
        gross: grossAmount,
        refund: refundAmount,
        net: grossAmount - refundAmount,
    };
}

/**
 * 1. Báo cáo tổng quan Dashboard
 */
async function getOverviewStatisticsService() {
    const today = todayVN();
    const startOfToday = startOfDayVN(today);
    const endOfToday = endOfDayVN(today);
    const monthStart = startOfDayVN(`${today.slice(0, 7)}-01`);

    const [
        totalPatients,
        totalDoctors,
        todayAppointments,
        todayExams,
        waitingToday,
        pendingAppointments,
        totalRevenue,
        todayRevenue,
        monthRevenue,
        unpaidInvoicesCount,
    ] = await Promise.all([
        prisma.benhnhan.count(),
        prisma.bacsi.count(),
        prisma.lichhen.count({ where: { ngayhen: parseDateOnly(today) } }),
        prisma.lichsukham.count({ where: { ngay: { gte: startOfToday, lte: endOfToday } } }),
        prisma.lichhen.count({
            where: { ngayhen: parseDateOnly(today), trangthai: "DaTiepDon" },
        }),
        prisma.lichhen.count({ where: { trangthai: "ChoXacNhan" } }),
        sumRevenue(new Date(0), new Date("2999-12-31T23:59:59.999Z")),
        sumRevenue(startOfToday, endOfToday),
        sumRevenue(monthStart, endOfToday),
        prisma.hoadon.count({ where: { trangthaithanhtoan: "ChuaThanhToan" } }),
    ]);

    return {
        tongbenhnhan: totalPatients,
        tongbacsi: totalDoctors,
        lichhen_homnay: todayAppointments,
        lichhen_choxacnhan: pendingAppointments,
        hangcho_homnay: waitingToday,
        luotkham_homnay: todayExams,
        doanhthu_homnay: todayRevenue.net,
        doanhthu_thangnay: monthRevenue.net,
        tongdoanhthu: totalRevenue.net,
        tong_hoantien: totalRevenue.refund,
        hoadon_chuathanhtoan: unpaidInvoicesCount,
        ngay: today,
    };
}

/**
 * 2. Thống kê chi tiết doanh thu theo khoảng thời gian và phương thức thanh toán
 */
async function getRevenueStatisticsService({ startDate, endDate, groupBy = "day" } = {}) {
    const range = dateRangeFromQuery(startDate, endDate, 30);
    const grouping = groupBy === "month" ? "month" : "day";

    const [invoices, refunds] = await Promise.all([
        prisma.hoadon.findMany({
            where: paidInvoiceWhere(range.start, range.end),
            include: { chitiethoadon: true },
            orderBy: { ngaythanhtoan: "asc" },
        }),
        prisma.hoantien.findMany({
            where: { ngaytao: { gte: range.start, lte: range.end } },
            orderBy: { ngaytao: "asc" },
        }),
    ]);

    let grossRevenue = 0;
    let serviceRevenue = 0;
    let medicineRevenue = 0;
    const paymentMethods = {
        TienMat: 0,
        ChuyenKhoan: 0,
        TheThanhToan: 0,
        ViDienTu: 0,
        ChuaXacDinh: 0,
    };
    const timelineMap = {};

    const ensureTimeline = (key) => {
        if (!timelineMap[key]) {
            timelineMap[key] = {
                moc_thoigian: key,
                doanhthu: 0,
                hoantien: 0,
                doanhthu_thuan: 0,
                so_hoadon: 0,
            };
        }
        return timelineMap[key];
    };

    for (const invoice of invoices) {
        const amount = num(invoice.tongtien);
        grossRevenue += amount;

        const method = invoice.phuongthuctt || "ChuaXacDinh";
        paymentMethods[method] = (paymentMethods[method] || 0) + amount;

        for (const item of invoice.chitiethoadon || []) {
            const itemTotal = num(item.thanhtien) || num(item.soluong) * num(item.dongia);
            if (item.madv) serviceRevenue += itemTotal;
            else if (item.mathuoc) medicineRevenue += itemTotal;
        }

        const paidAt = invoice.ngaythanhtoan || invoice.ngaylap;
        const key = grouping === "month" ? monthKeyVN(paidAt) : formatDateVN(paidAt);
        const bucket = ensureTimeline(key);
        bucket.doanhthu += amount;
        bucket.so_hoadon += 1;
    }

    let totalRefund = 0;
    for (const refund of refunds) {
        const amount = num(refund.sotien);
        totalRefund += amount;

        const method = refund.phuongthuc || "ChuaXacDinh";
        paymentMethods[method] = (paymentMethods[method] || 0) - amount;

        const key = grouping === "month" ? monthKeyVN(refund.ngaytao) : formatDateVN(refund.ngaytao);
        const bucket = ensureTimeline(key);
        bucket.hoantien += amount;
    }

    const timeline = Object.values(timelineMap)
        .map((row) => ({
            ...row,
            doanhthu_thuan: row.doanhthu - row.hoantien,
        }))
        .sort((a, b) => a.moc_thoigian.localeCompare(b.moc_thoigian));

    return {
        khoang_thoigian: {
            tu_ngay: range.startStr,
            den_ngay: range.endStr,
            kieu_gomnhom: grouping,
        },
        tong_doanhthu_gop: grossRevenue,
        tong_hoantien: totalRefund,
        tong_doanhthu: grossRevenue - totalRefund,
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
 * 3. Thống kê lượt khám theo chuyên khoa, bác sĩ và trạng thái lịch hẹn
 */
async function getExaminationStatisticsService({ startDate, endDate } = {}) {
    const range = dateRangeFromQuery(startDate, endDate, 30);
    const startDateOnly = parseDateOnly(range.startStr);
    const endDateOnly = parseDateOnly(range.endStr);

    const [examinations, appointmentCounts] = await Promise.all([
        prisma.lichsukham.findMany({
            where: { ngay: { gte: range.start, lte: range.end } },
            include: {
                bacsi: {
                    include: {
                        nhanvien: { select: { hoten: true } },
                        chuyenkhoa: { select: { mack: true, tenchuyenkhoa: true } },
                    },
                },
            },
        }),
        prisma.lichhen.groupBy({
            by: ["trangthai"],
            where: { ngayhen: { gte: startDateOnly, lte: endDateOnly } },
            _count: { malh: true },
        }),
    ]);

    const specialtyMap = {};
    const doctorMap = {};

    for (const exam of examinations) {
        const specName = exam.bacsi?.chuyenkhoa?.tenchuyenkhoa || "Chưa phân khoa";
        specialtyMap[specName] = (specialtyMap[specName] || 0) + 1;

        const docName = exam.bacsi?.nhanvien?.hoten || `Bác sĩ #${exam.mabs}`;
        doctorMap[docName] = (doctorMap[docName] || 0) + 1;
    }

    const appointmentStatusMap = {
        ChoXacNhan: 0,
        DaXacNhan: 0,
        DaTiepDon: 0,
        DaKham: 0,
        DaHuy: 0,
    };
    let totalAppointments = 0;
    for (const row of appointmentCounts) {
        appointmentStatusMap[row.trangthai] = row._count.malh;
        totalAppointments += row._count.malh;
    }

    return {
        khoang_thoigian: { tu_ngay: range.startStr, den_ngay: range.endStr },
        tong_luotkham_thucte: examinations.length,
        tong_lichhen: totalAppointments,
        theo_chuyenkhoa: Object.entries(specialtyMap)
            .map(([chuyenkhoa, soluong]) => ({ chuyenkhoa, so_luotkham: soluong }))
            .sort((a, b) => b.so_luotkham - a.so_luotkham),
        theo_bacsi: Object.entries(doctorMap)
            .map(([bacsi, soluong]) => ({ bacsi, so_luotkham: soluong }))
            .sort((a, b) => b.so_luotkham - a.so_luotkham),
        trangthai_lichhen: appointmentStatusMap,
    };
}

/**
 * 4. Top dịch vụ được chỉ định nhiều nhất (có lọc ngày)
 */
async function getTopServicesService({ limit = 5, startDate, endDate } = {}) {
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 5));
    const range = dateRangeFromQuery(startDate, endDate, 30);

    const exams = await prisma.lichsukham.findMany({
        where: { ngay: { gte: range.start, lte: range.end } },
        select: { malsk: true },
    });
    const examIds = exams.map((exam) => exam.malsk);

    const grouped = examIds.length === 0
        ? []
        : await prisma.chitietdichvukham.groupBy({
            by: ["madv"],
            where: { malsk: { in: examIds } },
            _count: { mactdvk: true },
            _sum: { soluong: true },
            orderBy: { _count: { mactdvk: "desc" } },
            take: limitNum,
        });

    const serviceIds = grouped.map((g) => g.madv);
    const services = await prisma.dichvu.findMany({
        where: { madv: { in: serviceIds } },
        include: { chuyenkhoa: { select: { tenchuyenkhoa: true } } },
    });
    const serviceMap = Object.fromEntries(services.map((item) => [item.madv, item]));

    return {
        khoang_thoigian: { tu_ngay: range.startStr, den_ngay: range.endStr },
        data: grouped.map((g) => {
            const service = serviceMap[g.madv];
            return {
                madv: g.madv,
                tendichvu: service ? service.tendichvu : "Dịch vụ đã xóa",
                dongia: service ? num(service.dongia) : 0,
                chuyenkhoa: service?.chuyenkhoa?.tenchuyenkhoa || "Chung",
                soluong_chidinh: g._count.mactdvk,
                tong_soluong: g._sum.soluong || g._count.mactdvk,
            };
        }),
    };
}

/**
 * 5. Top thuốc được kê đơn nhiều nhất (có lọc ngày)
 */
async function getTopMedicinesService({ limit = 5, startDate, endDate } = {}) {
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 5));
    const range = dateRangeFromQuery(startDate, endDate, 30);

    const prescriptions = await prisma.donthuoc.findMany({
        where: {
            lichsukham: {
                is: { ngay: { gte: range.start, lte: range.end } },
            },
        },
        select: { madt: true },
    });
    const prescriptionIds = prescriptions.map((item) => item.madt);

    const grouped = prescriptionIds.length === 0
        ? []
        : await prisma.chitietdonthuoc.groupBy({
            by: ["mathuoc"],
            where: { madt: { in: prescriptionIds } },
            _count: { mactdt: true },
            _sum: { soluong: true },
            orderBy: { _sum: { soluong: "desc" } },
            take: limitNum,
        });

    const medicineIds = grouped.map((g) => g.mathuoc);
    const medicines = await prisma.thuoc.findMany({
        where: { mathuoc: { in: medicineIds } },
    });
    const medicineMap = Object.fromEntries(medicines.map((item) => [item.mathuoc, item]));

    return {
        khoang_thoigian: { tu_ngay: range.startStr, den_ngay: range.endStr },
        data: grouped.map((g) => {
            const medicine = medicineMap[g.mathuoc];
            return {
                mathuoc: g.mathuoc,
                tenthuoc: medicine ? medicine.tenthuoc : "Thuốc đã xóa",
                donvitinh: medicine ? medicine.donvitinh : "Viên",
                dongia: medicine ? num(medicine.dongia) : 0,
                solan_kethuoc: g._count.mactdt,
                tong_soluong_xuat: g._sum.soluong || 0,
            };
        }),
    };
}

/**
 * 6. Thống kê bệnh nhân mới theo khoảng thời gian
 */
async function getPatientStatisticsService({ startDate, endDate } = {}) {
    const range = dateRangeFromQuery(startDate, endDate, 30);
    const patients = await prisma.benhnhan.findMany({
        where: {
            ngaydangky: {
                gte: parseDateOnly(range.startStr),
                lte: parseDateOnly(range.endStr),
            },
        },
        select: {
            mabn: true,
            gioitinh: true,
            ngaysinh: true,
            ngaydangky: true,
        },
    });

    const gender = { Nam: 0, Nu: 0, Khac: 0 };
    const ageGroups = {
        "0-17": 0,
        "18-35": 0,
        "36-60": 0,
        "60+": 0,
    };
    const currentYear = Number(todayVN().slice(0, 4));

    for (const patient of patients) {
        gender[patient.gioitinh] = (gender[patient.gioitinh] || 0) + 1;
        const birthYear = Number(formatDateVN(patient.ngaysinh).slice(0, 4));
        const age = Math.max(0, currentYear - birthYear);
        if (age <= 17) ageGroups["0-17"] += 1;
        else if (age <= 35) ageGroups["18-35"] += 1;
        else if (age <= 60) ageGroups["36-60"] += 1;
        else ageGroups["60+"] += 1;
    }

    return {
        khoang_thoigian: { tu_ngay: range.startStr, den_ngay: range.endStr },
        tong_benhnhan_moi: patients.length,
        theo_gioitinh: gender,
        theo_nhomtuoi: ageGroups,
    };
}

async function getRevenueBySpecialtyOrDoctorService({
    startDate,
    endDate,
    groupBy = "specialty",
} = {}) {
    const range = dateRangeFromQuery(startDate, endDate, 30);

    const invoices = await prisma.hoadon.findMany({
        where: paidInvoiceWhere(range.start, range.end),
        include: {
            chitiethoadon: {
                include: {
                    dichvu: {
                        include: { chuyenkhoa: true },
                    },
                },
            },
            lichsukham: {
                include: {
                    bacsi: {
                        include: {
                            nhanvien: { select: { hoten: true } },
                            chuyenkhoa: true,
                        },
                    },
                },
            },
        },
    });

    const result = {};

    for (const invoice of invoices) {
        const exam = invoice.lichsukham;
        const examSpecialty = exam?.bacsi?.chuyenkhoa?.tenchuyenkhoa || "Chưa phân khoa";
        const doctorName = exam?.bacsi?.nhanvien?.hoten || "Chưa xác định";

        for (const item of invoice.chitiethoadon || []) {
            const amount = num(item.thanhtien) || num(item.soluong) * num(item.dongia);
            const specialtyName = item.dichvu?.chuyenkhoa?.tenchuyenkhoa || examSpecialty;
            const key = groupBy === "doctor" ? doctorName : specialtyName;

            if (!result[key]) {
                result[key] = {
                    ten: key,
                    doanhthu: 0,
                    so_dong: 0,
                };
            }
            result[key].doanhthu += amount;
            result[key].so_dong += 1;
        }
    }

    return {
        khoang_thoigian: { tu_ngay: range.startStr, den_ngay: range.endStr },
        gom_nhom: groupBy === "doctor" ? "bacsi" : "chuyenkhoa",
        data: Object.values(result).sort((a, b) => b.doanhthu - a.doanhthu),
    };
}

async function exportRevenueCsvService({ startDate, endDate, groupBy = "day" } = {}) {
    const report = await getRevenueStatisticsService({ startDate, endDate, groupBy });
    const rows = [
        ["Mốc thời gian", "Doanh thu gộp", "Hoàn tiền", "Doanh thu thuần", "Số hóa đơn"],
        ...report.bieudo_doanhthu.map((row) => [
            row.moc_thoigian,
            row.doanhthu,
            row.hoantien,
            row.doanhthu_thuan,
            row.so_hoadon,
        ]),
    ];

    return {
        filename: `doanh-thu-${report.khoang_thoigian.tu_ngay}-${report.khoang_thoigian.den_ngay}.csv`,
        csv: rows
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n"),
    };
}

module.exports = {
    getOverviewStatisticsService,
    getRevenueStatisticsService,
    getExaminationStatisticsService,
    getTopServicesService,
    getTopMedicinesService,
    getPatientStatisticsService,
    getRevenueBySpecialtyOrDoctorService,
    exportRevenueCsvService,
};
