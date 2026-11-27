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

Với cơ sở dữ liệu đang sử dụng, không cần chạy lại seed hoặc xóa dữ liệu. Backend
dùng `ddl-auto=update` ở môi trường phát triển để bổ sung cột lịch và bảng ghi
nhận linh kiện khi khởi động.

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

## Lịch bảo trì và báo cáo linh kiện

- Admin vào **Lịch bảo trì** để phân công thiết bị, KTV, ngày, giờ và thời lượng;
  có thể chuyển giữa danh sách và lịch tháng.
- KTV vào **Lịch bảo trì** để xem lịch được giao, xác nhận nhận lịch rồi bắt đầu
  công việc. Khi hoàn tất, nhập kết quả và từng linh kiện đã dùng.
- Trong **Báo cáo & thống kê**, chọn tháng và xuất **Excel linh kiện**. Tệp gồm
  sheet chi tiết theo phiếu và sheet tổng hợp theo linh kiện, số lượng, đơn giá
  và thành tiền.
- Các phiếu cũ chỉ có ghi chú dạng chữ trong trường linh kiện không có đủ số
  lượng/đơn giá để đưa vào báo cáo kế toán; báo cáo chỉ gồm các dòng mới được
  ghi nhận chi tiết.

## Tài khoản demo

Khi bảng người dùng còn trống, backend tự tạo tài khoản demo với mật khẩu `123456`:

- Admin: `admin@school.edu.vn`
- Kỹ thuật viên: `binh.ktv@school.edu.vn`
- Người báo cáo: `lan.gv@school.edu.vn`

Không dùng tài khoản và mật khẩu demo trong môi trường thật.
