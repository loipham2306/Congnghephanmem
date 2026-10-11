const {
    getAllSpecialtiesService,
    getSpecialtyByIdService,
    createSpecialtyService,
    updateSpecialtyService,
    deleteSpecialtyService,
} = require("../services/specialty.service");

// lấy danh sách chuyên khoa
async function getAllSpecialtiesController(req, res, next) {
    try {
        const { search, page, limit, includeCounts } = req.query;
        const result = await getAllSpecialtiesService({
            search,
            page,
            limit,
            includeCounts,
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách chuyên khoa thành công!",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// lấy thông tin chuyên khoa theo id
async function getSpecialtyByIdController(req, res, next) {
    try {
        const { id } = req.params;
        const specialty = await getSpecialtyByIdService(id);

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin chi tiết chuyên khoa thành công!",
            data: specialty,
        });
    } catch (error) {
        return next(error);
    }
}

// admin thêm mới một chuyên khoa
async function createSpecialtyController(req, res, next) {
    try {
        const { tenchuyenkhoa, mota } = req.body;
        const newSpecialty = await createSpecialtyService({
            tenchuyenkhoa,
            mota,
        });

        return res.status(201).json({
            success: true,
            message: "Thêm mới chuyên khoa thành công!",
            data: newSpecialty,
        });
    } catch (error) {
        return next(error);
    }
}

// admin cập nhật thông tin của chuyên khoa
async function updateSpecialtyController(req, res, next) {
    try {
        const { id } = req.params;
        const updatedSpecialty = await updateSpecialtyService(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin chuyên khoa thành công!",
            data: updatedSpecialty,
        });
    } catch (error) {
        return next(error);
    }
}

// admin xóa 1 chuyên khoa
async function deleteSpecialtyController(req, res, next) {
    try {
        const { id } = req.params;
        const result = await deleteSpecialtyService(id);

        return res.status(200).json({
            success: true,
            message: `Xóa chuyên khoa "${result.tenchuyenkhoa}" thành công!`,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getAllSpecialtiesController,
    getSpecialtyByIdController,
    createSpecialtyController,
    updateSpecialtyController,
    deleteSpecialtyController,
};
