// Kiểm tra ID phiếu khám trên params (:id)
function validateExaminationId(req, res, next) {
    const { id } = req.params;
    const numericId = Number(id);

    if (!id || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã phiếu khám bệnh (ID) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.id = numericId;
    next();
}

// Kiểm tra ID chi tiết dịch vụ cận lâm sàng trên params (:detailId)
function validateDetailIdParam(req, res, next) {
    const { detailId } = req.params;
    const numericId = Number(detailId);

    if (!detailId || !Number.isInteger(numericId) || numericId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã chi tiết dịch vụ cận lâm sàng (detailId) không hợp lệ! Phải là số nguyên dương.",
        });
    }

    req.params.detailId = numericId;
    next();
}

// Kiểm tra query parameters khi lọc danh sách phiếu khám
function validateExaminationQuery(req, res, next) {
    const { mabn, mabs, fromDate, toDate, search, page, limit } = req.query;

    if (mabn !== undefined) {
        const numMabn = Number(mabn);
        if (!Number.isInteger(numMabn) || numMabn <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số mabn phải là số nguyên dương!",
            });
        }
        req.query.mabn = numMabn;
    }

    if (mabs !== undefined) {
        const numMabs = Number(mabs);
        if (!Number.isInteger(numMabs) || numMabs <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số mabs phải là số nguyên dương!",
            });
        }
        req.query.mabs = numMabs;
    }

    if (fromDate !== undefined) {
        const parsedFrom = new Date(fromDate);
        if (isNaN(parsedFrom.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số fromDate không đúng định dạng ngày hợp lệ (YYYY-MM-DD)!",
            });
        }
    }

    if (toDate !== undefined) {
        const parsedTo = new Date(toDate);
        if (isNaN(parsedTo.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Tham số toDate không đúng định dạng ngày hợp lệ (YYYY-MM-DD)!",
            });
        }
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        return res.status(400).json({
            success: false,
            message: "fromDate không được lớn hơn toDate!",
        });
    }

    if (search !== undefined) {
        if (typeof search !== "string") {
            return res.status(400).json({
                success: false,
                message: "Tham số tìm kiếm search phải là chuỗi ký tự!",
            });
        }
        req.query.search = search.trim();
    }

    if (page !== undefined) {
        const pageNum = Number(page);
        if (!Number.isInteger(pageNum) || pageNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Tham số page phải là số nguyên dương lớn hơn 0!",
            });
        }
        req.query.page = pageNum;
    }

    if (limit !== undefined) {
        const limitNum = Number(limit);
        if (!Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Tham số limit phải là số nguyên dương từ 1 đến 100!",
            });
        }
        req.query.limit = limitNum;
    }

    next();
}

