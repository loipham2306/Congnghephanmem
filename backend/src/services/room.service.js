const prisma = require("../config/prisma");


//lấy danh sách phòng khám (hỗ trợ lọc chuyên khoa, trạng thái, tìm kiếm và phân trang)
async function getAllRoomsService({ specialtyId, status, search, page, limit } = {}) {
    const where = {};

    // Lọc theo chuyên khoa
    if (specialtyId) {
        where.mack = Number(specialtyId);
    }

    // Lọc theo trạng thái phòng
    if (status) {
        where.trangthai = status;
    }

    // Tìm kiếm theo tên phòng
    if (search && search.trim()) {
        where.tenphong = {
            contains: search.trim(),
            mode: "insensitive",
        };
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
                calamviec: true,
            },
        },
    };

    // Phân trang nếu có truyền page hoặc limit
    if (page || limit) {
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.max(1, Number(limit) || 10);
        const skip = (pageNumber - 1) * pageSize;

        const [totalItems, items] = await Promise.all([
            prisma.phongkham.count({ where }),
            prisma.phongkham.findMany({
                where,
                include,
                skip,
                take: pageSize,
                orderBy: { maphong: "asc" },
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

    // Trả về toàn bộ (thường dùng cho dropdown/combobox xếp ca, đặt phòng)
    const rooms = await prisma.phongkham.findMany({
        where,
        include,
        orderBy: { maphong: "asc" },
    });

    return rooms;
}

// lấy chi tiết thông tin một phòng khám theo mã ID
async function getRoomByIdService(maphong) {
    const id = Number(maphong);

    const room = await prisma.phongkham.findUnique({
        where: { maphong: id },
        include: {
            chuyenkhoa: {
                select: {
                    mack: true,
                    tenchuyenkhoa: true,
                    mota: true,
                },
            },
            calamviec: {
                select: {
                    maca: true,
                    ngay: true,
                    giobatdau: true,
                    gioketthuc: true,
                },
                orderBy: {
                    ngay: "desc",
                },
                take: 10,
            },
            _count: {
                select: {
                    calamviec: true,
                },
            },
        },
    });

    if (!room) {
        const error = new Error(`Không tìm thấy phòng khám với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    return room;
}

//tạo mới một phòng khám
async function createRoomService({ tenphong, mack, trangthai }) {
    // Kiểm tra chuyên khoa có tồn tại không
    const specialty = await prisma.chuyenkhoa.findUnique({
        where: { mack: Number(mack) },
    });
    if (!specialty) {
        const error = new Error(`Chuyên khoa với mã ID ${mack} không tồn tại trong hệ thống!`);
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra tên phòng khám đã tồn tại chưa (không phân biệt hoa thường)
    const existingRoom = await prisma.phongkham.findFirst({
        where: {
            tenphong: {
                equals: tenphong,
                mode: "insensitive",
            },
        },
    });

    if (existingRoom) {
        const error = new Error(`Tên phòng khám "${tenphong}" đã tồn tại trong hệ thống!`);
        error.statusCode = 409;
        throw error;
    }

    // Tạo bản ghi mới
    const newRoom = await prisma.phongkham.create({
        data: {
            tenphong,
            mack: Number(mack),
            trangthai,
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

    return newRoom;
}

//cập nhật thông tin phòng khám
async function updateRoomService(maphong, updateData) {
    const id = Number(maphong);

    // Kiểm tra phòng khám có tồn tại không
    const currentRoom = await prisma.phongkham.findUnique({
        where: { maphong: id },
    });

    if (!currentRoom) {
        const error = new Error(`Không tìm thấy phòng khám với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // Nếu đổi chuyên khoa, kiểm tra chuyên khoa mới có tồn tại không
    if (updateData.mack && updateData.mack !== currentRoom.mack) {
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

    // Nếu đổi tên phòng, kiểm tra xem có trùng với phòng khác không
    if (
        updateData.tenphong &&
        updateData.tenphong.toLowerCase() !== currentRoom.tenphong.toLowerCase()
    ) {
        const duplicate = await prisma.phongkham.findFirst({
            where: {
                tenphong: {
                    equals: updateData.tenphong,
                    mode: "insensitive",
                },
                NOT: { maphong: id },
            },
        });

        if (duplicate) {
            const error = new Error(
                `Tên phòng khám "${updateData.tenphong}" đã được phòng khám khác sử dụng!`,
            );
            error.statusCode = 409;
            throw error;
        }
    }

    // Chuẩn bị dữ liệu cập nhật
    const dataToUpdate = {};
    if (updateData.tenphong !== undefined) dataToUpdate.tenphong = updateData.tenphong;
    if (updateData.mack !== undefined) dataToUpdate.mack = Number(updateData.mack);
    if (updateData.trangthai !== undefined) dataToUpdate.trangthai = updateData.trangthai;

    const updatedRoom = await prisma.phongkham.update({
        where: { maphong: id },
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

    return updatedRoom;
}


//xóa phòng khám (Có Safe Delete Guard bảo vệ toàn vẹn lịch ca làm việc)
async function deleteRoomService(maphong) {
    const id = Number(maphong);

    // Kiểm tra phòng khám có tồn tại không
    const room = await prisma.phongkham.findUnique({
        where: { maphong: id },
        include: {
            _count: {
                select: {
                    calamviec: true,
                },
            },
        },
    });

    if (!room) {
        const error = new Error(`Không tìm thấy phòng khám với mã ID: ${id}`);
        error.statusCode = 404;
        throw error;
    }

    // kiểm tra ràng buộc ca làm việc
    const shiftCount = room._count.calamviec;
    if (shiftCount > 0) {
        const error = new Error(
            `Không thể xóa phòng khám "${room.tenphong}" vì đã có ${shiftCount} ca làm việc được phân công. Vui lòng chuyển hoặc xóa các ca làm việc liên quan trước!`,
        );
        error.statusCode = 400;
        throw error;
    }

    // tiến hành xóa an toàn
    await prisma.phongkham.delete({
        where: { maphong: id },
    });

    return {
        maphong: id,
        tenphong: room.tenphong,
    };
}

module.exports = {
    getAllRoomsService,
    getRoomByIdService,
    createRoomService,
    updateRoomService,
    deleteRoomService,
};
