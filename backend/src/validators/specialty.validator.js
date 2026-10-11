


// kiểm tra ID chuyên khoa trên params (:id)

function validateSpecialtyId(req, res, next) {
    const { id } = req.params;
    const numericId = Number(id);

    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã chuyên khoa (ID) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.id = numericId;
    next();
}

// kiểm tra dữ liệu khi tạo mới chuyên khoa
function validateCreateSpecialty(req, res, next) {
    const { tenchuyenkhoa, mota } = req.body;

    // kiểm tra trường bắt buộc tenchuyenkhoa
    if (!tenchuyenkhoa || typeof tenchuyenkhoa !== "string" || tenchuyenkhoa.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Tên chuyên khoa là bắt buộc và không được để trống!",
        });
    }

    const trimmedName = tenchuyenkhoa.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Tên chuyên khoa phải có độ dài từ 2 đến 100 ký tự!",
        });
    }

    // kiểm tra mô tả (nếu có)
    if (mota !== undefined && mota !== null) {
        if (typeof mota !== "string") {
            return res.status(400).json({
                success: false,
                message: "Mô tả chuyên khoa phải là chuỗi ký tự!",
            });
        }
        if (mota.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Mô tả chuyên khoa không được vượt quá 1000 ký tự!",
            });
        }
    }

    // chuẩn hóa dữ liệu sau trim
    req.body.tenchuyenkhoa = trimmedName;
    if (typeof mota === "string") {
        req.body.mota = mota.trim();
    }

    next();
}

// kiểm tra dữ liệu khi cập nhật chuyên khoa 
function validateUpdateSpecialty(req, res, next) {
    const { tenchuyenkhoa, mota } = req.body;

    // Phải có ít nhất 1 trường cần cập nhật
    if (tenchuyenkhoa === undefined && mota === undefined) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật (tenchuyenkhoa hoặc mota)!",
        });
    }

    if (tenchuyenkhoa !== undefined) {
        if (typeof tenchuyenkhoa !== "string" || tenchuyenkhoa.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tên chuyên khoa không được để trống!",
            });
        }
        const trimmedName = tenchuyenkhoa.trim();
        if (trimmedName.length < 2 || trimmedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Tên chuyên khoa phải có độ dài từ 2 đến 100 ký tự!",
            });
        }
        req.body.tenchuyenkhoa = trimmedName;
    }

    if (mota !== undefined && mota !== null) {
        if (typeof mota !== "string") {
            return res.status(400).json({
                success: false,
                message: "Mô tả chuyên khoa phải là chuỗi ký tự!",
            });
        }
        if (mota.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Mô tả chuyên khoa không được vượt quá 1000 ký tự!",
            });
        }
        req.body.mota = mota.trim();
    }

    next();
}

// kiểm tra query parameters khi lấy danh sách
function validateSpecialtyQuery(req, res, next) {
    const { page, limit, search } = req.query;

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

    if (search !== undefined && typeof search !== "string") {
        return res.status(400).json({
            success: false,
            message: "Tham số tìm kiếm search phải là chuỗi ký tự!",
        });
    }

    next();
}

module.exports = {
    validateSpecialtyId,
    validateCreateSpecialty,
    validateUpdateSpecialty,
    validateSpecialtyQuery,
};
