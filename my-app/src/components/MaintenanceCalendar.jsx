import { ChevronLeft, ChevronRight } from 'lucide-react';

function toDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export default function MaintenanceCalendar({
  tasks,
  monthDate,
  onMonthChange,
  selectedDate,
  onSelectDate,
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const taskCounts = tasks.reduce((counts, task) => {
    counts.set(task.scheduledDate, (counts.get(task.scheduledDate) || 0) + 1);
    return counts;
  }, new Map());
  const cellCount = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  const monthLabel = new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(monthDate);

  return (
    <section className="maintenance-calendar" aria-label="Lịch bảo trì theo tháng">
      <div className="maintenance-calendar-heading">
        <button
          type="button"
          className="calendar-month-button"
          aria-label="Tháng trước"
          onClick={() => onMonthChange(new Date(year, month - 1, 1))}
        >
          <ChevronLeft size={18} />
        </button>
        <h2>{monthLabel}</h2>
        <button
          type="button"
          className="calendar-month-button"
          aria-label="Tháng sau"
          onClick={() => onMonthChange(new Date(year, month + 1, 1))}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="maintenance-calendar-grid">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
          <span className="maintenance-calendar-weekday" key={day}>{day}</span>
        ))}
        {Array.from({ length: cellCount }, (_, index) => {
          const day = index - firstDayOffset + 1;
          if (day < 1 || day > daysInMonth) {
            return <span className="maintenance-calendar-empty" key={`empty-${index}`} />;
          }
          const date = toDateKey(new Date(year, month, day));
          const count = taskCounts.get(date) || 0;
          return (
            <button
              type="button"
              key={date}
              className={`maintenance-calendar-day${selectedDate === date ? ' selected' : ''}${count ? ' has-tasks' : ''}`}
              onClick={() => onSelectDate(date)}
              aria-pressed={selectedDate === date}
              aria-label={`${day} tháng ${month + 1}, ${count} lịch bảo trì`}
            >
              <span>{day}</span>
              {count > 0 && <small>{count}</small>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