// Kiểm tra dữ liệu khi tạo mới phiếu khám bệnh & chỉ định cận lâm sàng
function validateCreateExamination(req, res, next) {
    const { mabn, mabs, malh, trieuchung, chandoan, ketluan, services } = req.body;

    // Kiểm tra mabn (Bắt buộc)
    const numMabn = Number(mabn);
    if (!mabn || !Number.isInteger(numMabn) || numMabn <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã bệnh nhân (mabn) là bắt buộc và phải là số nguyên dương!",
        });
    }
    req.body.mabn = numMabn;

    // Kiểm tra mabs (Nếu có gửi lên, áp dụng khi Admin chỉ định bác sĩ)
    if (mabs !== undefined && mabs !== null) {
        const numMabs = Number(mabs);
        if (!Number.isInteger(numMabs) || numMabs <= 0) {
            return res.status(400).json({
                success: false,
                message: "Mã bác sĩ (mabs) phải là số nguyên dương!",
            });
        }
        req.body.mabs = numMabs;
    }

    // Kiểm tra malh (Nếu có liên kết lịch hẹn)
    if (malh !== undefined && malh !== null) {
        const numMalh = Number(malh);
        if (!Number.isInteger(numMalh) || numMalh <= 0) {
            return res.status(400).json({
                success: false,
                message: "Mã lịch hẹn (malh) phải là số nguyên dương!",
            });
        }
        req.body.malh = numMalh;
    }

    // Kiểm tra triệu chứng (nếu có)
    if (trieuchung !== undefined && trieuchung !== null) {
        if (typeof trieuchung !== "string") {
            return res.status(400).json({
                success: false,
                message: "Triệu chứng khám bệnh phải là chuỗi ký tự!",
            });
        }
        if (trieuchung.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Triệu chứng không được vượt quá 1000 ký tự!",
            });
        }
        req.body.trieuchung = trieuchung.trim();
    }

    // Kiểm tra chẩn đoán (nếu có)
    if (chandoan !== undefined && chandoan !== null) {
        if (typeof chandoan !== "string") {
            return res.status(400).json({
                success: false,
                message: "Chẩn đoán bệnh phải là chuỗi ký tự!",
            });
        }
        if (chandoan.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Chẩn đoán không được vượt quá 1000 ký tự!",
            });
        }
        req.body.chandoan = chandoan.trim();
    }

    // Kiểm tra kết luận (nếu có)
    if (ketluan !== undefined && ketluan !== null) {
        if (typeof ketluan !== "string") {
            return res.status(400).json({
                success: false,
                message: "Kết luận/lời dặn phải là chuỗi ký tự!",
            });
        }
        if (ketluan.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Kết luận không được vượt quá 1000 ký tự!",
            });
        }
        req.body.ketluan = ketluan.trim();
    }

    // Kiểm tra danh sách dịch vụ cận lâm sàng (nếu có)
    if (services !== undefined && services !== null) {
        if (!Array.isArray(services)) {
            return res.status(400).json({
                success: false,
                message: "Danh sách chỉ định cận lâm sàng (services) phải là một mảng!",
            });
        }

        for (let i = 0; i < services.length; i++) {
            const item = services[i];
            if (!item || typeof item !== "object") {
                return res.status(400).json({
                    success: false,
                    message: `Dịch vụ chỉ định tại vị trí ${i + 1} không hợp lệ!`,
                });
            }

            const numMadv = Number(item.madv);
            if (!item.madv || !Number.isInteger(numMadv) || numMadv <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Mã dịch vụ (madv) tại vị trí ${i + 1} phải là số nguyên dương!`,
                });
            }
            item.madv = numMadv;

            if (item.soluong !== undefined && item.soluong !== null) {
                const numQty = Number(item.soluong);
                if (!Number.isInteger(numQty) || numQty <= 0 || numQty > 50) {
                    return res.status(400).json({
                        success: false,
                        message: `Số lượng dịch vụ tại vị trí ${i + 1} phải là số nguyên từ 1 đến 50!`,
                    });
                }
                item.soluong = numQty;
            } else {
                item.soluong = 1;
            }

            if (item.ketqua !== undefined && item.ketqua !== null) {
                if (typeof item.ketqua !== "string") {
                    return res.status(400).json({
                        success: false,
                        message: `Kết quả dịch vụ tại vị trí ${i + 1} phải là chuỗi ký tự!`,
                    });
                }
                item.ketqua = item.ketqua.trim();
            }
        }
    }

    next();
}

// Kiểm tra dữ liệu khi cập nhật phiếu khám
function validateUpdateExamination(req, res, next) {
    const { trieuchung, chandoan, ketluan } = req.body;

    if (trieuchung === undefined && chandoan === undefined && ketluan === undefined) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật (trieuchung, chandoan, hoặc ketluan)!",
        });
    }

    if (trieuchung !== undefined && trieuchung !== null) {
        if (typeof trieuchung !== "string") {
            return res.status(400).json({
                success: false,
                message: "Triệu chứng khám bệnh phải là chuỗi ký tự!",
            });
        }
        if (trieuchung.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Triệu chứng không được vượt quá 1000 ký tự!",
            });
        }
        req.body.trieuchung = trieuchung.trim();
    }

    if (chandoan !== undefined && chandoan !== null) {
        if (typeof chandoan !== "string") {
            return res.status(400).json({
                success: false,
                message: "Chẩn đoán bệnh phải là chuỗi ký tự!",
            });
        }
        if (chandoan.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Chẩn đoán không được vượt quá 1000 ký tự!",
            });
        }
        req.body.chandoan = chandoan.trim();
    }

    if (ketluan !== undefined && ketluan !== null) {
        if (typeof ketluan !== "string") {
            return res.status(400).json({
                success: false,
                message: "Kết luận/lời dặn phải là chuỗi ký tự!",
            });
        }
        if (ketluan.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Kết luận không được vượt quá 1000 ký tự!",
            });
        }
        req.body.ketluan = ketluan.trim();
    }

    next();
}

// Kiểm tra dữ liệu khi chỉ định bổ sung danh sách dịch vụ cận lâm sàng
function validateAddServices(req, res, next) {
    const { services } = req.body;

    if (!services || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Danh sách chỉ định cận lâm sàng (services) phải là mảng chứa ít nhất một dịch vụ!",
        });
    }

    for (let i = 0; i < services.length; i++) {
        const item = services[i];
        if (!item || typeof item !== "object") {
            return res.status(400).json({
                success: false,
                message: `Dịch vụ tại vị trí ${i + 1} không hợp lệ!`,
            });
        }

        const numMadv = Number(item.madv);
        if (!item.madv || !Number.isInteger(numMadv) || numMadv <= 0) {
            return res.status(400).json({
                success: false,
                message: `Mã dịch vụ (madv) tại vị trí ${i + 1} phải là số nguyên dương!`,
            });
        }
        item.madv = numMadv;

        if (item.soluong !== undefined && item.soluong !== null) {
            const numQty = Number(item.soluong);
            if (!Number.isInteger(numQty) || numQty <= 0 || numQty > 50) {
                return res.status(400).json({
                    success: false,
                    message: `Số lượng dịch vụ tại vị trí ${i + 1} phải là số nguyên từ 1 đến 50!`,
                });
            }
            item.soluong = numQty;
        } else {
            item.soluong = 1;
        }
    }

    next();
}

// Kiểm tra dữ liệu khi cập nhật kết quả cận lâm sàng
function validateUpdateServiceResult(req, res, next) {
    const { ketqua } = req.body;

    if (!ketqua || typeof ketqua !== "string" || ketqua.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Kết quả cận lâm sàng (ketqua) là bắt buộc và không được để trống!",
        });
    }

    if (ketqua.trim().length > 2000) {
        return res.status(400).json({
            success: false,
            message: "Kết quả cận lâm sàng không được vượt quá 2000 ký tự!",
        });
    }

    req.body.ketqua = ketqua.trim();
    next();
}

module.exports = {
    validateExaminationId,
    validateDetailIdParam,
    validateExaminationQuery,
    validateCreateExamination,
    validateUpdateExamination,
    validateAddServices,
    validateUpdateServiceResult,
};
