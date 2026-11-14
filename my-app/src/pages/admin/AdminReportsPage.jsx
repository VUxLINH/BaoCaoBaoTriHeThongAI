import { Download } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

function getReportDate(value) {
  if (typeof value !== 'string') return null;

  const localDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (localDate) {
    const [, day, month, year] = localDate;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return null;
}

function getMonthlyStats(tickets) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      label: `T${date.getMonth() + 1}`,
      ai: 0,
      technician: 0,
    };
  });
  const byMonth = new Map(months.map((month) => [`${month.year}-${month.month}`, month]));

  tickets.forEach((ticket) => {
    const date = getReportDate(ticket.reportedTime);
    if (!date) return;

    const month = byMonth.get(`${date.getFullYear()}-${date.getMonth()}`);
    if (!month) return;
    if (ticket.resolvedByAi) month.ai += 1;
    else month.technician += 1;
  });

  return months;
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item);
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());
}

function statusLabel(status) {
  return {
    WAITING_TECH: 'Chờ KTV',
    IN_PROGRESS: 'Đang xử lý',
    COMPLETED: 'Hoàn tất',
  }[status] || status || '';
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export default function AdminReportsPage({ tickets = [] }) {
  const total = tickets.length;
  const completed = tickets.filter((ticket) => ticket.status === 'COMPLETED').length;
  const aiResolved = tickets.filter((ticket) => ticket.resolvedByAi).length;
  const openCount = tickets.filter((ticket) =>
    ['WAITING_TECH', 'IN_PROGRESS'].includes(ticket.status)
  ).length;
  const percent = (count) => (total ? `${Math.round((count / total) * 100)}%` : '0%');
  const monthlyStats = getMonthlyStats(tickets);
  const maxMonthlyCount = Math.max(
    1,
    ...monthlyStats.map((month) => month.ai + month.technician)
  );

  const roomRanking = [...countBy(tickets, (ticket) => ticket.roomBadge || 'Chưa rõ phòng')]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const technicianReports = tickets.filter(
    (ticket) => ticket.status === 'COMPLETED' && !ticket.resolvedByAi
  );
  const technicianRanking = [...countBy(
    technicianReports,
    (ticket) => ticket.assignedTechName
  )]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleExportExcel = () => {
    const headers = [
      'Mã phiếu',
      'Mã thiết bị',
      'Tên thiết bị',
      'Phòng',
      'Mô tả lỗi',
      'Trạng thái',
      'Ngày báo',
      'Ngày hoàn tất',
      'KTV phụ trách',
    ];
    const rows = tickets.map((ticket) => [
      ticket.id,
      ticket.equipmentCode,
      ticket.equipmentName,
      ticket.roomBadge,
      ticket.description,
      statusLabel(ticket.status),
      ticket.reportedTime,
      ticket.completedDate,
      ticket.assignedTechName,
    ]);
    const csvContent =
      '\uFEFF' +
      [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bao_Cao_Bao_Tri_SmartSchool.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Báo cáo &amp; thống kê</h1>
        <button className="admin-btn-green" onClick={handleExportExcel}>
          <Download size={16} />
          <span>Xuất CSV</span>
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Tổng phiếu</div>
          <div className="kpi-value">{total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Đã hoàn tất</div>
          <div className="kpi-value green">{completed} ({percent(completed)})</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Đang chờ / xử lý</div>
          <div className="kpi-value amber">{openCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">AI tự khắc phục</div>
          <div className="kpi-value blue">{aiResolved} ({percent(aiResolved)})</div>
        </div>
      </div>

      <div className="admin-two-col">
        <div className="admin-card">
          <h3 className="admin-card-title">Phiếu báo theo tháng (6 tháng gần nhất)</h3>
          <div className="chart-container">
            {monthlyStats.map((month) => {
              const aiHeight = (month.ai / maxMonthlyCount) * 120;
              const technicianHeight = (month.technician / maxMonthlyCount) * 120;
              return (
                <div key={`${month.year}-${month.month}`} className="chart-group">
                  <div className="chart-bars">
                    <div
                      className="bar-ai"
                      style={{ height: `${aiHeight}px` }}
                      title={`AI tự khắc phục: ${month.ai}`}
                    />
                    <div
                      className="bar-ktv"
                      style={{ height: `${technicianHeight}px` }}
                      title={`Chuyển KTV: ${month.technician}`}
                    />
                  </div>
                  <span className="chart-label">{month.label}</span>
                </div>
              );
            })}
          </div>
          <div className="chart-legend">
            <span><i className="legend-dot" style={{ background: '#1b5be0' }} />AI tự khắc phục</span>
            <span><i className="legend-dot" style={{ background: '#10b981' }} />Chuyển KTV</span>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title">Phòng có nhiều phiếu nhất</h3>
          {roomRanking.length ? (
            <div className="ranking-list">
              {roomRanking.map(([room, count], index) => (
                <div key={room}>{index + 1}. {room} — {count} phiếu</div>
              ))}
            </div>
          ) : <p>Chưa có dữ liệu phiếu.</p>}
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">KTV có nhiều phiếu hoàn tất nhất</h3>
        {technicianRanking.length ? (
          <div className="ranking-list">
            {technicianRanking.map(([name, count], index) => (
              <div key={name}>{index + 1}. {name} — {count} phiếu hoàn tất</div>
            ))}
          </div>
        ) : <p>Chưa có phiếu hoàn tất do KTV xử lý.</p>}
      </div>
    </AdminLayout>
  );
}
