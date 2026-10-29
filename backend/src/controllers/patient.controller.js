const {
    createPatientService,
    getMyProfileService,
    getMyMedicalRecordService,
    updateMyMedicalRecordService,
    getMyMedicalHistoryService,
    getMyMedicalHistoryDetailService,
    updateMyProfileService,
    getPatientMedicalRecordByIdService,
    updatePatientMedicalRecordByIdService,
    getAllPatientsService,
    deletePatientByIdService,
    deleteMyAccountService,
    resetMyMedicalRecordService,
} = require("../services/patient.service");
const { getClientIp } = require("../utils/audit");


// 0. Lễ tân tạo hồ sơ bệnh nhân vãng lai tại quầy
async function createPatientController(req, res, next) {
    try {
        const patient = await createPatientService(
            req.body,
            req.user,
            getClientIp(req),
        );
        return res.status(201).json({
            success: true,
            message: "Tạo hồ sơ bệnh nhân thành công",
            data: patient,
        });
    } catch (error) {
        return next(error);
    }
}

// 1. Xem thông tin cá nhân của Bệnh nhân
async function getMyProfileController(req, res, next) {
    try {
        const patient = await getMyProfileService(req.user.matk);
        return res.status(200).json({
            success: true,
            message: "Lấy thông tin cá nhân thành công",
            data: patient,
        });
    } catch (error) {
        return next(error);
    }
}

// 2. Cập nhật thông tin cá nhân của Bệnh nhân
async function updateMyProfileController(req, res, next) {
    try {
        const updatedPatient = await updateMyProfileService(
            req.user.matk,
            req.body,
        );
        return res.status(200).json({
            success: true,
            message: "Cập nhật hồ sơ thành công",
            data: updatedPatient,
        });
    } catch (error) {
        return next(error);
    }
}

// 3. Xem hồ sơ bệnh án & tiền sử bệnh của Bệnh nhân
async function getMyMedicalRecordController(req, res, next) {
    try {
        const medicalRecord = await getMyMedicalRecordService(req.user.matk);
        return res.status(200).json({
            success: true,
            message: "Lấy hồ sơ bệnh án thành công",
            data: medicalRecord,
        });
    } catch (error) {
        return next(error);
    }
}

// 4. Cập nhật hồ sơ bệnh án & tiền sử bệnh của Bệnh nhân
async function updateMyMedicalRecordController(req, res, next) {
    try {
        const updatedRecord = await updateMyMedicalRecordService(
            req.user.matk,
            req.body,
        );
        return res.status(200).json({
            success: true,
            message: "Cập nhật hồ sơ bệnh án thành công",
            data: updatedRecord,
        });
    } catch (error) {
        return next(error);
    }
}

// 5. Lấy danh sách lịch sử các lần khám bệnh
async function getMyMedicalHistoryController(req, res, next) {
    try {
        const medicalHistory = await getMyMedicalHistoryService(req.user.matk);
        return res.status(200).json({
            success: true,
            message: "Lấy lịch sử khám thành công",
            data: medicalHistory,
        });
    } catch (error) {
        return next(error);
    }
}

// 6. Lấy chi tiết 1 lần khám bệnh cụ thể
async function getMyMedicalHistoryDetailController(req, res, next) {
    try {
        const record = await getMyMedicalHistoryDetailService(
            req.user.matk,
            req.params.id,
        );
        return res.status(200).json({
            success: true,
            message: "Lấy chi tiết lần khám bệnh thành công",
            data: record,
        });
    } catch (error) {
        return next(error);
    }
}

// 7. Dành cho Bác sĩ & Admin: Tra cứu hồ sơ bệnh án của bệnh nhân theo ID (mabn)
async function getPatientMedicalRecordByIdController(req, res, next) {
    try {
        const record = await getPatientMedicalRecordByIdService(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Tra cứu hồ sơ bệnh án bệnh nhân thành công",
            data: record,
        });
    } catch (error) {
        return next(error);
    }
}

// 8. Dành cho Bác sĩ & Admin: Cập nhật hồ sơ bệnh án của bệnh nhân theo ID (mabn)
async function updatePatientMedicalRecordByIdController(req, res, next) {
    try {
        const updatedRecord = await updatePatientMedicalRecordByIdService(
            req.params.id,
            req.body,
        );
        return res.status(200).json({
            success: true,
            message: "Cập nhật hồ sơ bệnh án bệnh nhân thành công",
            data: updatedRecord,
        });
    } catch (error) {
        return next(error);
    }
}

// 9. Dành cho Admin & Lễ tân: Lấy danh sách bệnh nhân (tìm kiếm, lọc, phân trang)
async function getAllPatientsController(req, res, next) {
    try {
        const result = await getAllPatientsService(req.query);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách bệnh nhân thành công",
            ...result,
        });
    } catch (error) {
        return next(error);
    }
}

// 10. Dành cho Admin: Xóa bệnh nhân theo ID (có Safe Delete Guard)
async function deletePatientByIdController(req, res, next) {
    try {
        const result = await deletePatientByIdService(req.params.id);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: { mabn: result.mabn, hoten: result.hoten },
        });
    } catch (error) {
        return next(error);
    }
}

// 11. Bệnh nhân tự yêu cầu xóa tài khoản cá nhân (có Safe Delete Guard)
async function deleteMyAccountController(req, res, next) {
    try {
        const result = await deleteMyAccountService(req.user.matk);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: { mabn: result.mabn, hoten: result.hoten },
        });
    } catch (error) {
        return next(error);
    }
}

// 12. Bệnh nhân tự làm trống / reset tiền sử bệnh án
async function resetMyMedicalRecordController(req, res, next) {
    try {
        const result = await resetMyMedicalRecordService(req.user.matk);
        return res.status(200).json({
            success: true,
            message: result.message,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createPatientController,
    getMyProfileController,
    updateMyProfileController,
    getMyMedicalRecordController,
    updateMyMedicalRecordController,
    getMyMedicalHistoryController,
    getMyMedicalHistoryDetailController,
    getPatientMedicalRecordByIdController,
    updatePatientMedicalRecordByIdController,
    getAllPatientsController,
    deletePatientByIdController,
    deleteMyAccountController,
    resetMyMedicalRecordController,
};


