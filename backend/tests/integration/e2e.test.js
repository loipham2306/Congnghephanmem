// ========================================================
// SMOKE TEST TÍCH HỢP END-TO-END (cần PostgreSQL + migration)
// ========================================================
// Chạy:
//   $env:DATABASE_URL="postgresql://..."; npm run test:integration
// Test này dùng DB test riêng, không chạy trên DB thật.

const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "integration-test-secret";
process.env.AUTH_CACHE_TTL_MS = "0";

const app = require("../../src/app");
const prisma = require("../../src/config/prisma");
const { todayVN, addDaysVN, parseDateOnly } = require("../../src/utils/date");

let server;
let baseUrl;
let adminToken;
let doctorToken;
let adminRefresh;

const stamp = String(Date.now());

function phone(suffix) {
    return `09${String(suffix).padStart(8, "0").slice(-8)}`;
}

async function request(method, path, { token, body } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    let payload = null;
    try {
        payload = text ? JSON.parse(text) : null;
    } catch (error) {
        payload = { raw: text };
    }
    return { status: response.status, body: payload };
}

async function login(username, password) {
    const result = await request("POST", "/api/auth/login", {
        body: { username, password },
    });
    assert.equal(result.status, 200, `Đăng nhập ${username} phải thành công`);
    assert.ok(result.body?.data?.accessToken);
    assert.ok(result.body?.data?.refreshToken);
    assert.equal(result.body.data.user?.user, undefined, "Không được lồng user.user");
    return result.body.data;
}

