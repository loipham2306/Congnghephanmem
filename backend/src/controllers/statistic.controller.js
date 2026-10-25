// ========================================================
// CONTROLLER: THỐNG KÊ & BÁO CÁO CHO ADMIN
// ========================================================

const statisticService = require("../services/statistic.service");

/**
 * 1. GET /api/statistics/overview
 * Thống kê tổng quan dashboard cho Admin
 */
async function getOverview(req, res, next) {
    try {
        const result = await statisticService.getOverviewStatisticsService();
        return res.status(200).json({
            status: "success",
            message: "Lấy số liệu tổng quan thành công",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * 2. GET /api/statistics/revenue
 * Báo cáo doanh thu theo khoảng thời gian và phân loại
 */
async function getRevenue(req, res, next) {
    try {
        const { startDate, endDate, groupBy } = req.query;
        const result = await statisticService.getRevenueStatisticsService({
            startDate,
            endDate,
            groupBy,
        });
        return res.status(200).json({
            status: "success",
            message: "Lấy báo cáo doanh thu thành công",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * 3. GET /api/statistics/examinations
 * Báo cáo số lượt khám bệnh theo chuyên khoa, bác sĩ và xu hướng
 */
async function getExaminations(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        const result = await statisticService.getExaminationStatisticsService({
            startDate,
            endDate,
        });
        return res.status(200).json({
            status: "success",
            message: "Lấy thống kê lượt khám thành công",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * 4. GET /api/statistics/top-services
 * Top dịch vụ chỉ định nhiều nhất
 */
async function getTopServices(req, res, next) {
    try {
        const { startDate, endDate, limit } = req.query;
        const result = await statisticService.getTopServicesService({
            startDate,
            endDate,
            limit: limit ? parseInt(limit, 10) : 5,
        });
        return res.status(200).json({
            status: "success",
            message: "Lấy danh sách top dịch vụ thành công",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * 5. GET /api/statistics/top-medicines
 * Top thuốc kê đơn nhiều nhất
 */
async function getTopMedicines(req, res, next) {
    try {
        const { startDate, endDate, limit } = req.query;
        const result = await statisticService.getTopMedicinesService({
            startDate,
            endDate,
            limit: limit ? parseInt(limit, 10) : 5,
        });
        return res.status(200).json({
            status: "success",
            message: "Lấy danh sách top thuốc kê đơn thành công",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getOverview,
    getRevenue,
    getExaminations,
    getTopServices,
    getTopMedicines,
};
