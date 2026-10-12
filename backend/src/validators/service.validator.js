// kiểm tra ID dịch vụ trên params (:id)
function validateServiceId(req, res, next) {
    const { id } = req.params;
    const numericId = Number(id);

    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã dịch vụ (ID) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.id = numericId;
    next();
}

// kiểm tra các tham số query khi lọc danh sách dịch vụ
function validateServiceQuery(req, res, next) {
    const { specialtyId, search, minPrice, maxPrice, page, limit } = req.query;

    if (specialtyId !== undefined) {
        const specId = Number(specialtyId);
        if (!Number.isInteger(specId) || specId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số specialtyId phải là số nguyên dương!",
            });
        }
    }

    if (search !== undefined && typeof search !== "string") {
        return res.status(400).json({
            success: false,
            message: "Tham số tìm kiếm search phải là chuỗi ký tự!",
        });
    }

    if (minPrice !== undefined) {
        const min = Number(minPrice);
        if (isNaN(min) || min < 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số minPrice phải là số không âm!",
            });
        }
    }

    if (maxPrice !== undefined) {
        const max = Number(maxPrice);
        if (isNaN(max) || max < 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số maxPrice phải là số không âm!",
            });
        }
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
        if (Number(minPrice) > Number(maxPrice)) {
            return res.status(400).json({
                success: false,
                message: "Giá trị minPrice không được lớn hơn maxPrice!",
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

// kiểm tra dữ liệu khi tạo mới dịch vụ
function validateCreateService(req, res, next) {
    const { tendichvu, dongia, mack } = req.body;

    // 1. Kiểm tra tên dịch vụ
    if (!tendichvu || typeof tendichvu !== "string" || tendichvu.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Tên dịch vụ là bắt buộc và không được để trống!",
        });
    }

    const trimmedName = tendichvu.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
        return res.status(400).json({
            success: false,
            message: "Tên dịch vụ phải có độ dài từ 2 đến 100 ký tự!",
        });
    }

    // 2. Kiểm tra đơn giá
    if (dongia === undefined || dongia === null) {
        return res.status(400).json({
            success: false,
            message: "Đơn giá dịch vụ là bắt buộc!",
        });
    }

    const price = Number(dongia);
    if (isNaN(price) || price < 0) {
        return res.status(400).json({
            success: false,
            message: "Đơn giá dịch vụ phải là số lớn hơn hoặc bằng 0!",
        });
    }

    // 3. Kiểm tra mã chuyên khoa (nếu có)
    let numMack = null;
    if (mack !== undefined && mack !== null && mack !== "") {
        numMack = Number(mack);
        if (!Number.isInteger(numMack) || numMack <= 0) {
            return res.status(400).json({
                success: false,
                message: "Mã chuyên khoa (mack) phải là số nguyên dương!",
            });
        }
    }

    req.body.tendichvu = trimmedName;
    req.body.dongia = price;
    req.body.mack = numMack;

    next();
}

// kiểm tra dữ liệu khi cập nhật dịch vụ
function validateUpdateService(req, res, next) {
    const { tendichvu, dongia, mack } = req.body;

    // Phải có ít nhất 1 trường cần cập nhật
    if (tendichvu === undefined && dongia === undefined && mack === undefined) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật (tendichvu, dongia, hoặc mack)!",
        });
    }

    if (tendichvu !== undefined) {
        if (typeof tendichvu !== "string" || tendichvu.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tên dịch vụ không được để trống!",
            });
        }
        const trimmedName = tendichvu.trim();
        if (trimmedName.length < 2 || trimmedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Tên dịch vụ phải có độ dài từ 2 đến 100 ký tự!",
            });
        }
        req.body.tendichvu = trimmedName;
    }

    if (dongia !== undefined) {
        const price = Number(dongia);
        if (isNaN(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Đơn giá dịch vụ phải là số lớn hơn hoặc bằng 0!",
            });
        }
        req.body.dongia = price;
    }

    if (mack !== undefined && mack !== null && mack !== "") {
        const numMack = Number(mack);
        if (!Number.isInteger(numMack) || numMack <= 0) {
            return res.status(400).json({
                success: false,
                message: "Mã chuyên khoa (mack) phải là số nguyên dương!",
            });
        }
        req.body.mack = numMack;
    }

    next();
}

module.exports = {
    validateServiceId,
    validateServiceQuery,
    validateCreateService,
    validateUpdateService,
};
