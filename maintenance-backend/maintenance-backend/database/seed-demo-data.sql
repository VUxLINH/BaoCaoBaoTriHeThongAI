USE smartschool_db;

-- DEMO RESET: Preserves all login accounts and credentials.
-- Replaces demo schedules, maintenance history, reports and equipment catalog.
-- Run only when you intend to refresh demo data; do not run against production.
DELETE FROM maintenance_part_usages;
DELETE FROM maintenance_task_images;
DELETE FROM maintenance_report_images;
DELETE FROM maintenance_tasks;
DELETE FROM maintenance_reports;
DELETE FROM shift_schedules;
DELETE FROM equipments;

-- Add the standard demo actors only when their login email does not exist.
-- Existing accounts (including passwords, names and roles) are left unchanged.
INSERT INTO users (email, password, full_name, role, shift, area) VALUES
('sv.linh@dtu.edu.vn', '123456', 'Lê Trần Vũ Linh (SV)', 'REPORTER', NULL, NULL),
('gv.minh@dtu.edu.vn', '123456', 'ThS. Nguyễn Văn Minh (GV)', 'REPORTER', NULL, NULL),
('sv.thao@dtu.edu.vn', '123456', 'Trần Thị Thu Thảo (SV)', 'REPORTER', NULL, NULL),
('kt.hoang@dtu.edu.vn', '123456', 'Phạm Huy Hoàng (KTV)', 'TECHNICIAN', 'Ca Sáng (07:00 - 11:30)', 'Khu A - Giảng đường'),
('kt.tuan@dtu.edu.vn', '123456', 'Đặng Anh Tuấn (KTV)', 'TECHNICIAN', 'Ca Chiều (13:00 - 17:30)', 'Khu B - Phòng Lab'),
('kt.nam@dtu.edu.vn', '123456', 'Võ Thành Nam (KTV)', 'TECHNICIAN', 'Ca Tối (17:30 - 21:00)', 'Toàn trường'),
('admin@dtu.edu.vn', '123456', 'Lê Trần Vũ Linh (Admin)', 'ADMIN', 'Hành chính', 'Toàn trường')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO equipments (
    code, name, category, room_code, room_full_name, area,
    installed_date, last_maintenance_date, last_repair_date, status,
    manufacturer, model, serial_number, responsible_unit, responsible_person,
    warranty_expiry_date, maintenance_interval_months, safety_notes
) VALUES
('TB-A101-MC', 'Máy chiếu Epson EB-X06', 'Thiết bị trình chiếu', 'A101', 'Phòng học A101 - Tầng 1', 'Khu A - Giảng đường', '2024-08-15', '2026-08-10', NULL, 'Đang hoạt động', 'Epson', 'EB-X06', 'DEMO-A101-MC', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2027-08-15', 6, 'Để máy nguội trước khi ngắt nguồn; không che khe thoát nhiệt.'),
('TB-A101-DH', 'Điều hòa treo tường Daikin 2HP', 'Điện lạnh', 'A101', 'Phòng học A101 - Tầng 1', 'Khu A - Giảng đường', '2023-08-20', '2026-06-15', '2025-07-10', 'Đang hoạt động', 'Daikin', 'FTKY50', 'DEMO-A101-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2026-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; xử lý nước ngưng đúng quy trình.'),
('TB-A101-AM', 'Bộ loa và micro không dây', 'Âm thanh', 'A101', 'Phòng học A101 - Tầng 1', 'Khu A - Giảng đường', '2024-08-15', '2026-08-10', NULL, 'Đang hoạt động', 'JBL', 'Wireless Classroom Set', 'DEMO-A101-AM', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2027-08-15', 6, 'Tắt ampli trước khi tháo dây loa; sạc pin đúng bộ sạc.'),
('TB-A102-MC', 'Máy chiếu BenQ MX560', 'Thiết bị trình chiếu', 'A102', 'Phòng học A102 - Tầng 1', 'Khu A - Giảng đường', '2023-08-15', '2026-07-20', NULL, 'Đang hoạt động', 'BenQ', 'MX560', 'DEMO-A102-MC', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2026-08-15', 6, 'Để máy nguội trước khi ngắt nguồn; không nhìn trực tiếp vào ống kính.'),
('TB-A102-DH', 'Điều hòa treo tường Panasonic 2HP', 'Điện lạnh', 'A102', 'Phòng học A102 - Tầng 1', 'Khu A - Giảng đường', '2022-08-20', '2026-06-20', NULL, 'Đang hoạt động', 'Panasonic', 'CU/CS-XU18', 'DEMO-A102-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2025-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; không tự ý can thiệp mạch lạnh.'),
('TB-A103-MC', 'Máy chiếu ViewSonic PA503W', 'Thiết bị trình chiếu', 'A103', 'Phòng học A103 - Tầng 1', 'Khu A - Giảng đường', '2024-01-10', '2026-08-05', NULL, 'Đang hoạt động', 'ViewSonic', 'PA503W', 'DEMO-A103-MC', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2027-01-10', 6, 'Để máy nguội trước khi ngắt nguồn; vệ sinh lọc bụi định kỳ.'),
('TB-A103-DH', 'Điều hòa treo tường Daikin 2HP', 'Điện lạnh', 'A103', 'Phòng học A103 - Tầng 1', 'Khu A - Giảng đường', '2023-08-20', '2026-06-18', NULL, 'Đang hoạt động', 'Daikin', 'FTKY50', 'DEMO-A103-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2026-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; kiểm tra thoát nước ngưng.'),
('TB-A105-DH', 'Điều hòa âm trần Daikin 2.5HP', 'Điện lạnh', 'A105', 'Phòng học A105 - Tầng 1', 'Khu A - Giảng đường', '2023-09-01', '2026-06-15', '2025-07-10', 'Đã hỏng', 'Daikin', 'FCFC71', 'DEMO-A105-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2026-09-01', 3, 'Đang hỏng: không cấp điện lại; kiểm tra hiện trường trước khi sửa.'),
('TB-A201-MC', 'Máy chiếu Epson EB-X06', 'Thiết bị trình chiếu', 'A201', 'Phòng học A201 - Tầng 2', 'Khu A - Giảng đường', '2024-08-15', '2026-08-10', NULL, 'Đang hoạt động', 'Epson', 'EB-X06', 'DEMO-A201-MC', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2027-08-15', 6, 'Để máy nguội trước khi ngắt nguồn; không che khe thoát nhiệt.'),
('TB-A201-AM', 'Hệ thống loa và micro không dây JBL', 'Âm thanh', 'A201', 'Phòng học A201 - Tầng 2', 'Khu A - Giảng đường', '2024-08-15', '2026-08-10', '2025-11-20', 'Đang hoạt động', 'JBL', 'Wireless Classroom Set', 'DEMO-A201-AM', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2027-08-15', 6, 'Tắt ampli trước khi tháo dây loa; sạc pin đúng bộ sạc.'),
('TB-A201-DH', 'Điều hòa treo tường Daikin 2HP', 'Điện lạnh', 'A201', 'Phòng học A201 - Tầng 2', 'Khu A - Giảng đường', '2023-08-20', '2026-06-15', NULL, 'Đang hoạt động', 'Daikin', 'FTKY50', 'DEMO-A201-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2026-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; không tự ý can thiệp mạch lạnh.'),
('TB-A201-BM', 'Bảng tương tác thông minh 75 inch', 'Thiết bị trình chiếu', 'A201', 'Phòng học A201 - Tầng 2', 'Khu A - Giảng đường', '2025-01-10', '2026-09-10', NULL, 'Đang hoạt động', 'Samsung', 'Flip Pro 75', 'DEMO-A201-BM', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2028-01-10', 6, 'Dùng khăn mềm; không phun dung dịch trực tiếp lên màn hình.'),
('TB-A202-MC', 'Máy chiếu Sony VPL-DX221', 'Thiết bị trình chiếu', 'A202', 'Phòng học A202 - Tầng 2', 'Khu A - Giảng đường', '2023-10-12', '2026-05-20', '2026-01-14', 'Đang bảo trì', 'Sony', 'VPL-DX221', 'DEMO-A202-MC', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2026-10-12', 6, 'Đang bảo trì: treo biển cảnh báo và không sử dụng.'),
('TB-A202-DH', 'Điều hòa treo tường Mitsubishi Electric 2HP', 'Điện lạnh', 'A202', 'Phòng học A202 - Tầng 2', 'Khu A - Giảng đường', '2022-08-20', '2026-06-25', NULL, 'Đang hoạt động', 'Mitsubishi Electric', 'MSY-GR50', 'DEMO-A202-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2025-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; kiểm tra thoát nước ngưng.'),
('TB-A203-MC', 'Máy chiếu Epson EB-W06', 'Thiết bị trình chiếu', 'A203', 'Phòng học A203 - Tầng 2', 'Khu A - Giảng đường', '2024-08-15', '2026-08-12', NULL, 'Đang hoạt động', 'Epson', 'EB-W06', 'DEMO-A203-MC', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2027-08-15', 6, 'Để máy nguội trước khi ngắt nguồn; vệ sinh lọc bụi định kỳ.'),
('TB-A203-DH', 'Điều hòa treo tường Panasonic 2HP', 'Điện lạnh', 'A203', 'Phòng học A203 - Tầng 2', 'Khu A - Giảng đường', '2023-08-20', '2026-06-22', NULL, 'Đang hoạt động', 'Panasonic', 'CU/CS-XU18', 'DEMO-A203-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2026-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; không tự ý can thiệp mạch lạnh.'),
('TB-A301-MC', 'Máy chiếu BenQ MW560', 'Thiết bị trình chiếu', 'A301', 'Phòng học A301 - Tầng 3', 'Khu A - Giảng đường', '2024-01-15', '2026-08-01', NULL, 'Đang hoạt động', 'BenQ', 'MW560', 'DEMO-A301-MC', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2027-01-15', 6, 'Để máy nguội trước khi ngắt nguồn; không nhìn trực tiếp vào ống kính.'),
('TB-A301-DH', 'Điều hòa treo tường Daikin 2HP', 'Điện lạnh', 'A301', 'Phòng học A301 - Tầng 3', 'Khu A - Giảng đường', '2023-08-20', '2026-06-28', NULL, 'Đang hoạt động', 'Daikin', 'FTKY50', 'DEMO-A301-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2026-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; kiểm tra thoát nước ngưng.'),
('TB-A302-TV', 'Tivi Samsung 65 inch', 'Thiết bị trình chiếu', 'A302', 'Phòng học A302 - Tầng 3', 'Khu A - Giảng đường', '2024-11-14', '2026-08-14', NULL, 'Đang hoạt động', 'Samsung', 'BE65T', 'DEMO-A302-TV', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2027-11-14', 6, 'Tắt nguồn trước khi vệ sinh; không tự tháo giá treo màn hình.'),
('TB-A302-DH', 'Điều hòa treo tường Panasonic 2HP', 'Điện lạnh', 'A302', 'Phòng học A302 - Tầng 3', 'Khu A - Giảng đường', '2022-08-20', '2026-06-30', NULL, 'Đang hoạt động', 'Panasonic', 'CU/CS-XU18', 'DEMO-A302-DH', 'Phòng Quản trị thiết bị', 'Phạm Huy Hoàng (KTV)', '2025-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; không tự ý can thiệp mạch lạnh.'),
('TB-B202-MC', 'Máy chiếu Sony VPL-DX221', 'Thiết bị trình chiếu', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2023-10-12', '2026-05-20', '2026-01-14', 'Đang bảo trì', 'Sony', 'VPL-DX221', 'DEMO-B202-MC', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2026-10-12', 6, 'Đang bảo trì: treo biển cảnh báo và không sử dụng.'),
('TB-B202-DH', 'Điều hòa âm trần Daikin 3HP', 'Điện lạnh', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2022-08-20', '2026-06-16', NULL, 'Đang hoạt động', 'Daikin', 'FCFC85', 'DEMO-B202-DH', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2025-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; kiểm tra thoát nước ngưng.'),
('TB-B202-PC01', 'Máy tính thực hành Dell OptiPlex', 'Máy tính', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-B202-PC01', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B202-PC02', 'Máy tính thực hành Dell OptiPlex', 'Máy tính', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-B202-PC02', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B202-PC03', 'Máy tính thực hành Dell OptiPlex', 'Máy tính', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-B202-PC03', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B202-PC04', 'Máy tính thực hành Dell OptiPlex', 'Máy tính', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-B202-PC04', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B202-PC05', 'Máy tính thực hành Dell OptiPlex', 'Máy tính', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-B202-PC05', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B202-PC06', 'Máy tính thực hành Dell OptiPlex', 'Máy tính', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-B202-PC06', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B202-PC07', 'Máy tính thực hành Dell OptiPlex', 'Máy tính', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-B202-PC07', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B202-PC08', 'Máy tính thực hành Dell OptiPlex', 'Máy tính', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-B202-PC08', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B202-SW', 'Switch mạng Cisco 24 cổng', 'Thiết bị mạng', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'Cisco', 'Catalyst 1000-24T', 'DEMO-B202-SW', 'Trung tâm CNTT', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Không tháo thiết bị khi đang cấp nguồn; giữ khe thông gió thông thoáng.'),
('TB-B202-AP', 'Bộ phát Wi-Fi Aruba', 'Thiết bị mạng', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2024-09-01', '2026-09-01', NULL, 'Đang hoạt động', 'HPE Aruba', 'AP-515', 'DEMO-B202-AP', 'Trung tâm CNTT', 'Đặng Anh Tuấn (KTV)', '2027-09-01', 6, 'Không tự khôi phục cấu hình; ghi nhận vị trí và mã thiết bị khi thay thế.'),
('TB-B304-PC01', 'Máy tính trạm Dell OptiPlex 7090', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7090', 'DEMO-B304-PC01', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2028-01-10', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B304-PC02', 'Máy tính trạm Dell OptiPlex 7090', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7090', 'DEMO-B304-PC02', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2028-01-10', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B304-PC03', 'Máy tính trạm Dell OptiPlex 7090', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7090', 'DEMO-B304-PC03', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2028-01-10', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B304-PC04', 'Máy tính trạm Dell OptiPlex 7090', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7090', 'DEMO-B304-PC04', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2028-01-10', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B304-PC05', 'Máy tính trạm Dell OptiPlex 7090', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7090', 'DEMO-B304-PC05', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2028-01-10', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B304-PC06', 'Máy tính trạm Dell OptiPlex 7090', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7090', 'DEMO-B304-PC06', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2028-01-10', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B304-PC12', 'Máy tính trạm Dell OptiPlex 7090 #12', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', '2026-10-05', 'Đang hoạt động', 'Dell', 'OptiPlex 7090', 'DEMO-B304-PC12', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2028-01-10', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-B304-SW', 'Switch mạng Cisco Catalyst 2960', 'Thiết bị mạng', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2024-05-20', '2026-09-01', NULL, 'Đang hoạt động', 'Cisco', 'Catalyst 2960', 'DEMO-B304-SW', 'Trung tâm CNTT', 'Đặng Anh Tuấn (KTV)', '2027-05-20', 6, 'Không tháo thiết bị khi đang cấp nguồn; giữ khe thông gió thông thoáng.'),
('TB-B304-UPS', 'Bộ lưu điện cho tủ mạng', 'Nguồn điện dự phòng', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2024-05-20', '2026-06-01', NULL, 'Đang hoạt động', 'APC', 'Smart-UPS 1500VA', 'DEMO-B304-UPS', 'Trung tâm CNTT', 'Đặng Anh Tuấn (KTV)', '2027-05-20', 6, 'Không mở vỏ; pin lưu điện cần được xử lý theo quy định an toàn.'),
('TB-B305-PR', 'Máy in laser HP LaserJet Pro', 'Thiết bị văn phòng', 'B305', 'Phòng in và hỗ trợ Lab B305', 'Khu B - Phòng Lab', '2023-06-01', '2026-07-01', NULL, 'Đang hoạt động', 'HP', 'LaserJet Pro M404dn', 'DEMO-B305-PR', 'Khoa Công nghệ thông tin', 'Đặng Anh Tuấn (KTV)', '2026-06-01', 6, 'Chờ máy nguội trước khi thay hộp mực; không chạm cụm sấy.'),
('TB-C101-TV', 'Màn hình tương tác thông minh Samsung 75 inch', 'Thiết bị trình chiếu', 'C101', 'Hội trường C101', 'Khu C - Hội trường', '2025-03-01', '2026-09-15', NULL, 'Đã hỏng', 'Samsung', 'Flip Pro 75', 'DEMO-C101-TV', 'Phòng Quản trị thiết bị', 'Võ Thành Nam (KTV)', '2028-03-01', 6, 'Đang hỏng: cô lập nguồn; không tự tháo màn hình hoặc giá treo.'),
('TB-C101-AM', 'Hệ thống âm thanh hội trường', 'Âm thanh', 'C101', 'Hội trường C101', 'Khu C - Hội trường', '2024-02-01', '2026-08-15', NULL, 'Đang hoạt động', 'Yamaha', 'StagePas 600BT', 'DEMO-C101-AM', 'Phòng Công tác sinh viên', 'Võ Thành Nam (KTV)', '2027-02-01', 6, 'Tắt ampli trước khi tháo dây; cố định dây dẫn để tránh vấp ngã.'),
('TB-C101-MIC', 'Bộ micro không dây hội trường', 'Âm thanh', 'C101', 'Hội trường C101', 'Khu C - Hội trường', '2024-02-01', '2026-08-15', NULL, 'Đang hoạt động', 'Shure', 'BLX288', 'DEMO-C101-MIC', 'Phòng Công tác sinh viên', 'Võ Thành Nam (KTV)', '2027-02-01', 6, 'Tháo pin khi lưu kho dài ngày; kiểm tra tần số trước sự kiện.'),
('TB-C101-DH', 'Điều hòa âm trần Daikin 5HP', 'Điện lạnh', 'C101', 'Hội trường C101', 'Khu C - Hội trường', '2022-08-20', '2026-06-12', NULL, 'Đang hoạt động', 'Daikin', 'FCFC140', 'DEMO-C101-DH', 'Phòng Quản trị thiết bị', 'Võ Thành Nam (KTV)', '2025-08-20', 3, 'Ngắt aptomat trước khi bảo trì; sử dụng thang phù hợp khi tiếp cận trần.'),
('TB-LIB-AP01', 'Điểm truy cập Wi-Fi thư viện', 'Thiết bị mạng', 'LIB-01', 'Thư viện - Tầng 1', 'Khu D - Thư viện', '2024-01-15', '2026-07-15', NULL, 'Đang hoạt động', 'HPE Aruba', 'AP-515', 'DEMO-LIB-AP01', 'Trung tâm CNTT', 'Đặng Anh Tuấn (KTV)', '2027-01-15', 6, 'Không tự khôi phục cấu hình mạng; ghi lại vị trí khi thay thế.'),
('TB-LIB-PR01', 'Máy in đa chức năng thư viện', 'Thiết bị văn phòng', 'LIB-PR', 'Thư viện - Quầy dịch vụ', 'Khu D - Thư viện', '2023-05-01', '2026-07-01', NULL, 'Đang hoạt động', 'Brother', 'MFC-L6900DW', 'DEMO-LIB-PR01', 'Trung tâm Thư viện', 'Võ Thành Nam (KTV)', '2026-05-01', 6, 'Chờ cụm sấy nguội trước khi xử lý kẹt giấy hoặc thay mực.'),
('TB-ADM-PR01', 'Máy in laser phòng hành chính', 'Thiết bị văn phòng', 'ADM-PR', 'Phòng Hành chính - Tầng 1', 'Khu E - Hành chính', '2023-05-01', '2026-07-05', NULL, 'Đang hoạt động', 'HP', 'LaserJet Pro M404dn', 'DEMO-ADM-PR01', 'Phòng Hành chính', 'Võ Thành Nam (KTV)', '2026-05-01', 6, 'Chờ máy nguội trước khi thay hộp mực; không chạm cụm sấy.'),
('TB-ADM-PC01', 'Máy tính văn phòng Dell OptiPlex', 'Máy tính', 'ADM-01', 'Phòng Hành chính - Tầng 1', 'Khu E - Hành chính', '2024-06-01', '2026-08-01', NULL, 'Đang hoạt động', 'Dell', 'OptiPlex 7010', 'DEMO-ADM-PC01', 'Phòng Hành chính', 'Võ Thành Nam (KTV)', '2027-06-01', 6, 'Ngắt nguồn và rút điện trước khi mở thùng máy.'),
('TB-CLN-FR01', 'Tủ lạnh bảo quản thuốc phòng y tế', 'Thiết bị y tế', 'CLN-01', 'Phòng Y tế học đường', 'Khu E - Y tế', '2024-04-01', '2026-08-01', NULL, 'Đang hoạt động', 'Panasonic', 'NR-BL300', 'DEMO-CLN-FR01', 'Phòng Y tế học đường', 'Võ Thành Nam (KTV)', '2027-04-01', 3, 'Không rút nguồn khi đang bảo quản thuốc; báo nhân viên y tế trước khi di chuyển.'),
('TB-CLN-AC01', 'Điều hòa treo tường phòng y tế', 'Điện lạnh', 'CLN-01', 'Phòng Y tế học đường', 'Khu E - Y tế', '2023-08-20', '2026-06-18', NULL, 'Đang hoạt động', 'Daikin', 'FTKY35', 'DEMO-CLN-AC01', 'Phòng Y tế học đường', 'Võ Thành Nam (KTV)', '2026-08-20', 3, 'Ngắt aptomat trước khi vệ sinh; phối hợp nhân viên y tế khi thao tác.'),
('TB-CAN-REF01', 'Tủ mát lưu trữ thực phẩm căn tin', 'Thiết bị nhà ăn', 'CAN-01', 'Căn tin - Khu sơ chế', 'Khu F - Căn tin', '2023-06-01', '2026-06-10', NULL, 'Đang hoạt động', 'Sanaky', 'VH-6009HP', 'DEMO-CAN-REF01', 'Bộ phận Căn tin', 'Võ Thành Nam (KTV)', '2026-06-01', 3, 'Không vệ sinh bằng vòi nước áp lực; phối hợp nhân viên căn tin khi di chuyển thực phẩm.'),
('TB-GYM-PA01', 'Hệ thống loa phát thanh nhà đa năng', 'Âm thanh', 'GYM-01', 'Nhà đa năng - Khu sân tập', 'Khu G - Nhà đa năng', '2024-02-01', '2026-08-15', NULL, 'Đang hoạt động', 'TOA', 'A-2120', 'DEMO-GYM-PA01', 'Phòng Công tác sinh viên', 'Võ Thành Nam (KTV)', '2027-02-01', 6, 'Tắt ampli trước khi đấu nối; tránh thao tác khi khu vực đang có hoạt động.'),
('TB-SEC-CAM01', 'Camera giám sát cổng chính', 'An ninh và giám sát', 'SEC-GATE', 'Cổng chính - Nhà bảo vệ', 'Khuôn viên trường', '2024-01-05', '2026-07-05', NULL, 'Đang hoạt động', 'Hikvision', 'DS-2CD2143G2', 'DEMO-SEC-CAM01', 'Phòng Bảo vệ', 'Võ Thành Nam (KTV)', '2027-01-05', 6, 'Không hướng camera vào khu vực riêng tư; ngắt PoE trước khi tháo lắp.'),
('TB-SEC-NVR01', 'Đầu ghi camera an ninh', 'An ninh và giám sát', 'SEC-ROOM', 'Phòng trực bảo vệ', 'Khuôn viên trường', '2024-01-05', '2026-07-05', NULL, 'Đang hoạt động', 'Hikvision', 'DS-7732NI', 'DEMO-SEC-NVR01', 'Phòng Bảo vệ', 'Võ Thành Nam (KTV)', '2027-01-05', 6, 'Không ngắt nguồn đột ngột; hạn chế truy cập dữ liệu ghi hình theo phân quyền.'),
('TB-SEC-UPS01', 'Bộ lưu điện tủ camera', 'Nguồn điện dự phòng', 'SEC-ROOM', 'Phòng trực bảo vệ', 'Khuôn viên trường', '2024-01-05', '2026-06-05', NULL, 'Đang hoạt động', 'APC', 'Back-UPS 1200VA', 'DEMO-SEC-UPS01', 'Phòng Bảo vệ', 'Võ Thành Nam (KTV)', '2027-01-05', 6, 'Không mở vỏ thiết bị; pin cần được xử lý theo quy định an toàn.'),
('TB-NET-SW01', 'Switch lõi mạng khu A', 'Thiết bị mạng', 'NET-A', 'Tủ mạng trung tâm khu A', 'Khu A - Giảng đường', '2023-03-15', '2026-09-01', NULL, 'Đang hoạt động', 'Cisco', 'Catalyst 9200L', 'DEMO-NET-SW01', 'Trung tâm CNTT', 'Đặng Anh Tuấn (KTV)', '2026-03-15', 6, 'Không rút cáp uplink khi chưa được phê duyệt; duy trì thông gió tủ mạng.'),
('TB-NET-UPS01', 'Bộ lưu điện tủ mạng khu A', 'Nguồn điện dự phòng', 'NET-A', 'Tủ mạng trung tâm khu A', 'Khu A - Giảng đường', '2023-03-15', '2026-06-01', NULL, 'Đang hoạt động', 'APC', 'Smart-UPS 2200VA', 'DEMO-NET-UPS01', 'Trung tâm CNTT', 'Đặng Anh Tuấn (KTV)', '2026-03-15', 6, 'Không mở vỏ hoặc chạm đầu cực pin; kiểm tra tải cùng cán bộ CNTT.'),
('TB-WTR-PMP01', 'Bơm cấp nước khu giảng đường', 'Hệ thống cấp thoát nước', 'TECH-WTR', 'Phòng kỹ thuật cấp nước', 'Khuôn viên trường', '2022-06-01', '2026-05-15', NULL, 'Đang hoạt động', 'Pentax', 'CM 100/00', 'DEMO-WTR-PMP01', 'Phòng Quản trị cơ sở vật chất', 'Võ Thành Nam (KTV)', '2025-06-01', 3, 'Ngắt điện và khóa van trước bảo trì; cảnh báo khu vực sàn ướt.'),
('TB-FIR-ALM01', 'Tủ trung tâm báo cháy khu A', 'Phòng cháy chữa cháy', 'FIR-A', 'Tủ kỹ thuật PCCC khu A', 'Khu A - Giảng đường', '2023-01-15', '2026-07-01', NULL, 'Đang hoạt động', 'Hochiki', 'FireNET Plus', 'DEMO-FIR-ALM01', 'Phòng Quản trị cơ sở vật chất', 'Võ Thành Nam (KTV)', '2026-01-15', 3, 'Chỉ kỹ thuật viên được phân công thao tác; không vô hiệu hóa vùng báo cháy khi chưa có phương án.'),
('TB-LFT-CTRL01', 'Bộ điều khiển thang máy khu A', 'Hệ thống thang máy', 'LIFT-A', 'Phòng máy thang máy khu A', 'Khu A - Giảng đường', '2022-01-10', '2026-07-10', NULL, 'Đang hoạt động', 'Schindler', 'Controller Set', 'DEMO-LFT-CTRL01', 'Phòng Quản trị cơ sở vật chất', 'Võ Thành Nam (KTV)', '2025-01-10', 1, 'Chỉ đơn vị bảo trì thang máy được cấp phép thao tác; cô lập và khóa nguồn trước khi vào phòng máy.');

INSERT INTO maintenance_reports (
    equipment_code, equipment_name, room_badge, description, reporter_name, reported_time,
    ai_severity, resolved_by_ai, status, assigned_tech_name, accepted_at,
    root_cause_note, replaced_parts, completed_date
) VALUES
(
    'TB-A105-DH', 'Điều hòa âm trần Daikin 2.5HP', 'A105',
    'Điều hòa bật 15 phút thì tự ngắt, đèn timer nhấp nháy liên tục và chảy nước xuống bàn sinh viên.',
    'ThS. Nguyễn Văn Minh (GV)', '14/11/2026 08:15',
    'COMPLEX', FALSE, 'WAITING_TECH', NULL, NULL, NULL, NULL, NULL
),
(
    'TB-C101-TV', 'Màn hình tương tác thông minh Samsung 75 inch', 'C101',
    'Màn hình có mùi khét nhẹ ở mặt sau và không lên nguồn dù đã kiểm tra ổ cắm điện hội trường.',
    'Lê Trần Vũ Linh (SV)', '14/11/2026 09:30',
    'COMPLEX', FALSE, 'WAITING_TECH', NULL, NULL, NULL, NULL, NULL
),
(
    'TB-B202-MC', 'Máy chiếu Sony VPL-DX221', 'B202',
    'Hình ảnh chiếu lên bị mờ nhòe, ám vàng nặng và quạt tản nhiệt kêu rất to.',
    'Trần Thị Thu Thảo (SV)', '14/11/2026 07:45',
    'SIMPLE', FALSE, 'IN_PROGRESS', 'Đặng Anh Tuấn (KTV)', '14/11/2026 08:00',
    'Bụi bám dày làm kẹt trục quạt tản nhiệt và suy hao bóng đèn chiếu sau 3000 giờ sử dụng.',
    'Vệ sinh cụm quang học, thay quạt tản nhiệt 12V', NULL
),
(
    'TB-B304-PC12', 'Máy tính trạm Dell OptiPlex 7090 #12', 'B304',
    'Máy bật lên kêu 3 tiếng bíp liên tục, màn hình đen không vào được Windows.',
    'Lê Trần Vũ Linh (SV)', '12/11/2026 14:20',
    'SIMPLE', FALSE, 'COMPLETED', 'Đặng Anh Tuấn (KTV)', '12/11/2026 14:35',
    'Lỏng chân thanh RAM DDR4 8GB do rung động.',
    'Vệ sinh khe cắm RAM, cố định lại thanh RAM', '12/11/2026 15:10'
),
(
    'TB-A201-AM', 'Hệ thống loa và micro không dây JBL', 'A201',
    'Micro cầm tay bị rè tiếng và mất sóng khi giảng viên di chuyển xuống cuối lớp.',
    'ThS. Nguyễn Văn Minh (GV)', '10/11/2026 09:00',
    'SIMPLE', FALSE, 'COMPLETED', 'Phạm Huy Hoàng (KTV)', '10/11/2026 09:15',
    'Pin sạc của micro bị chai và lệch tần số thu phát với đầu thu.',
    'Thay cặp pin sạc AA mới, đồng bộ lại tần số kênh A', '10/11/2026 09:40'
),
(
    'TB-A201-MC', 'Máy chiếu Epson EB-X06', 'A201',
    'Cắm cáp HDMI từ laptop vào máy chiếu nhưng màn chiếu báo No Signal.',
    'Lê Trần Vũ Linh (SV)', '13/11/2026 13:15',
    'SIMPLE', TRUE, 'COMPLETED', 'AI Assistant (Tự khắc phục)', '13/11/2026 13:16',
    'Người dùng chưa chuyển cổng tín hiệu đầu vào (Source) trên remote sang HDMI1.',
    'Không cần thay thế linh kiện', '13/11/2026 13:18'
);

INSERT INTO shift_schedules (shift_name, tech_name, area, is_online) VALUES
('Ca Sáng (07:00 - 11:30)', 'Phạm Huy Hoàng (KTV)', 'Khu A - Giảng đường', TRUE),
('Ca Chiều (13:00 - 17:30)', 'Đặng Anh Tuấn (KTV)', 'Khu B - Phòng Lab', TRUE),
('Ca Tối (17:30 - 21:00)', 'Võ Thành Nam (KTV)', 'Toàn trường', FALSE);
