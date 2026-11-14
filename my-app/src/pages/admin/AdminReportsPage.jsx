import { Download } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminReportsPage({ tickets }) {
  const handleExportExcel = () => {
    const headers = [
      'Mã phiếu',
      'Mã thiết bị',
      'Tên thiết bị',
      'Phòng',
      'Mô tả lỗi',
      'Trạng thái',
      'Ngày hoàn tất',
    ];
    const rows = tickets.map((t) => [
      t.id,
      t.equipmentCode,
      t.equipmentName,
      t.roomBadge,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status,
      t.completedDate || 'Đang xử lý',
    ]);

    // Thêm \uFEFF để Excel hiển thị chuẩn tiếng Việt UTF-8
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bao_Cao_Bao_Tri_SmartSchool.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Báo cáo Hiệu suất Xử lý &amp; Lịch sử Bảo trì
        </h1>
        <button className="admin-btn-green" onClick={handleExportExcel}>
          <Download size={16} />
          <span>Xuất Báo Cáo Excel</span>
        </button>
      </div>

      <div className="admin-two-col">
        <div className="admin-card">
          <div className="kpi-label">Thời gian phản hồi trung bình của KTV</div>
          <div className="kpi-value blue" style={{ fontSize: '36px', margin: '8px 0' }}>
            12 phút
          </div>
          <div style={{ fontSize: '12.5px', color: '#059669', fontWeight: 500 }}>
            Nhanh hơn 35% so với tháng trước nhờ AI lọc lỗi nhẹ
          </div>
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title">Tỷ lệ giải quyết sự cố trong tháng</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div style={{ color: '#1b5be0', fontWeight: 600 }}>
              • Tự sửa qua hướng dẫn AI: 82 lượt (64%)
            </div>
            <div style={{ color: '#059669', fontWeight: 600 }}>
              • KTV trực xử lý: 46 lượt (36%)
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">Bảng xếp hạng Hiệu suất Kỹ thuật viên</h3>
        <div className="ranking-list">
          <div>1. Anh Nguyễn Văn B — 24 sự cố hoàn thành — Đánh giá: 4.9/5 ★</div>
          <div>2. Anh Trần Văn C — 18 sự cố hoàn thành — Đánh giá: 4.8/5 ★</div>
        </div>
      </div>
    </AdminLayout>
  );
}