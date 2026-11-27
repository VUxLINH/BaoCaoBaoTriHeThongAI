import { useEffect, useMemo, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { api } from '../../services/api';

function getCurrentMonthValue() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

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

function getMonthKey(value) {
  const date = getReportDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getIsoDate(value) {
  const date = getReportDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);
  const [partUsages, setPartUsages] = useState([]);
  const [partUsagesLoading, setPartUsagesLoading] = useState(true);
  const [partUsagesError, setPartUsagesError] = useState('');
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [maintenanceTasksLoading, setMaintenanceTasksLoading] = useState(true);
  const [maintenanceTasksError, setMaintenanceTasksError] = useState('');
  const [exportingMonthlyWork, setExportingMonthlyWork] = useState(false);
  const [monthlyWorkExportError, setMonthlyWorkExportError] = useState('');
  const [year, month] = selectedMonth.split('-').map(Number);

  useEffect(() => {
    let active = true;
    api.getPartUsages(year, month)
      .then((data) => {
        if (active) setPartUsages(data);
      })
      .catch((error) => {
        if (active) setPartUsagesError(error.message);
      })
      .finally(() => {
        if (active) setPartUsagesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [year, month]);

  useEffect(() => {
    let active = true;
    api.getMaintenanceTasks()
      .then((data) => {
        if (active) {
          setMaintenanceTasks(data);
          setMaintenanceTasksError('');
        }
      })
      .catch((error) => {
        if (active) setMaintenanceTasksError(error.message);
      })
      .finally(() => {
        if (active) setMaintenanceTasksLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const monthlyWorkItems = useMemo(() => {
    const completedTickets = tickets
      .filter((ticket) =>
        ticket.status === 'COMPLETED'
        && getMonthKey(ticket.completedDate) === selectedMonth
      )
      .map((ticket) => ({
        sourceType: 'Sự cố',
        sourceId: ticket.id,
        workType: 'Sửa chữa sự cố',
        completedDate: getIsoDate(ticket.completedDate),
        equipmentCode: ticket.equipmentCode,
        equipmentName: ticket.equipmentName,
        roomName: ticket.roomBadge,
        workDescription: ticket.description,
        resultNotes: ticket.rootCauseNote,
        replacedParts: ticket.replacedParts,
        technicianName: ticket.assignedTechName,
      }));
    const completedMaintenanceTasks = maintenanceTasks
      .filter((task) =>
        task.status === 'COMPLETED'
        && getMonthKey(task.completedAt) === selectedMonth
      )
      .map((task) => ({
        sourceType: 'Bảo trì định kỳ',
        sourceId: task.id,
        workType: 'Bảo trì định kỳ',
        completedDate: getIsoDate(task.completedAt),
        equipmentCode: task.equipmentCode,
        equipmentName: task.equipmentName,
        roomName: task.roomName,
        workDescription: task.notes,
        resultNotes: task.resultNotes,
        replacedParts: task.replacedParts,
        technicianName: task.technicianName,
      }));

    return [...completedTickets, ...completedMaintenanceTasks]
      .sort((left, right) => right.completedDate.localeCompare(left.completedDate));
  }, [tickets, maintenanceTasks, selectedMonth]);

  const monthlyWorkKeys = useMemo(
    () => new Set(monthlyWorkItems.map((item) => `${item.sourceType}:${item.sourceId}`)),
    [monthlyWorkItems]
  );
  const monthlyWorkUsages = partUsages.filter((usage) =>
    monthlyWorkKeys.has(`${usage.sourceType}:${usage.sourceId}`)
  );
  const unmatchedPartUsages = partUsages.filter((usage) =>
    !monthlyWorkKeys.has(`${usage.sourceType}:${usage.sourceId}`)
  );
  const monthlyWorkTotal = monthlyWorkUsages.reduce(
    (sum, usage) => sum + Math.round(Number(usage.totalCost || 0) * 100), 0
  ) / 100;
  const monthlyDeviceCount = new Set(
    monthlyWorkItems.map((item) => item.equipmentCode || item.equipmentName)
  ).size;

  const partUsagesTotal = useMemo(
    () => partUsages.reduce(
      (sum, usage) => sum + Math.round(Number(usage.totalCost || 0) * 100), 0
    ) / 100,
    [partUsages]
  );
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

  const handleExportMonthlyWork = async () => {
    setExportingMonthlyWork(true);
    setMonthlyWorkExportError('');
    let url;
    try {
      const { createMonthlyRepairWorkbook } = await import('../../utils/partsWorkbook');
      const workbook = createMonthlyRepairWorkbook(monthlyWorkItems, monthlyWorkUsages);
      const blob = new Blob([workbook], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bao_cao_thiet_bi_da_sua_${selectedMonth}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setMonthlyWorkExportError(error instanceof Error
        ? error.message
        : 'Không thể tạo tệp Excel thiết bị đã sửa.');
    } finally {
      if (url) window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setExportingMonthlyWork(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Báo cáo &amp; thống kê</h1>
        <div className="report-export-actions">
          <button type="button" className="admin-btn-light" onClick={handleExportExcel}>
            <Download size={16} />
            <span>Xuất CSV phiếu</span>
          </button>
        </div>
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
            <span><i className="legend-dot" style={{ background: '#a52e30' }} />AI tự khắc phục</span>
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

      <section className="admin-card parts-export-card">
        <div className="parts-export-heading">
          <div>
            <h3 className="admin-card-title">Thiết bị đã sửa trong tháng</h3>
            <p>Excel gồm danh sách thiết bị, chi tiết sửa chữa/bảo trì và linh kiện được ghi nhận.</p>
            <p>Excel thiết bị đã sửa gồm phiếu sự cố và bảo trì định kỳ hoàn tất; không có chi phí thì tổng tiền bằng 0.</p>
          </div>
          <FileSpreadsheet size={22} />
        </div>
        <div className="parts-export-controls">
          <label htmlFor="parts-report-month">Tháng báo cáo</label>
          <input
            id="parts-report-month"
            className="form-input"
            type="month"
            value={selectedMonth}
            onChange={(event) => {
              if (event.target.value) {
                setPartUsagesLoading(true);
                setPartUsages([]);
                setPartUsagesError('');
                setMonthlyWorkExportError('');
                setSelectedMonth(event.target.value);
              }
            }}
          />
          <button
            type="button"
            className="admin-btn-blue"
            onClick={handleExportMonthlyWork}
            disabled={
            partUsagesLoading
            || maintenanceTasksLoading
            || exportingMonthlyWork
            || Boolean(partUsagesError)
            || Boolean(maintenanceTasksError)
            || unmatchedPartUsages.length > 0
            || monthlyWorkItems.length === 0
            }
          >
            <FileSpreadsheet size={16} />
            <span>
              {partUsagesLoading || maintenanceTasksLoading
                ? 'Đang tải dữ liệu...'
                : exportingMonthlyWork
                  ? 'Đang tạo Excel...'
                  : 'Xuất Excel thiết bị đã sửa'}
            </span>
          </button>
        </div>
        {partUsagesError && <p className="auth-error-box" role="alert">{partUsagesError}</p>}
        {maintenanceTasksError && (
          <p className="auth-error-box" role="alert">{maintenanceTasksError}</p>
        )}
        {monthlyWorkExportError && (
          <p className="auth-error-box" role="alert">{monthlyWorkExportError}</p>
        )}
        {unmatchedPartUsages.length > 0 && (
          <p className="auth-error-box" role="alert">
            Không thể đối chiếu một số linh kiện với phiếu sửa chữa hoặc lịch bảo trì hoàn tất trong tháng.
          </p>
        )}
        <p className="parts-export-summary">
          {partUsagesLoading || maintenanceTasksLoading
            ? 'Đang tải danh sách công việc hoàn tất...'
            : `${monthlyDeviceCount} thiết bị · ${monthlyWorkItems.length} lượt hoàn tất · Tổng chi phí thay thế ${new Intl.NumberFormat('vi-VN').format(monthlyWorkTotal)} VNĐ`}
        </p>
        {!partUsagesError && (
          <p className="parts-export-summary">
            {partUsagesLoading
              ? 'Đang tải dữ liệu linh kiện...'
              : partUsages.length
              ? `${partUsages.length} dòng linh kiện · Tổng ${new Intl.NumberFormat('vi-VN').format(partUsagesTotal)} VNĐ`
              : 'Tháng này chưa có linh kiện được ghi nhận.'}
          </p>
        )}
      </section>
    </AdminLayout>
  );
}
