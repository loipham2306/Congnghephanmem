const { VALID_ROOM_STATUSES, ROOM_STATUS } = require("../constants/room.constant");


//kiểm tra ID phòng khám trên params (:id)

function validateRoomId(req, res, next) {
    const { id } = req.params;
    const numericId = Number(id);

    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã phòng khám (ID) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.id = numericId;
    next();
}

//kiểm tra các tham số query khi lọc danh sách phòng khám

function validateRoomQuery(req, res, next) {
    const { specialtyId, status, search, page, limit } = req.query;

    if (specialtyId !== undefined) {
        const specId = Number(specialtyId);
        if (!Number.isInteger(specId) || specId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số specialtyId phải là số nguyên dương!",
            });
        }
    }

    if (status !== undefined) {
        if (!VALID_ROOM_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái phòng khám không hợp lệ! Chỉ chấp nhận: ${VALID_ROOM_STATUSES.join(", ")}`,
            });
        }
    }

    if (search !== undefined && typeof search !== "string") {
        return res.status(400).json({
            success: false,
            message: "Tham số tìm kiếm search phải là chuỗi ký tự!",
        });
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

//kiểm tra dữ liệu khi tạo mới phòng khám

function validateCreateRoom(req, res, next) {
    const { tenphong, mack, trangthai } = req.body;

    // Kiểm tra tên phòng
    if (!tenphong || typeof tenphong !== "string" || tenphong.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Tên phòng khám là bắt buộc và không được để trống!",
        });
    }

    const trimmedName = tenphong.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
        return res.status(400).json({
            success: false,
            message: "Tên phòng khám phải có độ dài từ 2 đến 50 ký tự!",
        });
    }

    // Kiểm tra mã chuyên khoa (mack)
    const numMack = Number(mack);
    if (!mack || !Number.isInteger(numMack) || numMack <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã chuyên khoa (mack) là bắt buộc và phải là số nguyên dương!",
        });
    }

    // Kiểm tra trạng thái (nếu có truyền)
    let finalStatus = ROOM_STATUS.READY;
    if (trangthai !== undefined && trangthai !== null) {
        if (!VALID_ROOM_STATUSES.includes(trangthai)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái phòng khám không hợp lệ! Chỉ chấp nhận: ${VALID_ROOM_STATUSES.join(", ")}`,
            });
        }
        finalStatus = trangthai;
    }

    req.body.tenphong = trimmedName;
    req.body.mack = numMack;
    req.body.trangthai = finalStatus;

    next();
}

//kiểm tra dữ liệu khi cập nhật phòng khám

function validateUpdateRoom(req, res, next) {
    const { tenphong, mack, trangthai } = req.body;

    // Phải có ít nhất một trường dữ liệu gửi lên
    if (tenphong === undefined && mack === undefined && trangthai === undefined) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật (tenphong, mack, hoặc trangthai)!",
        });
    }

    if (tenphong !== undefined) {
        if (typeof tenphong !== "string" || tenphong.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tên phòng khám không được để trống!",
            });
        }
        const trimmedName = tenphong.trim();
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Tên phòng khám phải có độ dài từ 2 đến 50 ký tự!",
            });
        }
        req.body.tenphong = trimmedName;
    }

    if (mack !== undefined) {
        const numMack = Number(mack);
        if (!Number.isInteger(numMack) || numMack <= 0) {
            return res.status(400).json({
                success: false,
                message: "Mã chuyên khoa (mack) phải là số nguyên dương!",
            });
        }
        req.body.mack = numMack;
    }

    if (trangthai !== undefined) {
        if (!VALID_ROOM_STATUSES.includes(trangthai)) {
            return res.status(400).json({
                success: false,
                message: `Trạng thái phòng khám không hợp lệ! Chỉ chấp nhận: ${VALID_ROOM_STATUSES.join(", ")}`,
            });
        }
    }

    next();
}

module.exports = {
    validateRoomId,
    validateRoomQuery,
    validateCreateRoom,
    validateUpdateRoom,
};