test("luồng end-to-end phòng khám", async (t) => {
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;

    t.after(async () => {
        await new Promise((resolve) => server.close(resolve));
        await prisma.$disconnect();
    });

    // 0. Đăng nhập Admin (do seed tạo)
    const admin = await login("admin", process.env.ADMIN_PASSWORD || "Admin@123");
    adminToken = admin.accessToken;
    adminRefresh = admin.refreshToken;

    // 1. Tạo bác sĩ + ca trực + phòng khám
    const specialty = await prisma.chuyenkhoa.findFirst();
    assert.ok(specialty, "Seed phải có ít nhất 1 chuyên khoa");

    const doctorUsername = `bs_${stamp}`;
    const doctorPassword = "Doctor@123";
    const doctorAccount = await request("POST", "/api/auth/accounts", {
        token: adminToken,
        body: {
            username: doctorUsername,
            password: doctorPassword,
            vaitro: "BacSi",
            hoten: "Bác sĩ Test",
            gioitinh: "Nam",
            ngaysinh: "1985-05-05",
            sdt: phone(stamp),
            chucvu: "BacSi",
            ngayvaolam: "2020-01-01",
        },
    });
    assert.equal(doctorAccount.status, 201, JSON.stringify(doctorAccount.body));
    const manv = doctorAccount.body.data.manv;
    assert.ok(manv);

    await prisma.bacsi.create({
        data: {
            mabs: manv,
            mack: specialty.mack,
            sogiayphephanhnghe: `GP_${stamp}`,
            hocham: "ThS",
            kinhnghiem: 10,
        },
    });

    const room = await prisma.phongkham.create({
        data: {
            tenphong: `Phòng test ${stamp}`,
            mack: specialty.mack,
        },
    });

    const appointmentDate = addDaysVN(todayVN(), 1);
    const shift = await prisma.calamviec.create({
        data: {
            ngay: parseDateOnly(appointmentDate),
            giobatdau: new Date("1970-01-01T08:00:00.000Z"),
            gioketthuc: new Date("1970-01-01T17:00:00.000Z"),
            maphong: room.maphong,
        },
    });
    await prisma.phanconglamviec.create({
        data: { manv, maca: shift.maca, vaitrotrongca: "BacSi" },
    });

    // 2. Lễ tân tạo bệnh nhân walk-in
    const patient = await request("POST", "/api/patients", {
        token: adminToken,
        body: {
            hoten: "Bệnh nhân Test",
            gioitinh: "Nu",
            ngaysinh: "1992-02-02",
            sdt: phone(Number(stamp) + 1),
            diachi: "Hà Nội",
            cccd: String(stamp).padStart(12, "1").slice(-12),
        },
    });
    assert.equal(patient.status, 201, JSON.stringify(patient.body));
    const mabn = patient.body.data.mabn;

    // 3. Slot trống + đặt lịch + chống trùng slot
    const slots = await request(
        "GET",
        `/api/appointments/available-slots?mabs=${manv}&ngayhen=${appointmentDate}`,
        { token: adminToken },
    );
    assert.equal(slots.status, 200);
    assert.ok(slots.body.data.slots.some((slot) => slot.giohen === "08:00" && slot.conlai));

    const invalidSlots = await request(
        "GET",
        `/api/appointments/available-slots?mabs=${manv}&ngayhen=2026-02-31`,
        { token: adminToken },
    );
    assert.equal(invalidSlots.status, 400, "Ngày không tồn tại phải bị từ chối");

    const appointment = await request("POST", "/api/appointments", {
        token: adminToken,
        body: {
            mabn,
            mabs: manv,
            ngayhen: appointmentDate,
            giohen: "08:00",
            lydokham: "Khám tổng quát",
        },
    });
    assert.equal(appointment.status, 201, JSON.stringify(appointment.body));
    assert.equal(appointment.body.data.trangthai, "DaXacNhan");
    const malh = appointment.body.data.malh;

    const duplicate = await request("POST", "/api/appointments", {
        token: adminToken,
        body: {
            mabn,
            mabs: manv,
            ngayhen: appointmentDate,
            giohen: "08:00",
            lydokham: "Trùng slot",
        },
    });
    assert.equal(duplicate.status, 409);

    // 3b. Dời lịch và hủy lịch có lý do
    const secondAppointment = await request("POST", "/api/appointments", {
        token: adminToken,
        body: {
            mabn,
            mabs: manv,
            ngayhen: appointmentDate,
            giohen: "09:00",
            lydokham: "Tái khám",
        },
    });
    assert.equal(secondAppointment.status, 201, JSON.stringify(secondAppointment.body));
    const secondId = secondAppointment.body.data.malh;

    const rescheduled = await request("PUT", `/api/appointments/${secondId}/reschedule`, {
        token: adminToken,
        body: { ngayhen: appointmentDate, giohen: "09:30" },
    });
    assert.equal(rescheduled.status, 200, JSON.stringify(rescheduled.body));
    assert.equal(rescheduled.body.data.giohen, "09:30");
    assert.equal(rescheduled.body.data.trangthai, "ChoXacNhan");

    const cancelled = await request("PUT", `/api/appointments/${secondId}/cancel`, {
        token: adminToken,
        body: { lydohuy: "Bệnh nhân bận" },
    });
    assert.equal(cancelled.status, 200, JSON.stringify(cancelled.body));
    assert.equal(cancelled.body.data.trangthai, "DaHuy");
    assert.equal(cancelled.body.data.lydohuy, "Bệnh nhân bận");

    // 4. Tiếp đón + hàng chờ
    const checkIn = await request("PATCH", `/api/appointments/${malh}/check-in`, {
        token: adminToken,
    });
    assert.equal(checkIn.status, 200, JSON.stringify(checkIn.body));
    assert.equal(checkIn.body.data.trangthai, "DaTiepDon");
    assert.equal(checkIn.body.data.sohangcho, 1);

    const queue = await request(
        "GET",
        `/api/appointments/queue?date=${appointmentDate}&mabs=${manv}`,
        { token: adminToken },
    );
    assert.equal(queue.status, 200);
    assert.ok(queue.body.data.data.some((row) => row.malh === malh));

    // 5. Bác sĩ tạo phiếu khám, liên kết lịch hẹn
    const doctor = await login(doctorUsername, doctorPassword);
    doctorToken = doctor.accessToken;

    const canceledExam = await request("POST", "/api/examinations", {
        token: doctorToken,
        body: {
            mabn,
            malh: secondId,
            trieuchung: "Không được tạo",
            chandoan: "Lịch đã hủy",
            services: [{ madv: 1, soluong: 1 }],
        },
    });
    assert.equal(canceledExam.status, 400, "Không được tạo phiếu khám cho lịch đã hủy");

    const exam = await request("POST", "/api/examinations", {
        token: doctorToken,
        body: {
            mabn,
            malh,
            trieuchung: "Mệt mỏi",
            chandoan: "Theo dõi",
            ketluan: "Cần xét nghiệm",
            services: [{ madv: 1, soluong: 1 }],
        },
    });
    assert.equal(exam.status, 201, JSON.stringify(exam.body));
    const malsk = exam.body.data.malsk;
    assert.ok(malsk);

    const appointmentAfterExam = await request("GET", `/api/appointments/${malh}`, {
        token: adminToken,
    });
    assert.equal(appointmentAfterExam.status, 200);
    assert.equal(appointmentAfterExam.body.data.trangthai, "DaKham");
    assert.equal(appointmentAfterExam.body.data.malsk, malsk);

    // 6. Hóa đơn + trigger + không tin giá client + thanh toán
    const invoice = await request("POST", "/api/invoices", {
        token: adminToken,
        body: { malsk },
    });
    assert.equal(invoice.status, 201, JSON.stringify(invoice.body));
    const mahd = invoice.body.data.mahd;
    assert.equal(invoice.body.data.tongtien, 150000);

    const byExam = await request("GET", `/api/invoices/by-exam/${malsk}`, {
        token: adminToken,
    });
    assert.equal(byExam.status, 200);
    assert.equal(byExam.body.data.mahd, mahd);

    const invalidInvoicePage = await request("GET", "/api/invoices?page=1.5", {
        token: adminToken,
    });
    assert.equal(invalidInvoicePage.status, 400, "page phải là số nguyên");

    const extraItem = await request("POST", `/api/invoices/${mahd}/items`, {
        token: adminToken,
        body: { madv: 1, soluong: 1, dongia: 1 },
    });
    assert.equal(extraItem.status, 200, JSON.stringify(extraItem.body));
    assert.equal(extraItem.body.data.tongtien, 300000, "Giá phải lấy từ danh mục, không lấy dongia client");

    const addedItem = extraItem.body.data.chitiethoadon.find(
        (item) => item.madv === 1 && item.dongia === 150000,
    );
    assert.ok(addedItem);
    const remove = await request(
        "DELETE",
        `/api/invoices/${mahd}/items/${addedItem.macthd}`,
        { token: adminToken },
    );
    assert.equal(remove.status, 200, JSON.stringify(remove.body));
    assert.equal(remove.body.data.tongtien, 150000);

    const pay = await request("PUT", `/api/invoices/${mahd}/pay`, {
        token: adminToken,
        body: { phuongthuctt: "TienMat" },
    });
    assert.equal(pay.status, 200, JSON.stringify(pay.body));
    assert.equal(pay.body.data.trangthaithanhtoan, "DaThanhToan");
    assert.ok(pay.body.data.ngaythanhtoan);

    const storedInvoice = await prisma.hoadon.findUnique({ where: { mahd } });
    assert.equal(Number(storedInvoice.tongtien), 150000, "Trigger phải cập nhật tổng tiền");

    // 7. Hoàn tiền một phần rồi toàn phần
    const refund1 = await request("POST", `/api/invoices/${mahd}/refund`, {
        token: adminToken,
        body: { sotien: 50000, lydo: "Hoàn một phần", phuongthuc: "TienMat" },
    });
    assert.equal(refund1.status, 200, JSON.stringify(refund1.body));
    assert.equal(refund1.body.data.tonghoantien, 50000);
    assert.equal(refund1.body.data.trangthaithanhtoan, "DaThanhToan");

    const refund2 = await request("POST", `/api/invoices/${mahd}/refund`, {
        token: adminToken,
        body: { sotien: 100000, lydo: "Hoàn phần còn lại", phuongthuc: "TienMat" },
    });
    assert.equal(refund2.status, 200, JSON.stringify(refund2.body));
    assert.equal(refund2.body.data.tonghoantien, 150000);
    assert.equal(refund2.body.data.trangthaithanhtoan, "DaHuy");

    // 8. Báo cáo doanh thu thuần = gộp - hoàn tiền
    const revenue = await request(
        "GET",
        `/api/statistics/revenue?startDate=${todayVN()}&endDate=${todayVN()}`,
        { token: adminToken },
    );
    assert.equal(revenue.status, 200);
    assert.equal(revenue.body.data.tong_doanhthu_gop, 150000);
    assert.equal(revenue.body.data.tong_hoantien, 150000);
    assert.equal(revenue.body.data.tong_doanhthu, 0);

    const invalidRevenue = await request(
        "GET",
        "/api/statistics/revenue?startDate=2026-02-31&endDate=2026-02-31",
        { token: adminToken },
    );
    assert.equal(invalidRevenue.status, 400, "Ngày không tồn tại phải bị từ chối");

    const topServices = await request(
        "GET",
        `/api/statistics/top-services?startDate=${todayVN()}&endDate=${todayVN()}`,
        { token: adminToken },
    );
    assert.equal(topServices.status, 200);
    assert.ok(topServices.body.data.data.some((row) => row.madv === 1 && row.soluong_chidinh === 1));

    // 9. RBAC + ownership: bệnh nhân không được xem lịch người khác
    const patientUsername = `bn_${stamp}`;
    const patientPassword = "Patient@123";
    const registered = await request("POST", "/api/auth/register", {
        body: {
            username: patientUsername,
            password: patientPassword,
            hoten: "Bệnh nhân Portal",
            gioitinh: "Nam",
            ngaysinh: "1990-01-01",
            sdt: phone(Number(stamp) + 2),
        },
    });
    assert.equal(registered.status, 201, JSON.stringify(registered.body));
    const patientAccount = await login(patientUsername, patientPassword);

    const forbiddenList = await request("GET", "/api/appointments", {
        token: patientAccount.accessToken,
    });
    assert.equal(forbiddenList.status, 403);

    const forbiddenDetail = await request("GET", `/api/appointments/${malh}`, {
        token: patientAccount.accessToken,
    });
    assert.equal(forbiddenDetail.status, 403);

    // 10. Khóa tài khoản có hiệu lực ngay (cache TTL = 0)
    const lock = await request(
        "PATCH",
        `/api/auth/accounts/${patientAccount.user.matk}/status`,
        { token: adminToken, body: { trangthai: "KhoaTaiKhoan" } },
    );
    assert.equal(lock.status, 200, JSON.stringify(lock.body));

    const lockedMe = await request("GET", "/api/auth/me", {
        token: patientAccount.accessToken,
    });
    assert.equal(lockedMe.status, 401);

    // 11. Refresh token rotation + phát hiện dùng lại
    const rotated = await request("POST", "/api/auth/refresh", {
        body: { refreshToken: adminRefresh },
    });
    assert.equal(rotated.status, 200, JSON.stringify(rotated.body));
    const refresh2 = rotated.body.data.refreshToken;
    assert.notEqual(refresh2, adminRefresh);

    const reuse = await request("POST", "/api/auth/refresh", {
        body: { refreshToken: adminRefresh },
    });
    assert.equal(reuse.status, 401);

    const afterReuse = await request("POST", "/api/auth/refresh", {
        body: { refreshToken: refresh2 },
    });
    assert.equal(afterReuse.status, 401, "Dùng lại token cũ phải thu hồi toàn bộ phiên");

    // 12. Quên/đặt lại mật khẩu bằng OTP dev (dùng tài khoản bác sĩ đang hoạt động)
    const forgot = await request("POST", "/api/auth/forgot-password", {
        body: { username: doctorUsername },
    });
    assert.equal(forgot.status, 200);
    assert.ok(forgot.body.data.devOtp);

    const reset = await request("POST", "/api/auth/reset-password", {
        body: {
            username: doctorUsername,
            otp: forgot.body.data.devOtp,
            newPassword: "DoctorNew@123",
        },
    });
    assert.equal(reset.status, 200, JSON.stringify(reset.body));

    const newDoctorLogin = await login(doctorUsername, "DoctorNew@123");
    assert.ok(newDoctorLogin.accessToken);

    // Tài khoản bệnh nhân đang bị khóa nên đăng nhập phải bị chặn.
    const lockedLogin = await request("POST", "/api/auth/login", {
        body: { username: patientUsername, password: patientPassword },
    });
    assert.equal(lockedLogin.status, 401);

    // 13. Health check DB/trigger/index
    const health = await request("GET", "/api/health/db");
    assert.equal(health.status, 200);
    assert.equal(health.body.data.database, true);
    assert.equal(health.body.data.triggerTinhTien, true);
    assert.equal(health.body.data.slotIndexes, true);
});
