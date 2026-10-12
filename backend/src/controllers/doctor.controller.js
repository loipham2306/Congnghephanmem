const {
    getAllDoctorsService,
    getDoctorByIdService,
    getDoctorScheduleService,
    createDoctorService,
    updateDoctorService,
    deleteDoctorService,
} = require("../services/doctor.service");


// [GET] /api/doctors
// Lấy danh sách bác sĩ (hỗ trợ lọc theo chuyên khoa, tìm kiếm và phân trang)

async function getAllDoctorsController(req, res, next) {
    try {
        const { specialtyId, search, page, limit } = req.query;
        const result = await getAllDoctorsService({
            specialtyId,
            search,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách bác sĩ thành công!",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// [GET] /api/doctors/:id
// Lấy chi tiết thông tin một bác sĩ theo ID
async function getDoctorByIdController(req, res, next) {
    try {
        const { id } = req.params;
        const doctor = await getDoctorByIdService(id);

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin chi tiết bác sĩ thành công!",
            data: doctor,
        });
    } catch (error) {
        return next(error);
    }
}

// [GET] /api/doctors/:id/schedule
// Lấy lịch làm việc / ca trực của một bác sĩ theo ID
async function getDoctorScheduleController(req, res, next) {
    try {
        const { id } = req.params;
        const { fromDate, toDate } = req.query;
        const result = await getDoctorScheduleService(id, { fromDate, toDate });

        return res.status(200).json({
            success: true,
            message: "Lấy lịch làm việc của bác sĩ thành công!",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

// [POST] /api/doctors
// Thêm mới một bác sĩ vào hệ thống (Admin)
async function createDoctorController(req, res, next) {
    try {
        const newDoctor = await createDoctorService(req.body);

        return res.status(201).json({
            success: true,
            message: "Thêm mới bác sĩ thành công!",
            data: newDoctor,
        });
    } catch (error) {
        return next(error);
    }
}

// [PUT] /api/doctors/:id
// Cập nhật thông tin bác sĩ (Admin)
async function updateDoctorController(req, res, next) {
    try {
        const { id } = req.params;
        const updatedDoctor = await updateDoctorService(id, req.body);

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin bác sĩ thành công!",
            data: updatedDoctor,
        });
    } catch (error) {
        return next(error);
    }
}

// [DELETE] /api/doctors/:id
// Xóa một bác sĩ khỏi hệ thống (Admin)
async function deleteDoctorController(req, res, next) {
    try {
        const { id } = req.params;
        const result = await deleteDoctorService(id);

        return res.status(200).json({
            success: true,
            message: `Xóa bác sĩ "${result.hoten}" thành công!`,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getAllDoctorsController,
    getDoctorByIdController,
    getDoctorScheduleController,
    createDoctorController,
    updateDoctorController,
    deleteDoctorController,
};
