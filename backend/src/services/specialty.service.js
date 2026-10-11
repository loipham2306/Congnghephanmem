const prisma = require("../config/prisma");


// lấy danh sách chuyên khoa (hỗ trợ tìm kiếm, phân trang và đếm quan hệ)

async function getAllSpecialtiesService({ search, page, limit, includeCounts } = {}) {
    const where = {};

    if (search && search.trim()) {
        where.tenchuyenkhoa = {
            contains: search.trim(),
            mode: "insensitive",
        };
    }

    const isCounting = includeCounts === "true" || includeCounts === true;

    // cấu hình trường dữ liệu trả về
    const select = {
        mack: true,
        tenchuyenkhoa: true,
        mota: true,
        ...(isCounting && {
            _count: {
                select: {
                    bacsi: true,
                    phongkham: true,
                    dichvu: true,
                },
            },
        }),
    };

    // nếu có truyền page hoặc limit -> Thực hiện phân trang
    if (page || limit) {
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 10);
        const skip = (pageNumber - 1) * pageSize;

        const [totalItems, items] = await Promise.all([
            prisma.chuyenkhoa.count({ where }),
            prisma.chuyenkhoa.findMany({
                where,
                select,
                skip,
                take: pageSize,
                orderBy: { mack: "asc" },
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

    // không phân trang (thường dùng cho dropdown/combobox master data)
    const specialties = await prisma.chuyenkhoa.findMany({
        where,
        select,
        orderBy: { mack: "asc" },
    });

    return specialties;
}

// lấy chi tiết một chuyên khoa theo mã (tối ưu include quan hệ)
async function getSpecialtyByIdService(mack) {
    const id = Number(mack);

    const specialty = await prisma.chuyenkhoa.findUnique({
        where: { mack: id },
        include: {
            bacsi: {
                select: {
                    mabs: true,
                    hocham: true,
                    kinhnghiem: true,
                    sogiayphephanhnghe: true,
                    nhanvien: {
                        select: {
                            hoten: true,
                            sdt: true,
                            gioitinh: true,
                        },
                    },
                },
            },
            phongkham: {
                select: {
                    maphong: true,
                    tenphong: true,
                    trangthai: true,
                },
            },
            dichvu: {
                select: {
                    madv: true,
                    tendichvu: true,
                    dongia: true,
                },
            },
            _count: {
                select: {
                    bacsi: true,
                    phongkham: true,
                    dichvu: true,
                },
            },
        },
    });

    if (!specialty) {
        const error = new Error(`Không tìm thấy chuyên khoa với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    return specialty;
}


// tạo mới một chuyên khoa
async function createSpecialtyService({ tenchuyenkhoa, mota }) {
    // kiểm tra tên chuyên khoa đã tồn tại chưa 
    const existingSpecialty = await prisma.chuyenkhoa.findFirst({
        where: {
            tenchuyenkhoa: {
                equals: tenchuyenkhoa,
                mode: "insensitive",
            },
        },
    });

    if (existingSpecialty) {
        const error = new Error(
            `Tên chuyên khoa "${tenchuyenkhoa}" đã tồn tại trong hệ thống!`,
        );
        error.statusCode = 409;
        throw error;
    }

    // tạo bản ghi mới
    const newSpecialty = await prisma.chuyenkhoa.create({
        data: {
            tenchuyenkhoa,
            mota: mota || null,
        },
    });

    return newSpecialty;
}


// cập nhật thông tin chuyên khoa
async function updateSpecialtyService(mack, updateData) {
    const id = Number(mack);

    // kiểm tra bản ghi có tồn tại không
    const currentSpecialty = await prisma.chuyenkhoa.findUnique({
        where: { mack: id },
    });

    if (!currentSpecialty) {
        const error = new Error(`Không tìm thấy chuyên khoa với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // nếu có đổi tên chuyên khoa, kiểm tra xem có trùng với bản ghi khác không
    if (
        updateData.tenchuyenkhoa &&
        updateData.tenchuyenkhoa.toLowerCase() !==
        currentSpecialty.tenchuyenkhoa.toLowerCase()
    ) {
        const duplicate = await prisma.chuyenkhoa.findFirst({
            where: {
                tenchuyenkhoa: {
                    equals: updateData.tenchuyenkhoa,
                    mode: "insensitive",
                },
                NOT: { mack: id },
            },
        });

        if (duplicate) {
            const error = new Error(
                `Tên chuyên khoa "${updateData.tenchuyenkhoa}" đã tồn tại trong hệ thống!`,
            );
            error.statusCode = 409;
            throw error;
        }
    }

    // chuẩn bị dữ liệu cập nhật
    const dataToUpdate = {};
    if (updateData.tenchuyenkhoa !== undefined) {
        dataToUpdate.tenchuyenkhoa = updateData.tenchuyenkhoa;
    }
    if (updateData.mota !== undefined) {
        dataToUpdate.mota = updateData.mota;
    }

    const updatedSpecialty = await prisma.chuyenkhoa.update({
        where: { mack: id },
        data: dataToUpdate,
    });

    return updatedSpecialty;
}


// Xóa chuyên khoa (Có kiểm tra bảo vệ toàn vẹn dữ liệu)
async function deleteSpecialtyService(mack) {
    const id = Number(mack);

    // kiểm tra tồn tại chuyên khoa và đếm dữ liệu liên kết
    const specialty = await prisma.chuyenkhoa.findUnique({
        where: { mack: id },
        include: {
            _count: {
                select: {
                    bacsi: true,
                    phongkham: true,
                    dichvu: true,
                },
            },
        },
    });

    if (!specialty) {
        const error = new Error(`Không tìm thấy chuyên khoa với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // kiểm tra ràng buộc an toàn (Safe delete)
    const { bacsi: doctorCount, phongkham: roomCount, dichvu: serviceCount } =
        specialty._count;

    if (doctorCount > 0 || roomCount > 0 || serviceCount > 0) {
        const constraints = [];
        if (doctorCount > 0) constraints.push(`${doctorCount} bác sĩ`);
        if (roomCount > 0) constraints.push(`${roomCount} phòng khám`);
        if (serviceCount > 0) constraints.push(`${serviceCount} dịch vụ`);

        const error = new Error(
            `Không thể xóa chuyên khoa "${specialty.tenchuyenkhoa}" vì đang có dữ liệu liên kết (${constraints.join(", ")}). Vui lòng điều chuyển hoặc xóa các dữ liệu liên quan trước!`,
        );
        error.statusCode = 400;
        throw error;
    }

    // tiến hành xóa
    await prisma.chuyenkhoa.delete({
        where: { mack: id },
    });

    return {
        mack: id,
        tenchuyenkhoa: specialty.tenchuyenkhoa,
    };
}

module.exports = {
    getAllSpecialtiesService,
    getSpecialtyByIdService,
    createSpecialtyService,
    updateSpecialtyService,
    deleteSpecialtyService,
};
