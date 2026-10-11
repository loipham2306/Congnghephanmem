const {
    getAllServicesService,
    getServiceByIdService,
    createServiceService,
    updateServiceService,
    deleteServiceService,
} = require("../services/service.service");

// [GET] /api/services
// Lấy danh sách dịch vụ (hỗ trợ lọc chuyên khoa, khoảng giá, tìm kiếm và phân trang)
async function getAllServicesController(req, res, next) {
    try {
        const { specialtyId, search, minPrice, maxPrice, page, limit } = req.query;
        const result = await getAllServicesService({
            specialtyId,
            search,
            minPrice,
            maxPrice,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách dịch vụ thành công!",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// [GET] /api/services/:id
// Lấy chi tiết thông tin một dịch vụ theo ID
async function getServiceByIdController(req, res, next) {
    try {
        const { id } = req.params;
        const service = await getServiceByIdService(id);

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin chi tiết dịch vụ thành công!",
            data: service,
        });
    } catch (error) {
        return next(error);
    }
}

// [POST] /api/services
// Thêm mới một dịch vụ (Admin)
async function createServiceController(req, res, next) {
    try {
        const newService = await createServiceService(req.body);

        return res.status(201).json({
            success: true,
            message: "Thêm mới dịch vụ thành công!",
            data: newService,
        });
    } catch (error) {
        return next(error);
    }
}

// [PUT] /api/services/:id
// Cập nhật thông tin dịch vụ (Admin)
async function updateServiceController(req, res, next) {
    try {
        const { id } = req.params;
        const updatedService = await updateServiceService(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin dịch vụ thành công!",
            data: updatedService,
        });
    } catch (error) {
        return next(error);
    }
}

// [DELETE] /api/services/:id
// Xóa một dịch vụ khỏi hệ thống (Admin)
async function deleteServiceController(req, res, next) {
    try {
        const { id } = req.params;
        const result = await deleteServiceService(id);

        return res.status(200).json({
            success: true,
            message: `Xóa dịch vụ "${result.tendichvu}" thành công!`,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getAllServicesController,
    getServiceByIdController,
    createServiceController,
    updateServiceController,
    deleteServiceController,
};
