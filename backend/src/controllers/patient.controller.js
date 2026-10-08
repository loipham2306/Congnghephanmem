const {
    getMyProfileService,
    getMyMedicalRecordService,
    getMyMedicalHistoryService,
    updateMyProfileService,
} = require("../services/patient.service");

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
//cập nhật hồ sơ
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
// lay ho so benh nhan
async function getMyMedicalRecordController(req, res, next) {
    try {
        const medicalRecord = await getMyMedicalRecordService(req.user.matk);
        return res.status(200).json({
            success: true,
            message: "Lấy hồ sơ bệnh án thành công",
            data: medicalRecord,
        });
    } catch (error) {
        next(error);
    }
}

// Lấy lịch sử khám
async function getMyMedicalHistoryController(req, res, next) {
    try {
        const medicalHistory = await getMyMedicalHistoryService(req.user.matk);
        return res.status(200).json({
            success: true,
            message: "Lấy lịch sử khám thành công",
            data: medicalHistory,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMyProfileController,
    updateMyProfileController,
    getMyMedicalRecordController,
    getMyMedicalHistoryController,
};
