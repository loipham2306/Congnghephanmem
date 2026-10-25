const {
    TIME_REGEX,
    DATE_REGEX,
    getTimeInMinutes,
} = require("../constants/shift.constant");

/**
 * Kiểm tra ID ca làm việc trên params (:id)
 */
function validateShiftId(req, res, next) {
    const { id } = req.params;
    const numericId = Number(id);

    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã ca làm việc (ID) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.id = numericId;
    next();
}

/**
 * Kiểm tra mã nhân viên trên params (:staffId)
 */
function validateStaffIdParam(req, res, next) {
    const { staffId } = req.params;
    const numericId = Number(staffId);

    if (!staffId || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã nhân viên (staffId) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.staffId = numericId;
    next();
}

/**
 * Kiểm tra các tham số query khi lọc danh sách ca làm việc
 */
function validateShiftQuery(req, res, next) {
    const { date, fromDate, toDate, roomId, staffId, specialtyId, page, limit } = req.query;

    if (date !== undefined) {
        if (!DATE_REGEX.test(date) || isNaN(new Date(date).getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số date không hợp lệ! Vui lòng dùng định dạng YYYY-MM-DD.",
            });
        }
    }

    if (fromDate !== undefined) {
        if (!DATE_REGEX.test(fromDate) || isNaN(new Date(fromDate).getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số fromDate không hợp lệ! Vui lòng dùng định dạng YYYY-MM-DD.",
            });
        }
    }

    if (toDate !== undefined) {
        if (!DATE_REGEX.test(toDate) || isNaN(new Date(toDate).getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số toDate không hợp lệ! Vui lòng dùng định dạng YYYY-MM-DD.",
            });
        }
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        return res.status(400).json({
            success: false,
            message: "Khoảng thời gian không hợp lệ: fromDate không được lớn hơn toDate!",
        });
    }

    if (roomId !== undefined) {
        const rId = Number(roomId);
        if (!Number.isInteger(rId) || rId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số roomId phải là số nguyên dương!",
            });
        }
    }

    if (staffId !== undefined) {
        const sId = Number(staffId);
        if (!Number.isInteger(sId) || sId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số staffId phải là số nguyên dương!",
            });
        }
    }

    if (specialtyId !== undefined) {
        const spId = Number(specialtyId);
        if (!Number.isInteger(spId) || spId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số specialtyId phải là số nguyên dương!",
            });
        }
    }

    if (page !== undefined) {
        const pageNum = Number(page);
        if (!Number.isInteger(pageNum) || pageNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số page phải là số nguyên dương lớn hơn 0!",
            });
        }
    }

    if (limit !== undefined) {
        const limitNum = Number(limit);
        if (!Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Tham số limit phải là số nguyên dương từ 1 đến 100!",
            });
        }
    }

    next();
}

/**
 * Kiểm tra dữ liệu khi tạo mới ca làm việc
 */
