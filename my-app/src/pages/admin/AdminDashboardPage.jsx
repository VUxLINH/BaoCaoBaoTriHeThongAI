import AdminLayout from '../../layouts/AdminLayout';

const MONTHLY_STATS = [
  { month: 'T8', ai: 65, ktv: 40 },
  { month: 'T9', ai: 110, ktv: 52 },
  { month: 'T10', ai: 90, ktv: 60 },
  { month: 'T11', ai: 120, ktv: 48 },
];

export default function AdminDashboardPage({ equipments, tickets }) {
  const activeIssuesCount = tickets.filter((t) => t.status !== 'COMPLETED').length;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard Quản lý &amp; Bảo trì AI</h1>
      </div>

      {/* 4 Thẻ KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Tổng số thiết bị</div>
          <div className="kpi-value">{425 + equipments.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">AI tự xử lý thành công</div>
          <div className="kpi-value green">64%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Sự cố KTV đang xử lý</div>
          <div className="kpi-value amber">{5 + activeIssuesCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Cảnh báo AI sắp hỏng</div>
          <div className="kpi-value red">4 máy</div>
        </div>
      </div>

      {/* Cảnh báo Bảo trì Dự đoán AI */}
      <div className="predictive-box">
        <div className="predictive-title">
          Cảnh báo Bảo trì Dự đoán từ AI (Predictive Maintenance)
        </div>
        <ul className="predictive-list">
          <li>
            • <strong>Máy chiếu Epson EB-X51 (MC-P302-01):</strong> Hỏng 4 lần trong 60 ngày →{' '}
            <em>AI đề xuất: Thay bóng đèn chiếu hoặc bảo trì nguồn.</em>
          </li>
          <li>
            • <strong>Điều hòa Phòng 302 (DH-P302-02):</strong> Đã quá hạn bảo trì định kỳ 15 ngày →{' '}
            <em>AI đề xuất: Lên lịch vệ sinh dàn lạnh.</em>
          </li>
        </ul>
      </div>

      {/* Biểu đồ & Phòng hay lỗi nhất */}
      <div className="admin-two-col">
        <div className="admin-card">
          <h3 className="admin-card-title">Biểu đồ sự cố theo tháng (AI vs KTV)</h3>
          <div className="chart-container">
            {MONTHLY_STATS.map((item) => (
              <div key={item.month} className="chart-group">
                <div className="chart-bars">
                  <div
                    className="bar-ai"
                    style={{ height: `${item.ai}px` }}
                    title={`AI tự sửa: ${item.ai}`}
                  />
                  <div
                    className="bar-ktv"
                    style={{ height: `${item.ktv}px` }}
                    title={`KTV xử lý: ${item.ktv}`}
                  />
                </div>
                <span className="chart-label">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot" style={{ background: '#1b5be0' }} />
              AI hỗ trợ tự sửa
            </span>
            <span>
              <i className="legend-dot" style={{ background: '#10b981' }} />
              KTV trực xử lý
            </span>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title">Phòng học hay báo lỗi nhất</h3>
          <div className="ranking-list">
            <div>1. Phòng 302 - Giảng đường A (14 lượt)</div>
            <div>2. Phòng 105 - Lab Tin học (11 lượt)</div>
            <div>3. Phòng 204 - Tòa B (6 lượt)</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}