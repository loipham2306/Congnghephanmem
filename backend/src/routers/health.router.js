const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

router.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "API đang hoạt động",
        timestamp: new Date().toISOString(),
    });
});

router.get("/db", async (req, res, next) => {
    try {
        const checks = {
            database: false,
            triggerTinhTien: false,
            slotIndexes: false,
        };

        try {
            await prisma.$queryRaw`SELECT 1`;
            checks.database = true;
        } catch (error) {
            checks.database = false;
        }

        if (checks.database) {
            try {
                const triggerRows = await prisma.$queryRaw`
                    SELECT EXISTS (
                        SELECT 1 FROM pg_trigger
                        WHERE tgname = 'trg_cthd_update_tongtien'
                    ) AS "exists"
                `;
                checks.triggerTinhTien = Boolean(triggerRows?.[0]?.exists);
            } catch (error) {
                checks.triggerTinhTien = false;
            }

            try {
                const indexRows = await prisma.$queryRaw`
                    SELECT COUNT(*)::int AS "count"
                    FROM pg_indexes
                    WHERE indexname IN (
                        'uq_lichhen_bacsi_slot_active',
                        'uq_lichhen_benhnhan_slot_active'
                    )
                `;
                checks.slotIndexes = Number(indexRows?.[0]?.count) === 2;
            } catch (error) {
                checks.slotIndexes = false;
            }
        }

        const healthy = checks.database;
        return res.status(healthy ? 200 : 503).json({
            success: healthy,
            message: healthy ? "Kết nối CSDL thành công" : "Không kết nối được CSDL",
            data: checks,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
