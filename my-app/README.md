# Hệ thống quản lý bảo trì thiết bị trường học

Ứng dụng gồm giao diện React/Vite, backend Java Spring Boot và cơ sở dữ liệu MySQL.

## Yêu cầu

- JDK 21
- Node.js và npm
- MySQL

## Khởi tạo cơ sở dữ liệu

Chạy `maintenance-backend/maintenance-backend/database/create-database.sql`
từ thư mục gốc dự án trong MySQL Workbench.

Backend mặc định kết nối `smartschool_db` bằng tài khoản `root` không mật khẩu.
Nếu cấu hình MySQL khác, đặt các biến môi trường `DB_URL`, `DB_USERNAME` và
`DB_PASSWORD` trước khi chạy backend.

## Chạy backend

Mở terminal tại thư mục gốc dự án:

```powershell
Set-Location .\maintenance-backend\maintenance-backend
.\mvnw.cmd spring-boot:run
```

Backend chạy ở `http://localhost:8080`. Để gọi Gemini, cấu hình biến môi trường
`GEMINI_API_KEY`; nếu không, hệ thống dùng bộ phân tích dự phòng nội bộ.

## Chạy frontend

Mở terminal khác tại thư mục gốc dự án:

```powershell
Set-Location .\my-app
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal, thường là `http://localhost:5173`.
Vite tự chuyển tiếp các request `/api` tới backend ở cổng 8080.

## Tài khoản demo

Khi bảng người dùng còn trống, backend tự tạo tài khoản demo với mật khẩu `123`:

- Admin: `admin@school.edu.vn`
- Kỹ thuật viên: `binh.ktv@school.edu.vn`
- Người báo cáo: `lan.gv@school.edu.vn`

Không dùng tài khoản và mật khẩu demo trong môi trường thật.
