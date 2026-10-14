const prisma = require("../config/prisma");
const {
    SHIFT_ROLES,
    parseTimeToDate,
    getTimeInMinutes,
    formatTime,
    isTimeOverlap,
} = require("../constants/shift.constant");

// Chuẩn hóa đối tượng ca làm việc trả về cho client
function formatShiftResponse(shift) {
    if (!shift) return null;

    const formattedDate = shift.ngay instanceof Date
        ? shift.ngay.toISOString().split("T")[0]
        : shift.ngay;

    return {
        maca: shift.maca,
        ngay: formattedDate,
        giobatdau: formatTime(shift.giobatdau),
        gioketthuc: formatTime(shift.gioketthuc),
        maphong: shift.maphong,
        phongkham: shift.phongkham
            ? {
                maphong: shift.phongkham.maphong,
                tenphong: shift.phongkham.tenphong,
                trangthai: shift.phongkham.trangthai,
                chuyenkhoa: shift.phongkham.chuyenkhoa
                    ? {
                        mack: shift.phongkham.chuyenkhoa.mack,
                        tenchuyenkhoa: shift.phongkham.chuyenkhoa.tenchuyenkhoa,
                    }
                    : undefined,
            }
            : undefined,
        phanconglamviec: Array.isArray(shift.phanconglamviec)
            ? shift.phanconglamviec.map((pclv) => ({
                mapclv: pclv.mapclv,
                manv: pclv.manv,
                vaitrotrongca: pclv.vaitrotrongca,
                nhanvien: pclv.nhanvien
                    ? {
                        manv: pclv.nhanvien.manv,
                        hoten: pclv.nhanvien.hoten,
                        chucvu: pclv.nhanvien.chucvu,
                        sdt: pclv.nhanvien.sdt,
                        bacsi: pclv.nhanvien.bacsi
                            ? {
                                mabs: pclv.nhanvien.bacsi.mabs,
                                hocham: pclv.nhanvien.bacsi.hocham,
                                chuyenkhoa: pclv.nhanvien.bacsi.chuyenkhoa
                                    ? {
                                        mack: pclv.nhanvien.bacsi.chuyenkhoa.mack,
                                        tenchuyenkhoa: pclv.nhanvien.bacsi.chuyenkhoa.tenchuyenkhoa,
                                    }
                                    : undefined,
                            }
                            : undefined,
                    }
                    : undefined,
            }))
            : undefined,
        _count: shift._count,
    };
}

// Kiểm tra xem phòng khám có bị trùng lịch trong cùng ngày và khung giờ không
async function checkRoomConflict(maphong, ngayDate, startMinutes, endMinutes, excludeMaca = null) {
    const existingShifts = await prisma.calamviec.findMany({
        where: {
            maphong: Number(maphong),
            ngay: ngayDate,
            ...(excludeMaca ? { NOT: { maca: Number(excludeMaca) } } : {}),
        },
        include: {
            phongkham: {
                select: { tenphong: true },
            },
        },
    });

    for (const shift of existingShifts) {
        if (isTimeOverlap(startMinutes, endMinutes, shift.giobatdau, shift.gioketthuc)) {
            const error = new Error(
                `Xung đột lịch phòng: Phòng khám "${shift.phongkham.tenphong}" đã có ca làm việc khác (${formatTime(shift.giobatdau)} - ${formatTime(shift.gioketthuc)}) trong khung giờ này!`,
            );
            error.statusCode = 409;
            throw error;
        }
    }
}

