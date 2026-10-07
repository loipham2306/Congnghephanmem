const { getMyProfileService } = require("../services/patient.service");

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
module.exports = {
    getMyProfileController,
};
