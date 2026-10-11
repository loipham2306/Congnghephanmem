const prisma = require("../config/prisma");

// lấy danh sách dịch vụ (hỗ trợ lọc chuyên khoa, khoảng giá, tìm kiếm và phân trang)
async function getAllServicesService({ specialtyId, search, minPrice, maxPrice, page, limit } = {}) {
    const where = {};

    // 1. Lọc theo chuyên khoa
    if (specialtyId !== undefined) {
        where.mack = Number(specialtyId);
    }

    // 2. Tìm kiếm theo tên dịch vụ
    if (search && search.trim()) {
        where.tendichvu = {
            contains: search.trim(),
            mode: "insensitive",
        };
    }

    // 3. Lọc theo khoảng giá
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.dongia = {};
        if (minPrice !== undefined) {
            where.dongia.gte = Number(minPrice);
        }
        if (maxPrice !== undefined) {
            where.dongia.lte = Number(maxPrice);
        }
    }

    const include = {
        chuyenkhoa: {
            select: {
                mack: true,
                tenchuyenkhoa: true,
            },
        },
        _count: {
            select: {
                chitietdichvukham: true,
                chitiethoadon: true,
            },
        },
    };

    // 4. Phân trang nếu có truyền page hoặc limit
    if (page || limit) {
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 10);
        const skip = (pageNumber - 1) * pageSize;

        const [totalItems, items] = await Promise.all([
            prisma.dichvu.count({ where }),
            prisma.dichvu.findMany({
                where,
                include,
                skip,
                take: pageSize,
                orderBy: { madv: "asc" },
            }),
        ]);

        return {
            items,
            pagination: {
                total: totalItems,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(totalItems / pageSize),
            },
        };
    }

    // Trả về toàn bộ (phục vụ dropdown kê đơn, chỉ định dịch vụ)
    const services = await prisma.dichvu.findMany({
        where,
        include,
        orderBy: { madv: "asc" },
    });

    return services;
}

// lấy chi tiết thông tin một dịch vụ theo mã ID
async function getServiceByIdService(madv) {
    const id = Number(madv);

    const service = await prisma.dichvu.findUnique({
        where: { madv: id },
        include: {
            chuyenkhoa: {
                select: {
                    mack: true,
                    tenchuyenkhoa: true,
                    mota: true,
                },
            },
            _count: {
                select: {
                    chitietdichvukham: true,
                    chitiethoadon: true,
                },
            },
        },
    });

    if (!service) {
        const error = new Error(`Không tìm thấy dịch vụ với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    return service;
}

// tạo mới một dịch vụ
async function createServiceService({ tendichvu, dongia, mack }) {
    // 1. Kiểm tra chuyên khoa nếu có truyền
    if (mack) {
        const specialty = await prisma.chuyenkhoa.findUnique({
            where: { mack: Number(mack) },
        });
        if (!specialty) {
            const error = new Error(`Chuyên khoa với mã ID ${mack} không tồn tại trong hệ thống!`);
            error.statusCode = 404;
            throw error;
        }
    }

    // 2. Tạo bản ghi mới
    const newService = await prisma.dichvu.create({
        data: {
            tendichvu,
            dongia,
            mack: mack ? Number(mack) : null,
        },
        include: {
            chuyenkhoa: {
                select: {
                    mack: true,
                    tenchuyenkhoa: true,
                },
            },
        },
    });

    return newService;
}

// cập nhật thông tin dịch vụ
async function updateServiceService(madv, updateData) {
    const id = Number(madv);

    // 1. Kiểm tra dịch vụ có tồn tại không
    const currentService = await prisma.dichvu.findUnique({
        where: { madv: id },
    });

    if (!currentService) {
        const error = new Error(`Không tìm thấy dịch vụ với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // 2. Nếu đổi chuyên khoa, kiểm tra chuyên khoa mới có tồn tại không
    if (updateData.mack !== undefined && updateData.mack !== null) {
        const specialty = await prisma.chuyenkhoa.findUnique({
            where: { mack: Number(updateData.mack) },
        });
        if (!specialty) {
            const error = new Error(
                `Chuyên khoa với mã ID ${updateData.mack} không tồn tại trong hệ thống!`,
            );
            error.statusCode = 404;
            throw error;
        }
    }

    // 3. Chuẩn bị dữ liệu cập nhật
    const dataToUpdate = {};
    if (updateData.tendichvu !== undefined) dataToUpdate.tendichvu = updateData.tendichvu;
    if (updateData.dongia !== undefined) dataToUpdate.dongia = updateData.dongia;
    if (updateData.mack !== undefined) {
        dataToUpdate.mack = updateData.mack ? Number(updateData.mack) : null;
    }

    const updatedService = await prisma.dichvu.update({
        where: { madv: id },
        data: dataToUpdate,
        include: {
            chuyenkhoa: {
                select: {
                    mack: true,
                    tenchuyenkhoa: true,
                },
            },
        },
    });

    return updatedService;
}

// xóa dịch vụ (Có Safe Delete Guard bảo vệ toàn vẹn hồ sơ khám và hóa đơn)
async function deleteServiceService(madv) {
    const id = Number(madv);

    // 1. Kiểm tra dịch vụ có tồn tại không
    const service = await prisma.dichvu.findUnique({
        where: { madv: id },
        include: {
            _count: {
                select: {
                    chitietdichvukham: true,
                    chitiethoadon: true,
                },
            },
        },
    });

    if (!service) {
        const error = new Error(`Không tìm thấy dịch vụ với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // 2. Kiểm tra ràng buộc giao dịch
    const { chitietdichvukham: recordCount, chitiethoadon: billCount } = service._count;
    if (recordCount > 0 || billCount > 0) {
        const constraints = [];
        if (recordCount > 0) constraints.push(`${recordCount} lượt chỉ định khám`);
        if (billCount > 0) constraints.push(`${billCount} khoản thu hóa đơn`);

        const error = new Error(
            `Không thể xóa dịch vụ "${service.tendichvu}" vì đang gắn với dữ liệu thanh toán (${constraints.join(", ")}). Để bảo vệ chứng từ viện phí, không được phép xóa dịch vụ này!`,
        );
        error.statusCode = 400;
        throw error;
    }

    // 3. Tiến hành xóa an toàn
    await prisma.dichvu.delete({
        where: { madv: id },
    });

    return {
        madv: id,
        tendichvu: service.tendichvu,
    };
}

module.exports = {
    getAllServicesService,
    getServiceByIdService,
    createServiceService,
    updateServiceService,
    deleteServiceService,
};
