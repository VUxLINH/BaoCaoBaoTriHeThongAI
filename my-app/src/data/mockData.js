export const MOCK_EQUIPMENTS = {
  'MC-P302-01': {
    code: 'MC-P302-01',
    name: 'Máy chiếu Epson EB-X51',
    category: 'Máy chiếu',
    roomCode: 'P.302',
    roomFullName: 'Phòng 302 - Giảng đường A',
    area: 'Giảng đường A & B',
    installedDate: '15/08/2023',
    lastMaintenanceDate: '10/09/2026',
    lastRepairDate: '12/05/2026',
    status: 'Đang hoạt động',
  },
  'DH-P302-02': {
    code: 'DH-P302-02',
    name: 'Điều hòa Daikin Inverter 2HP',
    category: 'Điều hòa',
    roomCode: 'P.302',
    roomFullName: 'Phòng 302 - Giảng đường A',
    area: 'Giảng đường A & B',
    installedDate: '10/10/2023',
    lastMaintenanceDate: '01/08/2026',
    lastRepairDate: '15/04/2026',
    status: 'Đang hoạt động',
  },
  'PC-P105-12': {
    code: 'PC-P105-12',
    name: 'Case Máy tính số 12',
    category: 'Máy tính',
    roomCode: 'P.105',
    roomFullName: 'Phòng 105 - Lab Tin học',
    area: 'Lab Tin học & Tòa C',
    installedDate: '20/01/2024',
    lastMaintenanceDate: '15/08/2026',
    lastRepairDate: '02/06/2026',
    status: 'Đang sửa chữa',
  },
};

export const INITIAL_RECENT_REPORTS = [
  {
    id: 'RP-001',
    equipmentName: 'Điều hòa Daikin • Phòng 204',
    statusText: 'Đã chuyển KTV trực Nguyễn Văn B',
    type: 'warning',
  },
  {
    id: 'RP-002',
    equipmentName: 'Máy chiếu Epson • Phòng 301',
    statusText: 'Đã xử lý (Lỗi đơn giản - Tự khắc phục)',
    type: 'success',
  },
];

// Hàm mô phỏng AI phân tích lỗi (sau này sẽ thay bằng API Java Spring Boot)
export function simulateAiTriage(equipment, description) {
  const desc = description.toLowerCase();
  const isComplex =
    desc.includes('khét') ||
    desc.includes('cháy') ||
    desc.includes('aptomat') ||
    desc.includes('nước') ||
    desc.includes('chập') ||
    desc.includes('nổ') ||
    desc.includes('vỡ');

  if (isComplex) {
    return {
      severity: 'COMPLEX',
      title: 'Sự cố phức tạp - Cần Kỹ thuật viên xử lý',
      notifyTarget: 'KTV trực: Anh Nguyễn Văn B (Ca Sáng)',
      steps: [
        {
          step: 'Bước 1: Ngắt nguồn điện thiết bị',
          detail: 'Không tự ý bật lại để tránh chập cháy lan rộng.',
        },
        {
          step: 'Bước 2: Giữ nguyên hiện trường',
          detail: 'Hệ thống đã tự động gửi ảnh & vị trí phòng tới KTV đang trực khu vực.',
        },
      ],
    };
  }

  if (equipment.category === 'Máy chiếu') {
    return {
      severity: 'SIMPLE',
      title: 'Lỗi đơn giản - Có thể xử lý ngay',
      notifyTarget: 'Người báo cáo / GV',
      steps: [
        {
          step: 'Bước 1: Kiểm tra cáp HDMI / VGA',
          detail: 'Rút ra và cắm chặt lại vào cổng laptop.',
        },
        {
          step: 'Bước 2: Bấm nút Source Search',
          detail: 'Để máy chiếu tự dò lại tín hiệu hình ảnh.',
        },
        {
          step: 'Bước 3: Nhấn Windows + P',
          detail: 'Chọn chế độ "Duplicate" trên máy tính.',
        },
      ],
    };
  }

  return {
    severity: 'SIMPLE',
    title: 'Lỗi đơn giản - Có thể xử lý ngay',
    notifyTarget: 'Người báo cáo / GV',
    steps: [
      {
        step: 'Bước 1: Kiểm tra công tắc nguồn / ổ cắm',
        detail: 'Đảm bảo phích cắm chặt và ổ điện có đèn báo.',
      },
      {
        step: 'Bước 2: Khởi động lại thiết bị',
        detail: 'Tắt nguồn chờ 30 giây rồi bật lại bằng điều khiển hoặc nút cứng.',
      },
      {
        step: 'Bước 3: Kiểm tra chế độ hoạt động',
        detail: 'Đảm bảo thiết bị đang ở đúng chế độ (VD: Cool 24°C với điều hòa).',
      },
    ],
  };
}
export const INITIAL_TECH_TICKETS = [
  {
    id: 'TK-302',
    roomBadge: 'PHÒNG 302',
    equipmentCode: 'DH-P302-02',
    equipmentName: 'Điều hòa Daikin Inverter 2HP',
    installedShort: '10/2023',
    reportedTime: '09:40',
    description:
      'Máy lạnh bật 15 phút bị ngắt aptomat, có mùi khét nhẹ và chảy nước ở dàn lạnh.',
    reporterName: 'Cô Lan (GV)',
    imageBeforeUrl: null,
    imagePlaceholderText: 'Ảnh rò rỉ nước dàn lạnh',
    status: 'WAITING_TECH', // 'WAITING_TECH' | 'IN_PROGRESS' | 'COMPLETED'
    isNewAlert: true,
    acceptedAt: null,
    rootCauseNote: '',
    replacedParts: '',
    completedDate: null,
  },
  {
    id: 'TK-105',
    roomBadge: 'PHÒNG 105 - Lab Tin học',
    equipmentCode: 'PC-P105-12',
    equipmentName: 'Case máy tính số 12',
    installedShort: '01/2024',
    reportedTime: '08:35',
    description: 'Case máy tính số 12 không lên nguồn khi bấm nút mở.',
    reporterName: 'Thầy Hùng (GV)',
    imageBeforeUrl: null,
    imagePlaceholderText: 'Ảnh case máy tính bàn số 12',
    status: 'IN_PROGRESS',
    isNewAlert: false,
    acceptedAt: '08:50',
    rootCauseNote: '',
    replacedParts: '',
    completedDate: null,
  },
];
