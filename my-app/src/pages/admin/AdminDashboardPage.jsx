import AdminLayout from '../../layouts/AdminLayout';

export default function AdminDashboardPage({ equipments = [], tickets = [] }) {
  const waitingCount = tickets.filter((ticket) => ticket.status === 'WAITING_TECH').length;
  const inProgressCount = tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
  const completedCount = tickets.filter((ticket) => ticket.status === 'COMPLETED').length;
  const aiResolvedCount = tickets.filter((ticket) => ticket.resolvedByAi).length;

  const stats = [
    { label: 'Tổng thiết bị', value: equipments.length, color: '' },
    { label: 'Phiếu chờ tiếp nhận', value: waitingCount, color: 'amber' },
    { label: 'Phiếu đang xử lý', value: inProgressCount, color: 'blue' },
    { label: 'Phiếu đã hoàn tất', value: completedCount, color: 'green' },
  ];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tổng quan bảo trì</h1>
      </div>

      <div className="kpi-grid">
        {stats.map((stat) => (
          <div className="kpi-card" key={stat.label}>
            <div className="kpi-label">{stat.label}</div>
            <div className={`kpi-value ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">Tình hình tiếp nhận</h3>
        <p>
          Có <strong>{waitingCount}</strong> phiếu đang chờ KTV và{' '}
          <strong>{inProgressCount}</strong> phiếu đang được xử lý.
          {aiResolvedCount > 0 && (
            <> AI đã hỗ trợ tự khắc phục <strong>{aiResolvedCount}</strong> phiếu.</>
          )}
        </p>
      </div>
    </AdminLayout>
  );
}