// Kiểm tra xem nhân viên y tế có bị trùng lịch trực ca khác trong cùng ngày không
async function checkStaffConflict(manv, ngayDate, startMinutes, endMinutes, excludeMaca = null) {
    const staffAssignments = await prisma.phanconglamviec.findMany({
        where: {
            manv: Number(manv),
            calamviec: {
                ngay: ngayDate,
                ...(excludeMaca ? { NOT: { maca: Number(excludeMaca) } } : {}),
            },
        },
        include: {
            nhanvien: {
                select: { hoten: true },
            },
            calamviec: {
                include: {
                    phongkham: {
                        select: { tenphong: true },
                    },
                },
            },
        },
    });

    for (const assignment of staffAssignments) {
        const otherShift = assignment.calamviec;
        if (isTimeOverlap(startMinutes, endMinutes, otherShift.giobatdau, otherShift.gioketthuc)) {
            const error = new Error(
                `Xung đột lịch trực: Nhân viên "${assignment.nhanvien.hoten}" (Mã: ${manv}) đã có ca trực tại phòng "${otherShift.phongkham.tenphong}" (${formatTime(otherShift.giobatdau)} - ${formatTime(otherShift.gioketthuc)}) bị trùng giờ!`,
            );
            error.statusCode = 409;
            throw error;
        }
    }
}

