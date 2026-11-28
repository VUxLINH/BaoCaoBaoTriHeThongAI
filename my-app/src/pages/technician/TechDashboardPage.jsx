import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CalendarDays, ChevronDown, LogOut } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import Pagination from '../../components/Pagination';
import PartUsageFields from '../../components/PartUsageFields';
import { paginateItems } from '../../utils/pagination';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

function getTodayDateKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDaysToDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
  const formattedDay = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${formattedMonth}-${formattedDay}`;
}

export default function TechDashboardPage({ tickets, onAcceptTicket }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [presenceError, setPresenceError] = useState('');
  const [updatingPresence, setUpdatingPresence] = useState(false);
  const [acceptingTicketId, setAcceptingTicketId] = useState(null);
  const [ticketActionError, setTicketActionError] = useState('');
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [maintenanceAttentionPage, setMaintenanceAttentionPage] = useState(1);
  const [waitingPage, setWaitingPage] = useState(1);
  const [inProgressPage, setInProgressPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [showCompletedTickets, setShowCompletedTickets] = useState(false);
  const [maintenanceError, setMaintenanceError] = useState('');
  const [maintenanceActionError, setMaintenanceActionError] = useState('');
  const [activeMaintenanceTask, setActiveMaintenanceTask] = useState(null);
  const [maintenanceResult, setMaintenanceResult] = useState('');
  const [maintenanceParts, setMaintenanceParts] = useState([]);
  const [maintenanceEvidenceFile, setMaintenanceEvidenceFile] = useState(null);
  const [maintenanceEvidencePreview, setMaintenanceEvidencePreview] = useState(null);
  const evidencePreviewUrl = useRef(null);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [today, setToday] = useState(getTodayDateKey);

  useEffect(() => {
    let active = true;
    api.getMaintenanceTasks()
      .then((data) => {
        if (active) {
          setMaintenanceTasks(data);
          setMaintenanceError('');
          setMaintenanceLoading(false);
        }
      })
      .catch((error) => {
        if (active) {
          setMaintenanceError(error.message);
          setMaintenanceLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setToday(getTodayDateKey()), 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => () => {
    if (evidencePreviewUrl.current) {
      URL.revokeObjectURL(evidencePreviewUrl.current);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadShifts = async () => {
      try {
        const data = await api.getShifts();
        if (active) {
          setShifts(data);
          setPresenceError('');
        }
      } catch (error) {
        if (active) setPresenceError(error.message);
      }
    };

    loadShifts();
    const intervalId = window.setInterval(loadShifts, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const waitingTickets = tickets.filter((t) => t.status === 'WAITING_TECH');
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS');
  const completedTickets = tickets.filter((t) => t.status === 'COMPLETED');
  const myMaintenanceTasks = maintenanceTasks
    .filter((task) => task.technicianId === Number(user?.id)
      && ['SCHEDULED', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(task.status))
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)
      || (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  const todayMaintenanceTasks = myMaintenanceTasks
    .filter((task) => task.scheduledDate === today);
  const maintenanceAttentionTasks = myMaintenanceTasks
    .filter((task) => (
      task.status === 'IN_PROGRESS' && task.scheduledDate !== today
    ) || (
      ['SCHEDULED', 'ACKNOWLEDGED'].includes(task.status) && task.scheduledDate < today
    ));
  const upcomingWindowEnd = addDaysToDateKey(today, 7);
  const upcomingMaintenanceTasks = myMaintenanceTasks
    .filter((task) => task.scheduledDate > today
      && task.scheduledDate <= upcomingWindowEnd
      && task.status !== 'IN_PROGRESS');
  const displayedWaitingTickets = paginateItems(waitingTickets, waitingPage);
  const displayedInProgressTickets = paginateItems(inProgressTickets, inProgressPage);
  const completedPageSize = 6;
  const displayedCompletedTickets = paginateItems(
    completedTickets,
    completedPage,
    completedPageSize
  );
  const ownShifts = shifts.filter(
    (shift) => shift.techName?.toLocaleLowerCase() === user?.fullName?.toLocaleLowerCase()
  );
  const isOnline = ownShifts.length > 0 && ownShifts.every((shift) => shift.isOnline);

  const handleTogglePresence = async () => {
    setUpdatingPresence(true);
    setPresenceError('');
    try {
      const updatedShifts = await api.setTechnicianPresence(user.email, !isOnline);
      setShifts(updatedShifts);
    } catch (error) {
      setPresenceError(error.message);
    } finally {
      setUpdatingPresence(false);
    }
  };

  const handleAcceptAndOpen = async (ticket) => {
    setAcceptingTicketId(ticket.id);
    setTicketActionError('');
    try {
      await onAcceptTicket(ticket.id);
      navigate(`/tech/ticket/${ticket.id}`);
    } catch (error) {
      setTicketActionError(error.message);
    } finally {
      setAcceptingTicketId(null);
    }
  };

  const handleStartMaintenance = async (taskId) => {
    setMaintenanceActionError('');
    try {
      const updated = await api.startMaintenanceTask(taskId);
      setMaintenanceTasks((previous) =>
        previous.map((task) => task.id === updated.id ? updated : task)
      );
    } catch (error) {
      setMaintenanceActionError(error.message);
    }
  };

  const handleAcknowledgeMaintenance = async (taskId) => {
    setMaintenanceActionError('');
    try {
      const updated = await api.acknowledgeMaintenanceTask(taskId);
      setMaintenanceTasks((previous) =>
        previous.map((task) => task.id === updated.id ? updated : task)
      );
    } catch (error) {
      setMaintenanceActionError(error.message);
    }
  };

  const clearMaintenanceEvidence = () => {
    if (evidencePreviewUrl.current) {
      URL.revokeObjectURL(evidencePreviewUrl.current);
      evidencePreviewUrl.current = null;
    }
    setMaintenanceEvidenceFile(null);
    setMaintenanceEvidencePreview(null);
  };

  const handleMaintenanceEvidenceChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMaintenanceActionError('Ảnh minh chứng không được vượt quá 10 MB.');
      event.target.value = '';
      return;
    }
    if (evidencePreviewUrl.current) {
      URL.revokeObjectURL(evidencePreviewUrl.current);
    }
    const previewUrl = URL.createObjectURL(file);
    evidencePreviewUrl.current = previewUrl;
    setMaintenanceEvidenceFile(file);
    setMaintenanceEvidencePreview(previewUrl);
    setMaintenanceActionError('');
  };

  const handleCompleteMaintenance = async (event, taskId) => {
    event.preventDefault();
    setSavingMaintenance(true);
    setMaintenanceActionError('');
    try {
      const updated = await api.completeMaintenanceTask(taskId, {
        resultNotes: maintenanceResult,
        replacedParts: maintenanceParts
          .filter((part) => part.partName.trim())
          .map((part) => `${part.partName.trim()} × ${part.quantity} ${part.unit}`)
          .join('; '),
        parts: maintenanceParts
          .filter((part) => part.partName.trim())
          .map((part) => ({
            ...part,
            quantity: Number(part.quantity),
            unitCost: Number(part.unitCost),
          })),
        image: maintenanceEvidenceFile,
      });
      setMaintenanceTasks((previous) =>
        previous.map((task) => task.id === updated.id ? updated : task)
      );
      setActiveMaintenanceTask(null);
      setMaintenanceResult('');
      setMaintenanceParts([]);
      clearMaintenanceEvidence();
    } catch (error) {
      setMaintenanceActionError(error.message);
    } finally {
      setSavingMaintenance(false);
    }
  };

  const formatMaintenanceDate = (value) => {
    if (!value) return 'Chưa có ngày';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      window.alert(`Đã đăng xuất nhưng chưa cập nhật được trạng thái ca trực: ${error.message}`);
    }
    navigate('/login');
  };

  const maintenanceSections = [
    ...(maintenanceAttentionTasks.length > 0 ? [{
      key: 'attention',
      title: 'Việc quá hạn / đang thực hiện',
      tasks: paginateItems(maintenanceAttentionTasks, maintenanceAttentionPage),
      totalItems: maintenanceAttentionTasks.length,
      page: maintenanceAttentionPage,
      onPageChange: setMaintenanceAttentionPage,
    }] : []),
    {
      key: 'today',
      title: 'Lịch bảo trì hôm nay',
      tasks: paginateItems(todayMaintenanceTasks, maintenancePage),
      totalItems: todayMaintenanceTasks.length,
      page: maintenancePage,
      onPageChange: setMaintenancePage,
    },
  ];

  return (
    <MobileAppLayout>
      <header className="blue-topbar">
        <div>
          <h1>Kỹ thuật viên</h1>
          <p>{user?.shift || 'Chưa có ca trực'} • {user?.area || user?.fullName}</p>
          <p style={{ color: isOnline ? '#bbf7d0' : '#fecaca', fontWeight: 600 }}>
            ● {isOnline ? 'Đang trực online' : 'Đang ngoài ca'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            type="button"
            className="topbar-logout-btn maintenance-calendar-button"
            aria-label={`Lịch bảo trì${upcomingMaintenanceTasks.length
              ? `, ${upcomingMaintenanceTasks.length} lịch trong 7 ngày tới`
              : ''}`}
            onClick={() => navigate('/tech/maintenance')}
          >
            <CalendarDays size={14} />
            <span>Lịch bảo trì</span>
            {upcomingMaintenanceTasks.length > 0 && (
              <span className="maintenance-calendar-badge" aria-hidden="true">
                {upcomingMaintenanceTasks.length > 99 ? '99+' : upcomingMaintenanceTasks.length}
              </span>
            )}
          </button>
          <button
            type="button"
            className="topbar-logout-btn"
            onClick={handleTogglePresence}
            disabled={updatingPresence}
          >
            <span>{updatingPresence ? 'Đang cập nhật...' : isOnline ? 'Kết thúc ca' : 'Bắt đầu ca'}</span>
          </button>
          <button className="topbar-logout-btn" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Thoát</span>
          </button>
        </div>
      </header>

      <div className="screen-body tech-dashboard-body">
        {presenceError && <p className="auth-error-box" role="alert">{presenceError}</p>}
        {ticketActionError && <p className="auth-error-box" role="alert">{ticketActionError}</p>}
        {maintenanceError && <p className="auth-error-box" role="alert">{maintenanceError}</p>}
        {maintenanceActionError && (
          <p className="auth-error-box" role="alert">{maintenanceActionError}</p>
        )}
        {ownShifts.length === 0 && !presenceError && (
          <p className="auth-error-box" role="alert">Tài khoản chưa có ca trực khớp với họ tên.</p>
        )}
        {maintenanceLoading ? (
          <p className="maintenance-dashboard-empty">Đang tải lịch bảo trì...</p>
        ) : !maintenanceError && (
          <>
            {maintenanceSections.map((section) => (
              <section className="technician-group-card maintenance-dashboard-section" key={section.key}>
                <h2 className="section-heading">
                  {section.title} ({section.totalItems})
                </h2>
                {section.key === 'today' && !section.totalItems ? (
                  <div className="maintenance-dashboard-empty">
                    Hôm nay bạn chưa có lịch bảo trì.
                  </div>
                ) : section.tasks.map((task) => {
                  const isOverdue = ['SCHEDULED', 'ACKNOWLEDGED'].includes(task.status)
                    && task.scheduledDate < today;
                  return (
                    <article className="ticket-card maintenance-tech-card" key={task.id}>
                      <div className="maintenance-task-heading">
                        <div>
                          <h3>{task.equipmentName}</h3>
                          <p>{task.equipmentCode} · {task.roomName || 'Chưa có vị trí'}</p>
                        </div>
                        <span className={`maintenance-status ${isOverdue ? 'overdue' : task.status.toLowerCase()}`}>
                          {isOverdue
                            ? 'Quá hạn'
                            : task.status === 'IN_PROGRESS'
                            ? 'Đang làm'
                            : task.status === 'ACKNOWLEDGED'
                            ? 'Đã nhận lịch'
                            : 'Chờ xác nhận'}
                        </span>
                      </div>
                      <p className="ticket-meta">
                        Ngày bảo trì: {formatMaintenanceDate(task.scheduledDate)}
                        {task.scheduledTime ? ` · ${task.scheduledTime.slice(0, 5)}` : ''}
                        {task.durationMinutes ? ` · ${task.durationMinutes} phút` : ''}
                      </p>
                      {task.notes && <p className="maintenance-task-notes">{task.notes}</p>}
                      {task.status === 'SCHEDULED' ? (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleAcknowledgeMaintenance(task.id)}
                        >
                          Xác nhận nhận lịch
                        </button>
                      ) : task.status === 'ACKNOWLEDGED' ? (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleStartMaintenance(task.id)}
                        >
                          Bắt đầu bảo trì
                        </button>
                      ) : activeMaintenanceTask === task.id ? (
                        <form
                          className="form-stack maintenance-completion-form"
                          onSubmit={(event) => handleCompleteMaintenance(event, task.id)}
                        >
                          <div className="form-group">
                            <label>Kết quả bảo trì *</label>
                            <textarea
                              className="form-textarea"
                              value={maintenanceResult}
                              onChange={(event) => setMaintenanceResult(event.target.value)}
                              required
                              placeholder="Mô tả tình trạng và các thao tác đã thực hiện"
                            />
                          </div>
                          <div className="form-group">
                            <label>Linh kiện đã sử dụng (nếu có)</label>
                            <PartUsageFields
                              parts={maintenanceParts}
                              onChange={setMaintenanceParts}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`maintenance-evidence-${task.id}`}>
                              Ảnh minh chứng (không bắt buộc)
                            </label>
                            <label className="upload-box maintenance-evidence-upload"
                              htmlFor={`maintenance-evidence-${task.id}`}>
                              <input
                                id={`maintenance-evidence-${task.id}`}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                capture="environment"
                                onChange={handleMaintenanceEvidenceChange}
                                hidden
                              />
                              {maintenanceEvidencePreview ? (
                                <img
                                  src={maintenanceEvidencePreview}
                                  alt="Xem trước ảnh minh chứng bảo trì"
                                  className="preview-img"
                                />
                              ) : (
                                <span>Chụp hoặc chọn ảnh sau bảo trì (tối đa 10 MB)</span>
                              )}
                            </label>
                            {maintenanceEvidenceFile && (
                              <button
                                type="button"
                                className="maintenance-remove-image"
                                onClick={clearMaintenanceEvidence}
                              >
                                Bỏ ảnh đã chọn
                              </button>
                            )}
                          </div>
                          <div className="maintenance-completion-actions">
                            <button type="button" className="btn-cancel" onClick={() => {
                              setActiveMaintenanceTask(null);
                              setMaintenanceResult('');
                              setMaintenanceParts([]);
                              clearMaintenanceEvidence();
                            }}>
                              Hủy
                            </button>
                            <button type="submit" className="btn-success" disabled={savingMaintenance}>
                              {savingMaintenance ? 'Đang lưu...' : 'Hoàn tất bảo trì'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          className="btn-success"
                          onClick={() => setActiveMaintenanceTask(task.id)}
                        >
                          Hoàn tất bảo trì
                        </button>
                      )}
                    </article>
                  );
                })}
                <Pagination
                  totalItems={section.totalItems}
                  page={section.page}
                  onPageChange={section.onPageChange}
                />
              </section>
            ))}
          </>
        )}
        {(waitingTickets.length > 0
          || inProgressTickets.length > 0
          || completedTickets.length > 0) && (
          <section className="technician-group-card tech-incident-group">
            <h2 className="technician-group-title">
              Sự cố ({waitingTickets.length + inProgressTickets.length + completedTickets.length})
            </h2>
            {waitingTickets.length > 0 && (
              <div className="tech-incident-subsection">
                <h3 className="tech-incident-subheading">
                  Chờ tiếp nhận ({waitingTickets.length})
                </h3>
                {displayedWaitingTickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-card urgent">
                    <div className="badge-row" style={{ marginBottom: 2 }}>
                      <span className="badge-red">{ticket.roomBadge}</span>
                      <span className="badge-gray">Mã: {ticket.equipmentCode}</span>
                    </div>

                    <h3 className="equip-name" style={{ marginBottom: 0 }}>
                      {ticket.equipmentName}
                    </h3>
                    <p className="ticket-meta">Báo lỗi: {ticket.reportedTime}</p>

                    <details className="tech-ticket-description">
                      <summary>
                        <span className="ticket-quote-label">Mô tả lỗi từ người báo cáo:</span>
                        <span className="tech-ticket-description-preview">{ticket.description}</span>
                        <span className="tech-ticket-description-more" aria-hidden="true" />
                      </summary>
                      <div className="ticket-quote-box">"{ticket.description}"</div>
                    </details>

                    <p className="ticket-meta">
                      Người báo: {ticket.reporterName} • {ticket.reportedTime}
                    </p>

                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginTop: '4px' }}
                      disabled={acceptingTicketId === ticket.id}
                      onClick={() => handleAcceptAndOpen(ticket)}
                    >
                      {acceptingTicketId === ticket.id ? 'Đang nhận phiếu...' : 'Nhận xử lý sự cố'}
                    </button>
                  </div>
                ))}
                <Pagination
                  totalItems={waitingTickets.length}
                  page={waitingPage}
                  onPageChange={setWaitingPage}
                />
              </div>
            )}

            {inProgressTickets.length > 0 && (
              <div className="tech-incident-subsection">
                <h3 className="tech-incident-subheading">
                  Đang xử lý ({inProgressTickets.length})
                </h3>
                {displayedInProgressTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="ticket-card clickable"
                    onClick={() => navigate(`/tech/ticket/${ticket.id}`)}
                  >
                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>
                      {ticket.roomBadge}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#334155' }}>
                      Lỗi: {ticket.description}
                    </p>
                    <p className="ticket-status-progress">
                      Trạng thái: Đang sửa (Nhận lúc {ticket.acceptedAt})
                    </p>
                  </div>
                ))}
                <Pagination
                  totalItems={inProgressTickets.length}
                  page={inProgressPage}
                  onPageChange={setInProgressPage}
                />
              </div>
            )}

            {completedTickets.length > 0 && (
              <section className="tech-completed-section tech-incident-subsection">
                <button
                  type="button"
                  className="tech-completed-toggle"
                  aria-expanded={showCompletedTickets}
                  aria-controls="completed-ticket-list"
                  onClick={() => setShowCompletedTickets((isVisible) => !isVisible)}
                >
                  Đã hoàn tất ({completedTickets.length})
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                <div id="completed-ticket-list" hidden={!showCompletedTickets}>
                  {displayedCompletedTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="ticket-card clickable"
                      onClick={() => navigate(`/tech/ticket/${ticket.id}`)}
                    >
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                        {ticket.equipmentName} • {ticket.roomBadge}
                      </div>
                      <div className="ticket-status-done">
                        Hoàn tất lúc {ticket.completedDate}
                      </div>
                    </div>
                  ))}
                  <Pagination
                    totalItems={completedTickets.length}
                    page={completedPage}
                    onPageChange={setCompletedPage}
                    pageSize={completedPageSize}
                  />
                </div>
              </section>
            )}
          </section>
        )}

        <button
          type="button"
          className="tech-ai-fab"
          aria-label="Mở Trợ lý AI hỏi đáp chung"
          title="Hỏi Trợ lý AI các câu hỏi kỹ thuật chung"
          onClick={() => navigate('/tech/ai-assistant')}
        >
          <Bot size={20} />
          <span>Hỏi AI chung</span>
        </button>

      </div>
    </MobileAppLayout>
  );
}