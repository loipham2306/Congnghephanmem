const prisma = require("../config/prisma");

function getMyProfileService(matk) {
    const patient = prisma.benhnhan.findUnique({
        where: {
            matk,
        },
    });
    if (!patient) {
        const error = new Error("Không tìm thấy thông tin bệnh nhân");
        error.statusCode = 404;
        throw error;
    }
    return patient;
}

module.exports = {
    getMyProfileService,
};