// [GET] Lấy danh sách ca làm việc (hỗ trợ lọc theo ngày, phòng khám, nhân viên, chuyên khoa, phân trang)
async function getAllShiftsService({
    date,
    fromDate,
    toDate,
    roomId,
    staffId,
    specialtyId,
    page,
    limit,
} = {}) {
    const where = {};

    // Lọc theo ngày cụ thể hoặc khoảng ngày
    if (date) {
        where.ngay = new Date(date);
    } else if (fromDate || toDate) {
        where.ngay = {};
        if (fromDate) where.ngay.gte = new Date(fromDate);
        if (toDate) where.ngay.lte = new Date(toDate);
    }

    // Lọc theo phòng khám
    if (roomId) {
        where.maphong = Number(roomId);
    }

    // Lọc theo chuyên khoa của phòng khám
    if (specialtyId) {
        where.phongkham = {
            mack: Number(specialtyId),
        };
    }

    // Lọc theo nhân viên được phân công vào ca
    if (staffId) {
        where.phanconglamviec = {
            some: {
                manv: Number(staffId),
            },
        };
    }

    const include = {
        phongkham: {
            include: {
                chuyenkhoa: {
                    select: {
                        mack: true,
                        tenchuyenkhoa: true,
                    },
                },
            },
        },
        phanconglamviec: {
            include: {
                nhanvien: {
                    select: {
                        manv: true,
                        hoten: true,
                        chucvu: true,
                        sdt: true,
                        bacsi: {
                            select: {
                                mabs: true,
                                hocham: true,
                                chuyenkhoa: {
                                    select: {
                                        mack: true,
                                        tenchuyenkhoa: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        _count: {
            select: {
                phanconglamviec: true,
            },
        },
    };

    const orderBy = [{ ngay: "asc" }, { giobatdau: "asc" }];

    // Phân trang
    if (page || limit) {
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 10);
        const skip = (pageNumber - 1) * pageSize;

        const [totalItems, items] = await Promise.all([
            prisma.calamviec.count({ where }),
            prisma.calamviec.findMany({
                where,
                include,
                skip,
                take: pageSize,
                orderBy,
            }),
        ]);

        return {
            items: items.map(formatShiftResponse),
            pagination: {
                total: totalItems,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(totalItems / pageSize),
            },
        };
    }

    // Trả về toàn bộ danh sách phù hợp
    const shifts = await prisma.calamviec.findMany({
        where,
        include,
        orderBy,
    });

    return shifts.map(formatShiftResponse);
}

// [GET] Lấy chi tiết thông tin một ca làm việc theo mã ID
async function getShiftByIdService(maca) {
    const id = Number(maca);

    const shift = await prisma.calamviec.findUnique({
        where: { maca: id },
        include: {
            phongkham: {
                include: {
                    chuyenkhoa: {
                        select: {
                            mack: true,
                            tenchuyenkhoa: true,
                            mota: true,
                        },
                    },
                },
            },
            phanconglamviec: {
                include: {
                    nhanvien: {
                        select: {
                            manv: true,
                            hoten: true,
                            gioitinh: true,
                            chucvu: true,
                            sdt: true,
                            bacsi: {
                                select: {
                                    mabs: true,
                                    hocham: true,
                                    kinhnghiem: true,
                                    sogiayphephanhnghe: true,
                                    chuyenkhoa: {
                                        select: {
                                            mack: true,
                                            tenchuyenkhoa: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            _count: {
                select: {
                    phanconglamviec: true,
                },
            },
        },
    });

    if (!shift) {
        const error = new Error(`Không tìm thấy ca làm việc với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    return formatShiftResponse(shift);
}

// [POST] Tạo mới ca làm việc (kèm hỗ trợ phân công nhân viên nếu có)
async function createShiftService({ ngay, giobatdau, gioketthuc, maphong, assignments }) {
    const roomId = Number(maphong);
    const targetDate = new Date(ngay);
    const startMinutes = getTimeInMinutes(giobatdau);
    const endMinutes = getTimeInMinutes(gioketthuc);

    // kiểm tra phòng khám có tồn tại và sẵn sàng hoạt động không
    const room = await prisma.phongkham.findUnique({
        where: { maphong: roomId },
    });

    if (!room) {
        const error = new Error(`Phòng khám với mã ID ${roomId} không tồn tại trong hệ thống!`);
        error.statusCode = 404;
        throw error;
    }

    if (room.trangthai === "BaoTri") {
        const error = new Error(
            `Không thể tạo ca làm việc cho phòng "${room.tenphong}" vì phòng đang trong trạng thái Bảo trì!`,
        );
        error.statusCode = 400;
        throw error;
    }

    // kiểm tra xung đột lịch phòng khám
    await checkRoomConflict(roomId, targetDate, startMinutes, endMinutes);

    // nếu có phân công nhân sự gửi kèm, kiểm tra sự tồn tại và xung đột lịch trực
    if (assignments && assignments.length > 0) {
        for (const item of assignments) {
            const staff = await prisma.nhanvien.findUnique({
                where: { manv: Number(item.manv) },
            });

            if (!staff) {
                const error = new Error(
                    `Nhân viên với mã ID ${item.manv} không tồn tại trong hệ thống!`,
                );
                error.statusCode = 404;
                throw error;
            }

            // kiểm tra xung đột lịch của nhân viên
            await checkStaffConflict(item.manv, targetDate, startMinutes, endMinutes);
        }
    }

    // tạo ca làm việc và phân công (nếu có) trong cùng một Transaction
    const newShift = await prisma.calamviec.create({
        data: {
            ngay: targetDate,
            giobatdau: parseTimeToDate(giobatdau),
            gioketthuc: parseTimeToDate(gioketthuc),
            maphong: roomId,
            ...(assignments && assignments.length > 0
                ? {
                    phanconglamviec: {
                        create: assignments.map((a) => ({
                            manv: Number(a.manv),
                            vaitrotrongca: a.vaitrotrongca || SHIFT_ROLES.STAFF,
                        })),
                    },
                }
                : {}),
        },
        include: {
            phongkham: {
                include: {
                    chuyenkhoa: {
                        select: {
                            mack: true,
                            tenchuyenkhoa: true,
                        },
                    },
                },
            },
            phanconglamviec: {
                include: {
                    nhanvien: {
                        select: {
                            manv: true,
                            hoten: true,
                            chucvu: true,
                            sdt: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    phanconglamviec: true,
                },
            },
        },
    });

    return formatShiftResponse(newShift);
}

// [PUT] Cập nhật thông tin ca làm việc
async function updateShiftService(maca, updateData) {
    const id = Number(maca);

    // Kiểm tra ca làm việc hiện tại
    const currentShift = await prisma.calamviec.findUnique({
        where: { maca: id },
        include: {
            phanconglamviec: true,
        },
    });

    if (!currentShift) {
        const error = new Error(`Không tìm thấy ca làm việc với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // xác định các giá trị sau khi cập nhật
    const effectiveDate = updateData.ngay ? new Date(updateData.ngay) : currentShift.ngay;
    const effectiveRoomId = updateData.maphong !== undefined ? Number(updateData.maphong) : currentShift.maphong;
    const effectiveStartMinutes = updateData.giobatdau
        ? getTimeInMinutes(updateData.giobatdau)
        : getTimeInMinutes(currentShift.giobatdau);
    const effectiveEndMinutes = updateData.gioketthuc
        ? getTimeInMinutes(updateData.gioketthuc)
        : getTimeInMinutes(currentShift.gioketthuc);

    // Kiểm tra giờ hợp lệ
    if (effectiveEndMinutes <= effectiveStartMinutes) {
        const error = new Error("Giờ kết thúc ca làm việc phải lớn hơn giờ bắt đầu!");
        error.statusCode = 400;
        throw error;
    }

    // nếu đổi phòng khám, kiểm tra phòng có tồn tại & hoạt động không
    if (updateData.maphong && updateData.maphong !== currentShift.maphong) {
        const room = await prisma.phongkham.findUnique({
            where: { maphong: effectiveRoomId },
        });

        if (!room) {
            const error = new Error(`Phòng khám với mã ID ${effectiveRoomId} không tồn tại!`);
            error.statusCode = 404;
            throw error;
        }

        if (room.trangthai === "BaoTri") {
            const error = new Error(
                `Không thể chuyển ca sang phòng "${room.tenphong}" vì phòng đang trong trạng thái Bảo trì!`,
            );
            error.statusCode = 400;
            throw error;
        }
    }

    // kiểm tra xung đột lịch phòng khám (loại trừ chính ca này)
    await checkRoomConflict(effectiveRoomId, effectiveDate, effectiveStartMinutes, effectiveEndMinutes, id);

    // kiểm tra xung đột lịch của toàn bộ nhân viên đã được phân công vào ca này
    if (currentShift.phanconglamviec && currentShift.phanconglamviec.length > 0) {
        for (const pclv of currentShift.phanconglamviec) {
            await checkStaffConflict(pclv.manv, effectiveDate, effectiveStartMinutes, effectiveEndMinutes, id);
        }
    }

    // cập nhật dữ liệu
    const dataToUpdate = {};
    if (updateData.ngay) dataToUpdate.ngay = effectiveDate;
    if (updateData.giobatdau) dataToUpdate.giobatdau = parseTimeToDate(updateData.giobatdau);
    if (updateData.gioketthuc) dataToUpdate.gioketthuc = parseTimeToDate(updateData.gioketthuc);
    if (updateData.maphong !== undefined) dataToUpdate.maphong = effectiveRoomId;

    const updatedShift = await prisma.calamviec.update({
        where: { maca: id },
        data: dataToUpdate,
        include: {
            phongkham: {
                include: {
                    chuyenkhoa: {
                        select: {
                            mack: true,
                            tenchuyenkhoa: true,
                        },
                    },
                },
            },
            phanconglamviec: {
                include: {
                    nhanvien: {
                        select: {
                            manv: true,
                            hoten: true,
                            chucvu: true,
                            sdt: true,
                        },
                    },
                },
            },
            _count: {
                select: {
                    phanconglamviec: true,
                },
            },
        },
    });

    return formatShiftResponse(updatedShift);
}

// [DELETE] Xóa một ca làm việc khỏi hệ thống (Cascade xóa các phân công liên quan)
async function deleteShiftService(maca) {
    const id = Number(maca);

    const shift = await prisma.calamviec.findUnique({
        where: { maca: id },
        include: {
            phongkham: {
                select: {
                    tenphong: true,
                },
            },
            _count: {
                select: {
                    phanconglamviec: true,
                },
            },
        },
    });

    if (!shift) {
        const error = new Error(`Không tìm thấy ca làm việc với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    await prisma.calamviec.delete({
        where: { maca: id },
    });

    return {
        maca: id,
        ngay: shift.ngay instanceof Date ? shift.ngay.toISOString().split("T")[0] : shift.ngay,
        giobatdau: formatTime(shift.giobatdau),
        gioketthuc: formatTime(shift.gioketthuc),
        tenphong: shift.phongkham?.tenphong,
        deletedAssignmentsCount: shift._count.phanconglamviec,
    };
}

// [POST] Phân công một nhân viên vào ca làm việc
async function assignStaffToShiftService(maca, { manv, vaitrotrongca }) {
    const shiftId = Number(maca);
    const staffId = Number(manv);

    // kiểm tra ca làm việc tồn tại
    const shift = await prisma.calamviec.findUnique({
        where: { maca: shiftId },
        include: {
            phongkham: true,
        },
    });

    if (!shift) {
        const error = new Error(`Không tìm thấy ca làm việc với mã ID: ${shiftId}`);
        error.statusCode = 404;
        throw error;
    }

    // kiểm tra nhân viên tồn tại
    const staff = await prisma.nhanvien.findUnique({
        where: { manv: staffId },
        include: {
            bacsi: {
                select: {
                    mabs: true,
                    hocham: true,
                },
            },
        },
    });

    if (!staff) {
        const error = new Error(`Không tìm thấy nhân viên với mã ID: ${staffId}`);
        error.statusCode = 404;
        throw error;
    }

    // kiểm tra xem nhân viên đã được phân công vào ca này chưa
    const existingAssignment = await prisma.phanconglamviec.findUnique({
        where: {
            manv_maca: {
                manv: staffId,
                maca: shiftId,
            },
        },
    });

    if (existingAssignment) {
        const error = new Error(
            `Nhân viên "${staff.hoten}" đã được phân công vào ca làm việc này từ trước!`,
        );
        error.statusCode = 409;
        throw error;
    }

    // kiểm tra xung đột lịch trực của nhân viên với các ca khác
    const startMinutes = getTimeInMinutes(shift.giobatdau);
    const endMinutes = getTimeInMinutes(shift.gioketthuc);
    await checkStaffConflict(staffId, shift.ngay, startMinutes, endMinutes, shiftId);

    // xác định vai trò mặc định nếu không truyền   
    let roleInShift = vaitrotrongca;
    if (!roleInShift) {
        if (staff.chucvu === "BacSi") roleInShift = SHIFT_ROLES.MAIN_DOCTOR;
        else if (staff.chucvu === "YTa") roleInShift = SHIFT_ROLES.SUPPORT_NURSE;
        else roleInShift = SHIFT_ROLES.STAFF;
    }

    // tạo bản ghi phân công
    const newAssignment = await prisma.phanconglamviec.create({
        data: {
            maca: shiftId,
            manv: staffId,
            vaitrotrongca: roleInShift,
        },
        include: {
            nhanvien: {
                select: {
                    manv: true,
                    hoten: true,
                    chucvu: true,
                    sdt: true,
                },
            },
            calamviec: {
                include: {
                    phongkham: {
                        select: {
                            maphong: true,
                            tenphong: true,
                        },
                    },
                },
            },
        },
    });

    return {
        mapclv: newAssignment.mapclv,
        maca: newAssignment.maca,
        manv: newAssignment.manv,
        vaitrotrongca: newAssignment.vaitrotrongca,
        nhanvien: newAssignment.nhanvien,
        calamviec: {
            maca: newAssignment.calamviec.maca,
            ngay: newAssignment.calamviec.ngay instanceof Date
                ? newAssignment.calamviec.ngay.toISOString().split("T")[0]
                : newAssignment.calamviec.ngay,
            giobatdau: formatTime(newAssignment.calamviec.giobatdau),
            gioketthuc: formatTime(newAssignment.calamviec.gioketthuc),
            phongkham: newAssignment.calamviec.phongkham,
        },
    };
}

// [DELETE] Hủy phân công một nhân viên khỏi ca làm việc
async function removeStaffFromShiftService(maca, manv) {
    const shiftId = Number(maca);
    const staffId = Number(manv);

    const assignment = await prisma.phanconglamviec.findFirst({
        where: {
            maca: shiftId,
            manv: staffId,
        },
        include: {
            nhanvien: {
                select: {
                    hoten: true,
                },
            },
            calamviec: {
                include: {
                    phongkham: {
                        select: {
                            tenphong: true,
                        },
                    },
                },
            },
        },
    });

    if (!assignment) {
        const error = new Error(
            `Không tìm thấy phân công của nhân viên [Mã: ${staffId}] trong ca làm việc [Mã: ${shiftId}]!`,
        );
        error.statusCode = 404;
        throw error;
    }

    await prisma.phanconglamviec.delete({
        where: {
            mapclv: assignment.mapclv,
        },
    });

    return {
        mapclv: assignment.mapclv,
        maca: shiftId,
        manv: staffId,
        hoten: assignment.nhanvien?.hoten,
        tenphong: assignment.calamviec?.phongkham?.tenphong,
    };
}

// [GET] Lấy lịch trực cá nhân của một nhân viên/bác sĩ cụ thể
async function getStaffScheduleService(manv, { fromDate, toDate } = {}) {
    const staffId = Number(manv);

    const staff = await prisma.nhanvien.findUnique({
        where: { manv: staffId },
        include: {
            bacsi: {
                include: {
                    chuyenkhoa: {
                        select: {
                            mack: true,
                            tenchuyenkhoa: true,
                        },
                    },
                },
            },
        },
    });

    if (!staff) {
        const error = new Error(`Không tìm thấy nhân viên với mã ID: ${staffId}`);
        error.statusCode = 404;
        throw error;
    }

    const whereSchedule = {
        manv: staffId,
    };

    if (fromDate || toDate) {
        whereSchedule.calamviec = {};
        if (fromDate) whereSchedule.calamviec.ngay = { gte: new Date(fromDate) };
        if (toDate) {
            whereSchedule.calamviec.ngay = {
                ...(whereSchedule.calamviec.ngay || {}),
                lte: new Date(toDate),
            };
        }
    }

    const assignments = await prisma.phanconglamviec.findMany({
        where: whereSchedule,
        include: {
            calamviec: {
                include: {
                    phongkham: {
                        include: {
                            chuyenkhoa: {
                                select: {
                                    mack: true,
                                    tenchuyenkhoa: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            calamviec: {
                ngay: "asc",
            },
        },
    });

    return {
        nhanvien: {
            manv: staff.manv,
            hoten: staff.hoten,
            chucvu: staff.chucvu,
            sdt: staff.sdt,
            bacsi: staff.bacsi
                ? {
                    mabs: staff.bacsi.mabs,
                    hocham: staff.bacsi.hocham,
                    chuyenkhoa: staff.bacsi.chuyenkhoa?.tenchuyenkhoa,
                }
                : undefined,
        },
        shifts: assignments.map((a) => ({
            mapclv: a.mapclv,
            vaitrotrongca: a.vaitrotrongca,
            calamviec: {
                maca: a.calamviec.maca,
                ngay: a.calamviec.ngay instanceof Date
                    ? a.calamviec.ngay.toISOString().split("T")[0]
                    : a.calamviec.ngay,
                giobatdau: formatTime(a.calamviec.giobatdau),
                gioketthuc: formatTime(a.calamviec.gioketthuc),
                phongkham: {
                    maphong: a.calamviec.phongkham.maphong,
                    tenphong: a.calamviec.phongkham.tenphong,
                    chuyenkhoa: a.calamviec.phongkham.chuyenkhoa?.tenchuyenkhoa,
                },
            },
        })),
    };
}

module.exports = {
    getAllShiftsService,
    getShiftByIdService,
    createShiftService,
    updateShiftService,
    deleteShiftService,
    assignStaffToShiftService,
    removeStaffFromShiftService,
    getStaffScheduleService,
};
