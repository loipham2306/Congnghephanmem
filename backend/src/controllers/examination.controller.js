const {
    createExaminationService,
    getAllExaminationsService,
    getExaminationByIdService,
    updateExaminationService,
    addServicesToExaminationService,
    updateServiceResultService,
    removeServiceFromExaminationService,
    deleteExaminationService,
} = require("../services/examination.service");

// Tạo phiếu khám bệnh & chỉ định cận lâm sàng
async function createExaminationController(req, res, next) {
    try {
        const result = await createExaminationService(req.body, req.user);
        return res.status(201).json({
            success: true,
            message: "Tạo phiếu khám bệnh và chỉ định cận lâm sàng thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// Lấy danh sách phiếu khám bệnh
async function getAllExaminationsController(req, res, next) {
    try {
        const result = await getAllExaminationsService(req.query, req.user);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách phiếu khám bệnh thành công!",
            data: result.examinations,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
}

// Xem chi tiết thông tin một phiếu khám bệnh
async function getExaminationByIdController(req, res, next) {
    try {
        const result = await getExaminationByIdService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: "Lấy thông tin chi tiết phiếu khám bệnh thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// Cập nhật thông tin phiếu khám bệnh (chẩn đoán, triệu chứng, kết luận)
async function updateExaminationController(req, res, next) {
    try {
        const result = await updateExaminationService(req.params.id, req.body, req.user);
        return res.status(200).json({
            success: true,
            message: "Cập nhật phiếu khám bệnh thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// Chỉ định bổ sung danh sách dịch vụ cận lâm sàng
async function addServicesToExaminationController(req, res, next) {
    try {
        const result = await addServicesToExaminationService(req.params.id, req.body.services, req.user);
        return res.status(200).json({
            success: true,
            message: "Chỉ định bổ sung dịch vụ cận lâm sàng thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// Cập nhật kết quả cận lâm sàng
async function updateServiceResultController(req, res, next) {
    try {
        const result = await updateServiceResultService(
            req.params.id,
            req.params.detailId,
            req.body.ketqua,
            req.user
        );
        return res.status(200).json({
            success: true,
            message: "Cập nhật kết quả cận lâm sàng thành công!",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// Hủy một chỉ định cận lâm sàng khỏi phiếu khám
async function removeServiceFromExaminationController(req, res, next) {
    try {
        const result = await removeServiceFromExaminationService(
            req.params.id,
            req.params.detailId,
            req.user
        );
        return res.status(200).json({
            success: true,
            message: `Hủy chỉ định dịch vụ \"${result.tendichvu}\" thành công!`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

// Xóa phiếu khám bệnh (Safe Delete Guard)
async function deleteExaminationController(req, res, next) {
    try {
        const result = await deleteExaminationService(req.params.id, req.user);
        return res.status(200).json({
            success: true,
            message: `Xóa phiếu khám bệnh #${result.malsk} thành công!`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createExaminationController,
    getAllExaminationsController,
    getExaminationByIdController,
    updateExaminationController,
    addServicesToExaminationController,
    updateServiceResultController,
    removeServiceFromExaminationController,
    deleteExaminationController,
};
