// ========================================================
// SERVICE: QUẢN LÝ LỊCH HẸN KHÁM BỆNH & CHỐNG TRÙNG KHUNG GIỜ
// ========================================================

const prisma = require("../config/prisma");
const {
    parseTimeToDate,
    getTimeInMinutes,
    formatTime,
} = require("../constants/shift.constant");
const {
    APPOINTMENT_STATUS,
    SLOT_HOLDING_STATUSES,
    canTransition,
    canRoleSetStatus,
} = require("../constants/appointment.constant");
const { SLOT_MINUTES, MAX_ADVANCE_DAYS, MIN_LEAD_MINUTES } = require("../constants/slot.constant");
const {
    todayVN,
    addDaysVN,
    parseDateOnly,
    isValidDateOnly,
    isPastDateTimeVN,
    nowTimeVN,
} = require("../utils/date");
const { isAlignedToSlot, generateSlots } = require("../utils/slot");
const { writeAudit } = require("../utils/audit");

function httpError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function formatDateOnly(value) {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function formatAppointmentResponse(apt) {
    if (!apt) return null;

    return {
        malh: apt.malh,
        mabn: apt.mabn,
        mabs: apt.mabs,
        ngayhen: formatDateOnly(apt.ngayhen),
        giohen: formatTime(apt.giohen),
        trangthai: apt.trangthai,
        lydokham: apt.lydokham,
        lydohuy: apt.lydohuy || null,
        thoigianhuy: apt.thoigianhuy || null,
        thoigiantiepdon: apt.thoigiantiepdon || null,
        sohangcho: apt.sohangcho ?? null,
        malsk: apt.lichsukham?.malsk || null,
        benhnhan: apt.benhnhan
            ? {
                mabn: apt.benhnhan.mabn,
                hoten: apt.benhnhan.hoten,
                sdt: apt.benhnhan.sdt,
                gioitinh: apt.benhnhan.gioitinh,
                ngaysinh: formatDateOnly(apt.benhnhan.ngaysinh),
                cccd: apt.benhnhan.cccd,
                sobhyt: apt.benhnhan.sobhyt,
            }
            : undefined,
        bacsi: apt.bacsi
            ? {
                mabs: apt.bacsi.mabs,
                hocham: apt.bacsi.hocham,
                kinhnghiem: apt.bacsi.kinhnghiem,
                nhanvien: apt.bacsi.nhanvien
                    ? {
                        manv: apt.bacsi.nhanvien.manv,
                        hoten: apt.bacsi.nhanvien.hoten,
                        sdt: apt.bacsi.nhanvien.sdt,
                    }
                    : undefined,
                chuyenkhoa: apt.bacsi.chuyenkhoa
                    ? {
                        mack: apt.bacsi.chuyenkhoa.mack,
                        tenchuyenkhoa: apt.bacsi.chuyenkhoa.tenchuyenkhoa,
                    }
                    : undefined,
            }
            : undefined,
    };
}

function appointmentInclude() {
    return {
        benhnhan: true,
        lichsukham: { select: { malsk: true } },
        bacsi: {
            include: {
                nhanvien: true,
                chuyenkhoa: true,
            },
        },
    };
}

async function getPatientByAccount(matk) {
    const patient = await prisma.benhnhan.findUnique({
        where: { matk: Number(matk) },
        select: { mabn: true, hoten: true },
    });
    if (!patient) {
        throw httpError(404, "Tài khoản của bạn chưa có hồ sơ bệnh nhân! Vui lòng cập nhật hồ sơ trước.");
    }
    return patient;
}

function assertAppointmentOwnership(appointment, patient) {
    if (!patient || appointment.mabn !== patient.mabn) {
        throw httpError(403, "Bạn không có quyền thao tác trên lịch hẹn này!");
    }
}

function validateBookingDate(dateStr) {
    const normalized = String(dateStr || "").trim();
    if (!isValidDateOnly(normalized)) {
        throw httpError(400, "Ngày hẹn không hợp lệ, định dạng yêu cầu là YYYY-MM-DD");
    }

    const today = todayVN();
    if (normalized < today) {
        throw httpError(400, "Không thể đặt lịch cho ngày trong quá khứ");
    }
    if (normalized > addDaysVN(today, MAX_ADVANCE_DAYS)) {
        throw httpError(400, `Chỉ được đặt lịch trước tối đa ${MAX_ADVANCE_DAYS} ngày`);
    }
    return parseDateOnly(normalized);
}

function validateBookingTime(dateStr, timeStr) {
    if (!isAlignedToSlot(timeStr, SLOT_MINUTES)) {
        throw httpError(400, `Giờ hẹn phải là bội số của ${SLOT_MINUTES} phút (ví dụ 08:00, 08:30)`);
    }
    if (isPastDateTimeVN(dateStr, timeStr)) {
        throw httpError(400, "Không thể đặt lịch cho thời điểm đã qua");
    }
    if (dateStr === todayVN()) {
        const nowMinutes = nowTimeVN().minutes;
        const targetMinutes = getTimeInMinutes(timeStr);
        if (targetMinutes < nowMinutes + MIN_LEAD_MINUTES) {
            throw httpError(400, `Vui lòng đặt lịch trước ít nhất ${MIN_LEAD_MINUTES} phút`);
        }
    }
}

async function getDoctorShiftOrThrow(doctorId, date, dateStr) {
    const shifts = await prisma.phanconglamviec.findMany({
        where: {
            manv: Number(doctorId),
            calamviec: { ngay: date },
        },
        include: { calamviec: true },
    });

    if (shifts.length === 0) {
        throw httpError(400, `Bác sĩ không có lịch trực vào ngày ${dateStr}`);
    }
    return shifts;
}

function assertWithinShift(timeStr, shifts) {
    const minutes = getTimeInMinutes(timeStr);
    const isWithin = shifts.some((assignment) => {
        const start = getTimeInMinutes(assignment.calamviec.giobatdau);
        const end = getTimeInMinutes(assignment.calamviec.gioketthuc);
        // Khung giờ phải nằm trọn trong ca, kể cả thời lượng slot.
        return minutes >= start && minutes + SLOT_MINUTES <= end;
    });

    if (!isWithin) {
        const shiftText = shifts
            .map((item) => `${formatTime(item.calamviec.giobatdau)} - ${formatTime(item.calamviec.gioketthuc)}`)
            .join(", ");
        throw httpError(400, `Giờ hẹn ${timeStr} không nằm trong ca trực của bác sĩ (${shiftText})`);
    }
}

async function assertNoSlotConflict({ mabs, mabn, ngayhen, giohen, excludeId = null }) {
    const whereBase = {
        ngayhen,
        giohen,
        trangthai: { in: SLOT_HOLDING_STATUSES },
    };
    if (excludeId) whereBase.malh = { not: Number(excludeId) };

    const [doctorConflict, patientConflict] = await Promise.all([
        prisma.lichhen.findFirst({
            where: { ...whereBase, mabs: Number(mabs) },
        }),
        prisma.lichhen.findFirst({
            where: { ...whereBase, mabn: Number(mabn) },
        }),
    ]);

    if (doctorConflict) {
        throw httpError(409, "Khung giờ này của bác sĩ đã được đặt trước, vui lòng chọn khung giờ khác");
    }
    if (patientConflict) {
        throw httpError(409, "Bệnh nhân đã có lịch hẹn trong khung giờ này");
    }
}

function normalizeSlotConflictError(error) {
    if (error?.code === "P2002") {
        return httpError(409, "Khung giờ này vừa được người khác đặt, vui lòng chọn khung giờ khác");
    }
    return error;
}

/**
 * 1. Đặt lịch khám mới
 */
async function createAppointmentService(user, data) {
    const { mabs, ngayhen, giohen, lydokham } = data;
    const doctorId = Number(mabs);
    const dateStr = String(ngayhen).trim();
    const timeStr = String(giohen).trim();

    let patient;
    if (user.vaitro === "BenhNhan") {
        patient = await getPatientByAccount(user.matk);
    } else if (["Admin", "LeTan"].includes(user.vaitro)) {
        if (!data.mabn) {
            throw httpError(400, "Vui lòng chọn bệnh nhân (mabn) khi đặt lịch tại quầy");
        }
        patient = await prisma.benhnhan.findUnique({
            where: { mabn: Number(data.mabn) },
            select: { mabn: true, hoten: true },
        });
        if (!patient) {
            throw httpError(404, `Không tìm thấy bệnh nhân với mã ID: ${data.mabn}`);
        }
    } else {
        throw httpError(403, "Vai trò tài khoản không có quyền đặt lịch khám");
    }

    const doctor = await prisma.bacsi.findUnique({
        where: { mabs: doctorId },
        include: {
            nhanvien: { select: { hoten: true } },
            chuyenkhoa: { select: { tenchuyenkhoa: true } },
        },
    });
    if (!doctor) {
        throw httpError(404, `Không tìm thấy bác sĩ với mã ID: ${doctorId}`);
    }

    const appointmentDate = validateBookingDate(dateStr);
    validateBookingTime(dateStr, timeStr);
    const appointmentTime = parseTimeToDate(timeStr);
    if (!appointmentTime) {
        throw httpError(400, "Giờ hẹn không hợp lệ");
    }

    const shifts = await getDoctorShiftOrThrow(doctorId, appointmentDate, dateStr);
    assertWithinShift(timeStr, shifts);
    await assertNoSlotConflict({
        mabs: doctorId,
        mabn: patient.mabn,
        ngayhen: appointmentDate,
        giohen: appointmentTime,
    });

    const initialStatus = ["Admin", "LeTan"].includes(user.vaitro)
        ? APPOINTMENT_STATUS.DA_XAC_NHAN
        : APPOINTMENT_STATUS.CHO_XAC_NHAN;

    let newAppointment;
    try {
        newAppointment = await prisma.lichhen.create({
            data: {
                mabn: patient.mabn,
                mabs: doctorId,
                ngayhen: appointmentDate,
                giohen: appointmentTime,
                trangthai: initialStatus,
                lydokham: lydokham ? lydokham.trim() : null,
            },
            include: appointmentInclude(),
        });
    } catch (error) {
        throw normalizeSlotConflictError(error);
    }

    await writeAudit({
        matk: user.matk,
        hanhdong: "DAT_LICH",
        doituong: "lichhen",
        doituongId: newAppointment.malh,
        sau: {
            mabn: newAppointment.mabn,
            mabs: newAppointment.mabs,
            ngayhen: dateStr,
            giohen: timeStr,
        },
    });

    return formatAppointmentResponse(newAppointment);
}

/**
 * 1b. Danh sách khung giờ còn trống của bác sĩ
 */
async function getAvailableSlotsService({ mabs, ngayhen }) {
    const doctorId = Number(mabs);
    const dateStr = String(ngayhen).trim();
    const date = validateBookingDate(dateStr);
    const today = todayVN();

    if (dateStr === today) {
        // Vẫn trả các slot đã qua nhưng đánh dấu không khả dụng.
    }

    const doctor = await prisma.bacsi.findUnique({
        where: { mabs: doctorId },
        select: { mabs: true },
    });
    if (!doctor) {
        throw httpError(404, `Không tìm thấy bác sĩ với mã ID: ${doctorId}`);
    }

    const shifts = await getDoctorShiftOrThrow(doctorId, date, dateStr);
    const booked = await prisma.lichhen.findMany({
        where: {
            mabs: doctorId,
            ngayhen: date,
            trangthai: { in: SLOT_HOLDING_STATUSES },
        },
        select: { giohen: true },
    });
    const bookedTimes = new Set(booked.map((item) => formatTime(item.giohen)));
    const nowMinutes = nowTimeVN().minutes;

    const slots = [];
    for (const shift of shifts) {
        const shiftSlots = generateSlots(
            shift.calamviec.giobatdau,
            shift.calamviec.gioketthuc,
            SLOT_MINUTES,
        );

        for (const slot of shiftSlots) {
            if (slots.some((item) => item.giohen === slot)) continue;

            const isPast = dateStr < today
                || (dateStr === today && getTimeInMinutes(slot) < nowMinutes + MIN_LEAD_MINUTES);
            slots.push({
                giohen: slot,
                conlai: !isPast && !bookedTimes.has(slot),
                daky: bookedTimes.has(slot),
            });
        }
    }

    slots.sort((a, b) => a.giohen.localeCompare(b.giohen));

    return {
        mabs: doctorId,
        ngayhen: dateStr,
        slotMinutes: SLOT_MINUTES,
        slots,
    };
}

/**
 * 2. Bệnh nhân xem lịch hẹn của chính mình
 */
async function getMyAppointmentsService(matk, query = {}) {
    const patient = await getPatientByAccount(matk);

    const where = { mabn: patient.mabn };
    if (query.status) where.trangthai = query.status;

    const appointments = await prisma.lichhen.findMany({
        where,
        include: appointmentInclude(),
        orderBy: [
            { ngayhen: "desc" },
            { giohen: "asc" },
        ],
    });

    return appointments.map(formatAppointmentResponse);
}

/**
 * 3. Lễ tân / Bác sĩ / Admin: danh sách lịch hẹn
 */
async function getAllAppointmentsService(query = {}) {
    const {
        date,
        fromDate,
        toDate,
        doctorId,
        patientId,
        specialtyId,
        status,
        search,
        page = 1,
        limit = 10,
    } = query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const where = {};

    if (date) {
        where.ngayhen = parseDateOnly(date.trim());
    } else if (fromDate || toDate) {
        where.ngayhen = {};
        if (fromDate) where.ngayhen.gte = parseDateOnly(fromDate.trim());
        if (toDate) where.ngayhen.lte = parseDateOnly(toDate.trim());
    }

    if (doctorId) where.mabs = Number(doctorId);
    if (patientId) where.mabn = Number(patientId);
    if (status) where.trangthai = status;
    if (specialtyId) where.bacsi = { is: { mack: Number(specialtyId) } };

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

    const [appointments, total] = await Promise.all([
        prisma.lichhen.findMany({
            where,
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            include: appointmentInclude(),
            orderBy: [
                { ngayhen: "asc" },
                { giohen: "asc" },
            ],
        }),
        prisma.lichhen.count({ where }),
    ]);

    return {
        data: appointments.map(formatAppointmentResponse),
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
}

/**
 * 4. Xem chi tiết một lịch hẹn
 */
async function getAppointmentByIdService(id, user) {
    const appointmentId = Number(id);
    const appointment = await prisma.lichhen.findUnique({
        where: { malh: appointmentId },
        include: appointmentInclude(),
    });

    if (!appointment) {
        throw httpError(404, `Không tìm thấy lịch hẹn với mã ID: ${appointmentId}`);
    }

    if (user.vaitro === "BenhNhan") {
        const patient = await getPatientByAccount(user.matk);
        assertAppointmentOwnership(appointment, patient);
    }

    return formatAppointmentResponse(appointment);
}

async function assignQueueNumber(tx, appointment) {
    if (appointment.sohangcho) return appointment.sohangcho;

    const aggregate = await tx.lichhen.aggregate({
        where: {
            ngayhen: appointment.ngayhen,
            mabs: appointment.mabs,
            sohangcho: { not: null },
        },
        _max: { sohangcho: true },
    });

    return (aggregate._max.sohangcho || 0) + 1;
}

/**
 * 5. Cập nhật trạng thái lịch hẹn theo state machine
 */
async function updateAppointmentStatusService(id, { trangthai, ghichu, lydohuy }, user) {
    const appointmentId = Number(id);
    const appointment = await prisma.lichhen.findUnique({
        where: { malh: appointmentId },
        include: { benhnhan: true },
    });

    if (!appointment) {
        throw httpError(404, `Không tìm thấy lịch hẹn với mã ID: ${appointmentId}`);
    }

    if (!canRoleSetStatus(user.vaitro, trangthai)) {
        throw httpError(403, "Bạn không có quyền đặt trạng thái này cho lịch hẹn");
    }

    if (user.vaitro === "BenhNhan") {
        const patient = await getPatientByAccount(user.matk);
        assertAppointmentOwnership(appointment, patient);
    }

    if (!canTransition(appointment.trangthai, trangthai)) {
        throw httpError(
            400,
            `Không thể chuyển trạng thái từ ${appointment.trangthai} sang ${trangthai}`,
        );
    }

    const cancelReason = lydohuy || ghichu;
    if (trangthai === APPOINTMENT_STATUS.DA_HUY && !cancelReason?.trim()) {
        throw httpError(400, "Vui lòng nhập lý do hủy lịch (lydohuy)");
    }

    const data = { trangthai };

    if (trangthai === APPOINTMENT_STATUS.DA_HUY) {
        data.lydohuy = cancelReason.trim().slice(0, 255);
        data.thoigianhuy = new Date();
    }
    if (ghichu?.trim()) {
        data.lydokham = `${appointment.lydokham || ""} [Ghi chú: ${ghichu.trim()}]`.trim();
    }

    let updated;
    if (trangthai === APPOINTMENT_STATUS.DA_TIEP_DON) {
        updated = await prisma.$transaction(async (tx) => {
            const queueNumber = await assignQueueNumber(tx, appointment);
            return tx.lichhen.update({
                where: { malh: appointmentId },
                data: {
                    ...data,
                    sohangcho: queueNumber,
                    thoigiantiepdon: new Date(),
                },
                include: appointmentInclude(),
            });
        });
    } else {
        updated = await prisma.lichhen.update({
            where: { malh: appointmentId },
            data,
            include: appointmentInclude(),
        });
    }

    await writeAudit({
        matk: user.matk,
        hanhdong: "DOI_TRANG_THAI_LICH",
        doituong: "lichhen",
        doituongId: appointmentId,
        truoc: { trangthai: appointment.trangthai },
        sau: { trangthai: updated.trangthai, lydohuy: updated.lydohuy || null },
    });

    return formatAppointmentResponse(updated);
}

/**
 * 6. Dời ngày/giờ khám hoặc đổi bác sĩ
 */
async function rescheduleAppointmentService(id, { ngayhen, giohen, mabs }, user) {
    const appointmentId = Number(id);
    const appointment = await prisma.lichhen.findUnique({
        where: { malh: appointmentId },
        include: { benhnhan: true, bacsi: true },
    });

    if (!appointment) {
        throw httpError(404, `Không tìm thấy lịch hẹn với mã ID: ${appointmentId}`);
    }
    if (![APPOINTMENT_STATUS.CHO_XAC_NHAN, APPOINTMENT_STATUS.DA_XAC_NHAN].includes(appointment.trangthai)) {
        throw httpError(400, "Chỉ có thể dời lịch đang chờ xác nhận hoặc đã xác nhận");
    }

    if (user.vaitro === "BenhNhan") {
        const patient = await getPatientByAccount(user.matk);
        assertAppointmentOwnership(appointment, patient);
    }

    const targetDoctorId = mabs ? Number(mabs) : appointment.mabs;
    const targetDateStr = ngayhen ? String(ngayhen).trim() : formatDateOnly(appointment.ngayhen);
    const targetTimeStr = giohen ? String(giohen).trim() : formatTime(appointment.giohen);

    const targetDate = validateBookingDate(targetDateStr);
    validateBookingTime(targetDateStr, targetTimeStr);
    const targetTime = parseTimeToDate(targetTimeStr);

    const doctor = await prisma.bacsi.findUnique({
        where: { mabs: targetDoctorId },
        select: { mabs: true },
    });
    if (!doctor) {
        throw httpError(404, "Không tìm thấy bác sĩ mới");
    }

    const shifts = await getDoctorShiftOrThrow(targetDoctorId, targetDate, targetDateStr);
    assertWithinShift(targetTimeStr, shifts);
    await assertNoSlotConflict({
        mabs: targetDoctorId,
        mabn: appointment.mabn,
        ngayhen: targetDate,
        giohen: targetTime,
        excludeId: appointmentId,
    });

    const updated = await prisma.lichhen.update({
        where: { malh: appointmentId },
        data: {
            mabs: targetDoctorId,
            ngayhen: targetDate,
            giohen: targetTime,
            trangthai: APPOINTMENT_STATUS.CHO_XAC_NHAN,
            sohangcho: null,
            thoigiantiepdon: null,
            lydohuy: null,
            thoigianhuy: null,
        },
        include: appointmentInclude(),
    });

    await writeAudit({
        matk: user.matk,
        hanhdong: "DOI_LICH",
        doituong: "lichhen",
        doituongId: appointmentId,
        truoc: {
            mabs: appointment.mabs,
            ngayhen: formatDateOnly(appointment.ngayhen),
            giohen: formatTime(appointment.giohen),
        },
        sau: { mabs: targetDoctorId, ngayhen: targetDateStr, giohen: targetTimeStr },
    });

    return formatAppointmentResponse(updated);
}

/**
 * 6b. Hủy lịch hẹn (có lý do bắt buộc)
 */
async function cancelAppointmentService(id, user, lydohuy) {
    return updateAppointmentStatusService(
        id,
        { trangthai: APPOINTMENT_STATUS.DA_HUY, lydohuy },
        user,
    );
}

/**
 * 7. Tiếp đón bệnh nhân (check-in) và cấp số thứ tự
 */
async function checkInAppointmentService(id, user) {
    const appointmentId = Number(id);
    const appointment = await prisma.lichhen.findUnique({
        where: { malh: appointmentId },
        include: { benhnhan: true },
    });

    if (!appointment) {
        throw httpError(404, `Không tìm thấy lịch hẹn với mã ID: ${appointmentId}`);
    }
    if (appointment.trangthai !== APPOINTMENT_STATUS.DA_XAC_NHAN) {
        throw httpError(400, "Chỉ có thể tiếp đón lịch hẹn đã được xác nhận");
    }

    const updated = await prisma.$transaction(async (tx) => {
        const queueNumber = await assignQueueNumber(tx, appointment);
        return tx.lichhen.update({
            where: { malh: appointmentId },
            data: {
                trangthai: APPOINTMENT_STATUS.DA_TIEP_DON,
                sohangcho: queueNumber,
                thoigiantiepdon: new Date(),
            },
            include: appointmentInclude(),
        });
    });

    await writeAudit({
        matk: user.matk,
        hanhdong: "TIEP_DON",
        doituong: "lichhen",
        doituongId: appointmentId,
        sau: { sohangcho: updated.sohangcho },
    });

    return formatAppointmentResponse(updated);
}

/**
 * 8. Hàng chờ khám trong ngày
 */
async function getQueueService(query = {}) {
    const dateStr = query.date ? String(query.date).trim() : todayVN();
    const date = parseDateOnly(dateStr);
    if (!date) {
        throw httpError(400, "Ngày hàng chờ không hợp lệ");
    }

    const where = {
        ngayhen: date,
        trangthai: {
            in: [
                APPOINTMENT_STATUS.DA_XAC_NHAN,
                APPOINTMENT_STATUS.DA_TIEP_DON,
                APPOINTMENT_STATUS.DA_KHAM,
            ],
        },
    };
    if (query.mabs) where.mabs = Number(query.mabs);

    const rows = await prisma.lichhen.findMany({
        where,
        include: appointmentInclude(),
        orderBy: [
            { sohangcho: { sort: "asc", nulls: "last" } },
            { giohen: "asc" },
        ],
    });

    return {
        ngayhen: dateStr,
        data: rows.map(formatAppointmentResponse),
        summary: {
            tong: rows.length,
            datiepdon: rows.filter((row) => row.trangthai === APPOINTMENT_STATUS.DA_TIEP_DON).length,
            dakham: rows.filter((row) => row.trangthai === APPOINTMENT_STATUS.DA_KHAM).length,
        },
    };
}

module.exports = {
    formatAppointmentResponse,
    createAppointmentService,
    getAvailableSlotsService,
    getMyAppointmentsService,
    getAllAppointmentsService,
    getAppointmentByIdService,
    updateAppointmentStatusService,
    rescheduleAppointmentService,
    cancelAppointmentService,
    checkInAppointmentService,
    getQueueService,
};