function validateCreateShift(req, res, next) {
    const { ngay, giobatdau, gioketthuc, maphong, assignments } = req.body;

    // Kiểm tra ngày làm việc
    if (!ngay || typeof ngay !== "string" || !DATE_REGEX.test(ngay) || isNaN(new Date(ngay).getTime())) {
        return res.status(400).json({
            success: false,
            message: "Ngày làm việc (ngay) là bắt buộc và phải có định dạng YYYY-MM-DD hợp lệ!",
        });
    }

    // Kiểm tra giờ bắt đầu
    if (!giobatdau || typeof giobatdau !== "string" || !TIME_REGEX.test(giobatdau)) {
        return res.status(400).json({
            success: false,
            message: "Giờ bắt đầu (giobatdau) là bắt buộc và phải có định dạng HH:mm hoặc HH:mm:ss!",
        });
    }

    // Kiểm tra giờ kết thúc
    if (!gioketthuc || typeof gioketthuc !== "string" || !TIME_REGEX.test(gioketthuc)) {
        return res.status(400).json({
            success: false,
            message: "Giờ kết thúc (gioketthuc) là bắt buộc và phải có định dạng HH:mm hoặc HH:mm:ss!",
        });
    }

    // Kiểm tra giờ kết thúc phải lớn hơn giờ bắt đầu
    const startMinutes = getTimeInMinutes(giobatdau);
    const endMinutes = getTimeInMinutes(gioketthuc);

    if (endMinutes <= startMinutes) {
        return res.status(400).json({
            success: false,
            message: "Giờ kết thúc ca làm việc phải lớn hơn giờ bắt đầu!",
        });
    }

    // Kiểm tra mã phòng khám
    const numRoom = Number(maphong);
    if (!maphong || !Number.isInteger(numRoom) || numRoom <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã phòng khám (maphong) là bắt buộc và phải là số nguyên dương!",
        });
    }

    // Kiểm tra danh sách phân công nhân viên nếu có gửi kèm
    if (assignments !== undefined) {
        if (!Array.isArray(assignments)) {
            return res.status(400).json({
                success: false,
                message: "Trường assignments phải là một mảng danh sách phân công nhân sự!",
            });
        }

        const seenStaff = new Set();
        for (let i = 0; i < assignments.length; i++) {
            const item = assignments[i];
            const manv = Number(item.manv);

            if (!item.manv || !Number.isInteger(manv) || manv <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Phân công thứ [${i + 1}]: Mã nhân viên (manv) không hợp lệ!`,
                });
            }

            if (seenStaff.has(manv)) {
                return res.status(400).json({
                    success: false,
                    message: `Mã nhân viên [${manv}] bị phân công trùng lặp nhiều lần trong cùng một ca!`,
                });
            }
            seenStaff.add(manv);

            if (item.vaitrotrongca !== undefined && typeof item.vaitrotrongca !== "string") {
                return res.status(400).json({
                    success: false,
                    message: `Phân công thứ [${i + 1}]: Vai trò trong ca phải là chuỗi ký tự!`,
                });
            }
        }
    }

    req.body.ngay = ngay.trim();
    req.body.giobatdau = giobatdau.trim();
    req.body.gioketthuc = gioketthuc.trim();
    req.body.maphong = numRoom;

    next();
}

/**
 * Kiểm tra dữ liệu khi cập nhật thông tin ca làm việc
 */
function validateUpdateShift(req, res, next) {
    const { ngay, giobatdau, gioketthuc, maphong } = req.body;

    if (ngay === undefined && giobatdau === undefined && gioketthuc === undefined && maphong === undefined) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật (ngay, giobatdau, gioketthuc, hoặc maphong)!",
        });
    }

    if (ngay !== undefined) {
        if (typeof ngay !== "string" || !DATE_REGEX.test(ngay) || isNaN(new Date(ngay).getTime())) {
            return res.status(400).json({
                success: false,
                message: "Ngày làm việc (ngay) phải có định dạng YYYY-MM-DD hợp lệ!",
            });
        }
        req.body.ngay = ngay.trim();
    }

    if (giobatdau !== undefined) {
        if (typeof giobatdau !== "string" || !TIME_REGEX.test(giobatdau)) {
            return res.status(400).json({
                success: false,
                message: "Giờ bắt đầu (giobatdau) phải có định dạng HH:mm hoặc HH:mm:ss!",
            });
        }
        req.body.giobatdau = giobatdau.trim();
    }

    if (gioketthuc !== undefined) {
        if (typeof gioketthuc !== "string" || !TIME_REGEX.test(gioketthuc)) {
            return res.status(400).json({
                success: false,
                message: "Giờ kết thúc (gioketthuc) phải có định dạng HH:mm hoặc HH:mm:ss!",
            });
        }
        req.body.gioketthuc = gioketthuc.trim();
    }

    // Nếu cập nhật cả 2 giờ cùng lúc
    if (req.body.giobatdau && req.body.gioketthuc) {
        const startMinutes = getTimeInMinutes(req.body.giobatdau);
        const endMinutes = getTimeInMinutes(req.body.gioketthuc);

        if (endMinutes <= startMinutes) {
            return res.status(400).json({
                success: false,
                message: "Giờ kết thúc ca làm việc phải lớn hơn giờ bắt đầu!",
            });
        }
    }

    if (maphong !== undefined) {
        const numRoom = Number(maphong);
        if (!Number.isInteger(numRoom) || numRoom <= 0) {
            return res.status(400).json({
                success: false,
                message: "Mã phòng khám (maphong) phải là số nguyên dương!",
            });
        }
        req.body.maphong = numRoom;
    }

    next();
}

/**
 * Kiểm tra dữ liệu khi phân công nhân viên vào ca
 */
function validateAssignStaff(req, res, next) {
    const { manv, vaitrotrongca } = req.body;

    const numManv = Number(manv);
    if (!manv || !Number.isInteger(numManv) || numManv <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã nhân viên (manv) là bắt buộc và phải là số nguyên dương!",
        });
    }

    if (vaitrotrongca !== undefined && vaitrotrongca !== null) {
        if (typeof vaitrotrongca !== "string" || vaitrotrongca.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vai trò trong ca (vaitrotrongca) không được để khoảng trắng!",
            });
        }
        const trimmedRole = vaitrotrongca.trim();
        if (trimmedRole.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Vai trò trong ca không được vượt quá 50 ký tự!",
            });
        }
        req.body.vaitrotrongca = trimmedRole;
    }

    req.body.manv = numManv;
    next();
}

module.exports = {
    validateShiftId,
    validateStaffIdParam,
    validateShiftQuery,
    validateCreateShift,
    validateUpdateShift,
    validateAssignStaff,
};
