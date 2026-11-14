USE smartschool_db;

-- DEMO RESET: This removes all rows from these four tables.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE shift_schedules;
TRUNCATE TABLE maintenance_reports;
TRUNCATE TABLE equipments;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (email, password, full_name, role, shift, area) VALUES
('sv.linh@dtu.edu.vn', '123456', 'Lê Trần Vũ Linh (SV)', 'REPORTER', NULL, NULL),
('gv.minh@dtu.edu.vn', '123456', 'ThS. Nguyễn Văn Minh (GV)', 'REPORTER', NULL, NULL),
('sv.thao@dtu.edu.vn', '123456', 'Trần Thị Thu Thảo (SV)', 'REPORTER', NULL, NULL),
('kt.hoang@dtu.edu.vn', '123456', 'Phạm Huy Hoàng (KTV)', 'TECHNICIAN', 'Ca Sáng (07:00 - 11:30)', 'Khu A - Giảng đường'),
('kt.tuan@dtu.edu.vn', '123456', 'Đặng Anh Tuấn (KTV)', 'TECHNICIAN', 'Ca Chiều (13:00 - 17:30)', 'Khu B - Phòng Lab'),
('kt.nam@dtu.edu.vn', '123456', 'Võ Thành Nam (KTV)', 'TECHNICIAN', 'Ca Tối (17:30 - 21:00)', 'Toàn trường'),
('admin@dtu.edu.vn', '123456', 'Nguyễn Quản Trị (Admin)', 'ADMIN', 'Hành chính', 'Toàn trường');

INSERT INTO equipments (
    code, name, category, room_code, room_full_name, area,
    installed_date, last_maintenance_date, last_repair_date, status
) VALUES
('TB-A201-MC', 'Máy chiếu Epson EB-X06', 'Thiết bị trình chiếu', 'A201', 'Phòng học A201 - Tầng 2', 'Khu A - Giảng đường', '2024-08-15', '2026-08-10', NULL, 'Đang hoạt động'),
('TB-A201-AM', 'Hệ thống Loa & Micro không dây JBL', 'Âm thanh', 'A201', 'Phòng học A201 - Tầng 2', 'Khu A - Giảng đường', '2024-08-15', '2026-08-10', '2025-11-20', 'Đang hoạt động'),
('TB-B304-PC01', 'Máy tính trạm Dell OptiPlex 7090', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', NULL, 'Đang hoạt động'),
('TB-B304-SW', 'Switch mạng Cisco Catalyst 2960', 'Thiết bị mạng', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2024-05-20', '2026-09-01', NULL, 'Đang hoạt động'),
('TB-A105-DH', 'Điều hòa âm trần Daikin 2.5HP', 'Điện lạnh', 'A105', 'Phòng học A105 - Tầng 1', 'Khu A - Giảng đường', '2023-09-01', '2026-06-15', '2025-07-10', 'Đã hỏng'),
('TB-B202-MC', 'Máy chiếu Sony VPL-DX221', 'Thiết bị trình chiếu', 'B202', 'Phòng Lab Công nghệ B202', 'Khu B - Phòng Lab', '2023-10-12', '2026-05-20', '2026-01-14', 'Đang bảo trì'),
('TB-C101-TV', 'Màn hình tương tác thông minh Samsung 75"', 'Thiết bị trình chiếu', 'C101', 'Hội trường C101', 'Khu C - Hội trường', '2025-03-01', '2026-09-15', NULL, 'Đã hỏng'),
('TB-B304-PC12', 'Máy tính trạm Dell OptiPlex 7090 #12', 'Máy tính', 'B304', 'Phòng Thực hành Lab 304', 'Khu B - Phòng Lab', '2025-01-10', '2026-09-01', '2026-10-05', 'Đang hoạt động');

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
    'TB-C101-TV', 'Màn hình tương tác thông minh Samsung 75"', 'C101',
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
    'TB-A201-AM', 'Hệ thống Loa & Micro không dây JBL', 'A201',
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
('Ca Tối (17:30 - 21:00)', 'Võ Thành Nam (KTV)', 'Toàn trường', FALSE),
('Ca Trực Hội trường', 'Phạm Huy Hoàng (KTV)', 'Khu C - Hội trường', TRUE);
