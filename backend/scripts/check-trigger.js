require("dotenv").config();

const prisma = require("../src/config/prisma");

async function main() {
    const triggerRows = await prisma.$queryRaw`
        SELECT tgname
        FROM pg_trigger
        WHERE tgname = 'trg_cthd_update_tongtien'
    `;

    const indexRows = await prisma.$queryRaw`
        SELECT indexname
        FROM pg_indexes
        WHERE indexname IN (
            'uq_lichhen_bacsi_slot_active',
            'uq_lichhen_benhnhan_slot_active',
            'uq_lichhen_ngay_bacsi_sohangcho'
        )
        ORDER BY indexname
    `;

    console.log("Trigger tính tổng tiền:", triggerRows.length > 0 ? "CÓ" : "THIẾU");
    console.log("Các index chống trùng/hàng chờ:");
    for (const row of indexRows) console.log(" -", row.indexname);

    if (triggerRows.length === 0 || indexRows.length < 3) {
        console.error("CSDL chưa được migrate đầy đủ. Hãy chạy: npm run db:migrate");
        process.exitCode = 1;
    }
}

main()
    .catch((error) => {
        console.error("Không kiểm tra được CSDL:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
