import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import MaintenanceCalendar from '../../components/MaintenanceCalendar';
import Pagination from '../../components/Pagination';
import { paginateItems } from '../../utils/pagination';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

function getToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getCurrentMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function statusLabel(status) {
  return {
    SCHEDULED: 'Chờ xác nhận',
    ACKNOWLEDGED: 'Đã nhận lịch',
    IN_PROGRESS: 'Đang thực hiện',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
  }[status] || status;
}

export default function TechMaintenanceCalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [dayPage, setDayPage] = useState(1);
  const [monthDate, setMonthDate] = useState(getCurrentMonth);
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [error, setError] = useState('');
  const [actionTaskId, setActionTaskId] = useState(null);

  useEffect(() => {
    let active = true;
    api.getMaintenanceTasks()
      .then((data) => {
        if (active) {
          setTasks(data.filter((task) => task.technicianId === Number(user?.id)));
          setError('');
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const monthTasks = useMemo(() => {
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    return tasks.filter((task) => task.scheduledDate?.startsWith(monthKey));
  }, [monthDate, tasks]);
  const selectedTasks = monthTasks
    .filter((task) => task.scheduledDate === selectedDate)
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  const displayedSelectedTasks = paginateItems(selectedTasks, dayPage, 6);
  const handleMonthChange = (nextMonth) => {
    setMonthDate(nextMonth);
    setDayPage(1);
    setSelectedDate(
      `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`
    );
  };
  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);
    setDayPage(1);
  };

  const updateTask = async (task, action) => {
    setActionTaskId(task.id);
    setError('');
    try {
      const updated = action === 'acknowledge'
        ? await api.acknowledgeMaintenanceTask(task.id)
        : await api.startMaintenanceTask(task.id);
      setTasks((previous) =>
        previous.map((item) => item.id === updated.id ? updated : item)
      );
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActionTaskId(null);
    }
  };

  return (
    <MobileAppLayout>
      <header className="white-topbar maintenance-calendar-topbar">
        <button type="button" className="back-btn" onClick={() => navigate('/tech')}>
          <ChevronLeft size={20} />
        </button>
        <h2>Lịch bảo trì</h2>
        <span />
      </header>
      <main className="screen-body tech-calendar-body">
        <p className="tech-calendar-intro">
          Theo dõi lịch được giao, xác nhận tiếp nhận và bắt đầu công việc.
        </p>
        {error && <p className="auth-error-box" role="alert">{error}</p>}
        <MaintenanceCalendar
          tasks={monthTasks}
          monthDate={monthDate}
          onMonthChange={handleMonthChange}
          selectedDate={selectedDate}
          onSelectDate={handleCalendarDateSelect}
        />
        <h3 className="section-heading">Ngày {formatDate(selectedDate)}</h3>
        {displayedSelectedTasks.map((task) => (
          <article className="ticket-card maintenance-tech-card" key={task.id}>
            <div className="maintenance-task-heading">
              <div>
                <h3>{task.equipmentName}</h3>
                <p>{task.equipmentCode} · {task.roomName || 'Chưa có vị trí'}</p>
              </div>
              <span className={`maintenance-status ${task.status.toLowerCase()}`}>
                {statusLabel(task.status)}
              </span>
            </div>
            <p className="ticket-meta">
              {task.scheduledTime ? task.scheduledTime.slice(0, 5) : 'Chưa đặt giờ'}
              {task.durationMinutes ? ` · ${task.durationMinutes} phút` : ''}
              {' · '}{task.technicianName}
            </p>
            {task.notes && <p className="maintenance-task-notes">{task.notes}</p>}
            {task.status === 'SCHEDULED' && (
              <button
                type="button"
                className="btn-primary"
                disabled={actionTaskId === task.id}
                onClick={() => updateTask(task, 'acknowledge')}
              >
                {actionTaskId === task.id ? 'Đang cập nhật...' : 'Xác nhận nhận lịch'}
              </button>
            )}
            {task.status === 'ACKNOWLEDGED' && (
              <button
                type="button"
                className="btn-primary"
                disabled={actionTaskId === task.id}
                onClick={() => updateTask(task, 'start')}
              >
                {actionTaskId === task.id ? 'Đang cập nhật...' : 'Bắt đầu bảo trì'}
              </button>
            )}
            {task.status === 'IN_PROGRESS' && (
              <button
                type="button"
                className="btn-success"
                onClick={() => navigate('/tech')}
              >
                Mở bảng công việc để hoàn tất
              </button>
            )}
          </article>
        ))}
        {!selectedTasks.length && (
          <div className="ticket-card maintenance-calendar-empty-state">
            Không có lịch bảo trì được giao trong ngày này.
          </div>
        )}
        <Pagination
          totalItems={selectedTasks.length}
          page={dayPage}
          onPageChange={setDayPage}
          pageSize={6}
        />
      </main>
    </MobileAppLayout>
  );
}
