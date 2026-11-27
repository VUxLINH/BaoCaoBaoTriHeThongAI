import { useEffect, useState } from 'react';
import { CalendarDays, List, Plus, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/Pagination';
import MaintenanceCalendar from '../../components/MaintenanceCalendar';
import { paginateItems } from '../../utils/pagination';
import { api } from '../../services/api';

function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function getCurrentMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDate(value) {
  if (!value) return 'Chưa có ngày';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function formatTime(value) {
  return value ? value.slice(0, 5) : 'Chưa đặt giờ';
}

function getStatusLabel(status) {
  return {
    SCHEDULED: 'Đã lên lịch',
    ACKNOWLEDGED: 'KTV đã nhận lịch',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
  }[status] || status;
}

export default function AdminMaintenancePage({ equipments }) {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [calendarPage, setCalendarPage] = useState(1);
  const [technicians, setTechnicians] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('list');
  const [monthDate, setMonthDate] = useState(getCurrentMonth);
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    equipmentCode: '',
    technicianId: '',
    scheduledDate: getToday(),
    scheduledTime: '09:00',
    notes: '',
  });

  useEffect(() => {
    let active = true;
    Promise.all([api.getMaintenanceTasks(), api.getTechnicians()])
      .then(([taskData, technicianData]) => {
        if (!active) return;
        setTasks(taskData);
        setTechnicians(technicianData);
        setError('');
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const task = await api.createMaintenanceTask({
        ...form,
        technicianId: Number(form.technicianId),
      });
      setTasks((previous) => [...previous, task].sort((a, b) =>
        a.scheduledDate.localeCompare(b.scheduledDate)
        || (a.scheduledTime || '').localeCompare(b.scheduledTime || '')
      ));
      const [scheduledYear, scheduledMonth] = task.scheduledDate.split('-').map(Number);
      setMonthDate(new Date(scheduledYear, scheduledMonth - 1, 1));
      setSelectedDate(task.scheduledDate);
      setCalendarPage(1);
      setPage(1);
      setForm({
        equipmentCode: '',
        technicianId: '',
        scheduledDate: getToday(),
        scheduledTime: '09:00',
        notes: '',
      });
      setShowModal(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (field, value) =>
    setForm((previous) => ({ ...previous, [field]: value }));
  const handleMonthChange = (nextMonth) => {
    setMonthDate(nextMonth);
    setCalendarPage(1);
    setSelectedDate(
      `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`
    );
  };
  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);
    setCalendarPage(1);
  };

  const today = getToday();
  const displayedTasks = paginateItems(tasks, page);
  const selectedDateTasks = tasks
    .filter((task) => task.scheduledDate === selectedDate)
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  const displayedSelectedDateTasks = paginateItems(selectedDateTasks, calendarPage, 10);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Lịch bảo trì thiết bị</h1>
          <p className="shift-sync-note">
            Lên lịch kiểm tra/bảo trì và phân công kỹ thuật viên.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-light"
          onClick={() => setView((previous) => previous === 'list' ? 'calendar' : 'list')}
        >
          {view === 'list' ? <CalendarDays size={16} /> : <List size={16} />}
          <span>{view === 'list' ? 'Xem lịch tháng' : 'Xem danh sách'}</span>
        </button>
        <button
          type="button"
          className="admin-btn-blue"
          onClick={() => setShowModal(true)}
          disabled={!equipments.length || !technicians.length}
        >
          <Plus size={16} />
          <span>Lên lịch bảo trì</span>
        </button>
      </div>

      {error && <div className="auth-error-box" role="alert">{error}</div>}
      {!technicians.length && (
        <div className="auth-error-box" role="status">
          Chưa có tài khoản kỹ thuật viên để phân công lịch.
        </div>
      )}

      {view === 'calendar' ? (
        <div className="admin-card maintenance-calendar-card">
          <MaintenanceCalendar
            tasks={tasks}
            monthDate={monthDate}
            onMonthChange={handleMonthChange}
            selectedDate={selectedDate}
            onSelectDate={handleCalendarDateSelect}
          />
          <h2 className="maintenance-calendar-date">Lịch ngày {formatDate(selectedDate)}</h2>
          <div className="maintenance-task-list">
            {displayedSelectedDateTasks.map((task) => (
              <MaintenanceTaskCard
                key={task.id}
                task={task}
                today={today}
                formatDate={formatDate}
                formatTime={formatTime}
                getStatusLabel={getStatusLabel}
              />
            ))}
            {!selectedDateTasks.length && (
              <p className="maintenance-calendar-empty-state">Không có lịch bảo trì trong ngày này.</p>
            )}
            <Pagination
              totalItems={selectedDateTasks.length}
              page={calendarPage}
              onPageChange={setCalendarPage}
              pageSize={10}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="maintenance-task-list">
            {displayedTasks.map((task) => (
              <MaintenanceTaskCard
                key={task.id}
                task={task}
                today={today}
                formatDate={formatDate}
                formatTime={formatTime}
                getStatusLabel={getStatusLabel}
              />
            ))}
            {!tasks.length && !error && (
              <div className="admin-card">Chưa có lịch bảo trì. Tạo lịch đầu tiên để phân công cho KTV.</div>
            )}
          </div>
          <Pagination totalItems={tasks.length} page={page} onPageChange={setPage} />
        </>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Lên lịch bảo trì</h3>
              <button type="button" className="back-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="form-stack">
              <div className="form-group">
                <label htmlFor="maintenance-equipment">Thiết bị *</label>
                <select
                  id="maintenance-equipment"
                  className="form-input"
                  value={form.equipmentCode}
                  onChange={(event) => updateForm('equipmentCode', event.target.value)}
                  required
                >
                  <option value="">Chọn thiết bị</option>
                  {equipments.map((equipment) => (
                    <option key={equipment.code} value={equipment.code}>
                      {equipment.name} · {equipment.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="maintenance-technician">Kỹ thuật viên *</label>
                <select
                  id="maintenance-technician"
                  className="form-input"
                  value={form.technicianId}
                  onChange={(event) => updateForm('technicianId', event.target.value)}
                  required
                >
                  <option value="">Chọn KTV</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="maintenance-schedule-inputs">
                <div className="form-group">
                  <label htmlFor="maintenance-date">Ngày thực hiện *</label>
                  <input
                    id="maintenance-date"
                    type="date"
                    className="form-input"
                    value={form.scheduledDate}
                    onChange={(event) => updateForm('scheduledDate', event.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maintenance-time">Giờ bắt đầu *</label>
                  <input
                    id="maintenance-time"
                    type="time"
                    className="form-input"
                    value={form.scheduledTime}
                    onChange={(event) => updateForm('scheduledTime', event.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="maintenance-notes">Nội dung cần kiểm tra</label>
                <textarea
                  id="maintenance-notes"
                  className="form-textarea"
                  value={form.notes}
                  onChange={(event) => updateForm('notes', event.target.value)}
                  placeholder="VD: Vệ sinh bộ lọc, kiểm tra dây nguồn và ghi nhận tình trạng."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-blue" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Tạo lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function MaintenanceTaskCard({ task, today, formatDate, formatTime, getStatusLabel }) {
  const isOverdue = ['SCHEDULED', 'ACKNOWLEDGED'].includes(task.status)
    && task.scheduledDate < today;
  return (
    <article className="admin-card maintenance-task-card" key={task.id}>
      <div className="maintenance-task-heading">
        <div>
          <h2>{task.equipmentName}</h2>
          <p>{task.equipmentCode} · {task.roomName || 'Chưa có vị trí'}</p>
        </div>
        <span className={`maintenance-status ${isOverdue ? 'overdue' : task.status.toLowerCase()}`}>
          {isOverdue ? 'Quá hạn' : getStatusLabel(task.status)}
        </span>
      </div>
      <div className="maintenance-task-meta">
        <span><strong>Ngày:</strong> {formatDate(task.scheduledDate)}</span>
        <span><strong>Giờ:</strong> {formatTime(task.scheduledTime)}
          {task.durationMinutes ? ` · ${task.durationMinutes} phút` : ''}
        </span>
        <span><strong>KTV:</strong> {task.technicianName}</span>
      </div>
      {task.notes && <p className="maintenance-task-notes">{task.notes}</p>}
      {task.status === 'COMPLETED' && (
        <>
          <div className="maintenance-task-result">
            <strong>Kết quả:</strong> {task.resultNotes}
            {task.replacedParts && <p><strong>Linh kiện:</strong> {task.replacedParts}</p>}
          </div>
          {task.hasEvidenceImage && (
            <a
              className="maintenance-evidence-link"
              href={api.getMaintenanceTaskImageUrl(task.id)}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="maintenance-evidence-image"
                src={api.getMaintenanceTaskImageUrl(task.id)}
                alt={`Ảnh minh chứng bảo trì ${task.equipmentName}`}
              />
              <span>Xem ảnh minh chứng</span>
            </a>
          )}
        </>
      )}
    </article>
  );
}
