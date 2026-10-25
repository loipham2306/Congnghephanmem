require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

let server;

// Chỉ khởi chạy HTTP listener khi chạy ở môi trường máy chủ thông thường (không phải Vercel Serverless)
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log('========================================================');
    console.log(`🏥 SERVER PHÒNG KHÁM ĐANG CHẠY THÀNH CÔNG!`);
    console.log(`📡 URL API: http://localhost:${PORT}`);
    console.log(`⏱️ Thời gian bắt đầu: ${new Date().toLocaleString('vi-VN')}`);
    console.log('========================================================');
  });

  // Bắt các lỗi bất đồng bộ chưa được xử lý để tránh crash server
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  // Đóng kết nối an toàn khi tắt server (Ctrl + C)
  process.on('SIGINT', () => {
    if (server) {
      server.close(() => {
        console.log('\n🛑 Server đã dừng an toàn.');
        process.exit(0);
      });
    }
  });
}

// Export app để Vercel Serverless Function có thể nhận diện và xử lý request
module.exports = app;