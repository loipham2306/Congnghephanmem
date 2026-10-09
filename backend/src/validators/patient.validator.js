// ========================================================
// VALIDATOR: KIỂM TRA DỮ LIỆU ĐẦU VÀO PHÂN HỆ BỆNH NHÂN
// ========================================================

function validateUpdateProfile(req, res, next) {
    const { hoten, gioitinh, ngaysinh, sdt, diachi, cccd, sobhyt } = req.body;

    // 1. Kiểm tra phải có ít nhất một trường dữ liệu gửi lên
    if (
        hoten === undefined &&
        gioitinh === undefined &&
        ngaysinh === undefined &&
        sdt === undefined &&
        diachi === undefined &&
        cccd === undefined &&
        sobhyt === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng cung cấp ít nhất một thông tin cần cập nhật!",
        });
    }

    // 2. Kiểm tra Họ tên
    if (hoten !== undefined) {
        if (typeof hoten !== "string" || hoten.trim().length < 2 || hoten.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Họ và tên phải là chuỗi từ 2 đến 100 ký tự!",
            });
        }
    }

    // 3. Kiểm tra Giới tính (Enum: Nam, Nu, Khac)
    if (gioitinh !== undefined) {
        const validGenders = ["Nam", "Nu", "Khac"];
        if (!validGenders.includes(gioitinh)) {
            return res.status(400).json({
                success: false,
                message: `Giới tính không hợp lệ! Chỉ chấp nhận: ${validGenders.join(", ")}`,
            });
        }
    }

    // 4. Kiểm tra Ngày sinh (phải là ngày hợp lệ)
    if (ngaysinh !== undefined) {
        const parsedDate = new Date(ngaysinh);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Ngày sinh không đúng định dạng ngày tháng hợp lệ (YYYY-MM-DD)!",
            });
        }
        const now = new Date();
        if (parsedDate > now) {
            return res.status(400).json({
                success: false,
                message: "Ngày sinh không thể lớn hơn ngày hiện tại!",
            });
        }
        if (parsedDate.getFullYear() < 1900) {
            return res.status(400).json({
                success: false,
                message: "Năm sinh không hợp lệ (phải từ năm 1900 trở lại đây)!",
            });
        }
    }

    // 5. Kiểm tra Số điện thoại
    if (sdt !== undefined) {
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(sdt.trim())) {
            return res.status(400).json({
                success: false,
                message: "Số điện thoại không hợp lệ! Phải bao gồm 10 chữ số bắt đầu bằng số 0.",
            });
        }
    }

    // 6. Kiểm tra Địa chỉ
    if (diachi !== undefined && diachi !== null) {
        if (typeof diachi !== "string" || diachi.length > 255) {
            return res.status(400).json({
                success: false,
                message: "Địa chỉ không được vượt quá 255 ký tự!",
            });
        }
    }

    // 7. Kiểm tra Căn cước công dân (12 chữ số)
    if (cccd !== undefined && cccd !== null && cccd !== "") {
        const cccdRegex = /^\d{12}$/;
        if (!cccdRegex.test(cccd.trim())) {
            return res.status(400).json({
                success: false,
                message: "Số CCCD không hợp lệ! Phải bao gồm đúng 12 chữ số.",
            });
        }
    }

    // 8. Kiểm tra Số BHYT (tối đa 20 ký tự chữ và số)
    if (sobhyt !== undefined && sobhyt !== null && sobhyt !== "") {
        if (typeof sobhyt !== "string" || sobhyt.trim().length > 20) {
            return res.status(400).json({
                success: false,
                message: "Số thẻ BHYT không được vượt quá 20 ký tự!",
            });
        }
    }

    next();
}

module.exports = {
    validateUpdateProfile,
};
