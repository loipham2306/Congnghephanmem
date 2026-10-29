// ========================================================
// ROUTER: PHÂN HỆ BÁO CÁO & THỐNG KÊ (STATISTICS) CHO ADMIN
// ========================================================

const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { roleMiddleware } = require("../middlewares/role.middleware");

const {
    getOverview,
    getRevenue,
    getExaminations,
    getTopServices,
    getTopMedicines,
    getPatients,
    getRevenueBySpecialty,
    getRevenueByDoctor,
    exportRevenue,
} = require("../controllers/statistic.controller");

const {
    validateDateRangeQuery,
} = require("../validators/statistic.validator");

const router = express.Router();

// Tất cả các báo cáo thống kê đều yêu cầu quyền Admin
router.use(authMiddleware, roleMiddleware("Admin"));

// 1. Tổng quan Dashboard phòng khám
router.get("/overview", getOverview);

// 2. Báo cáo doanh thu chi tiết (theo ngày/tháng, phương thức, phân loại viện phí)
router.get("/revenue", validateDateRangeQuery, getRevenue);

// 3. Thống kê lượt khám (theo chuyên khoa, bác sĩ, xu hướng thời gian)
router.get("/examinations", validateDateRangeQuery, getExaminations);

// 4. Top dịch vụ chỉ định nhiều nhất
router.get("/top-services", validateDateRangeQuery, getTopServices);

// 5. Top thuốc kê đơn nhiều nhất
router.get("/top-medicines", validateDateRangeQuery, getTopMedicines);

// 6. Thống kê bệnh nhân mới
router.get("/patients", validateDateRangeQuery, getPatients);

// 7. Doanh thu theo chuyên khoa
router.get("/revenue-by-specialty", validateDateRangeQuery, getRevenueBySpecialty);

// 8. Doanh thu theo bác sĩ
router.get("/revenue-by-doctor", validateDateRangeQuery, getRevenueByDoctor);

// 9. Xuất CSV doanh thu
router.get("/export/revenue", validateDateRangeQuery, exportRevenue);

module.exports = router;
