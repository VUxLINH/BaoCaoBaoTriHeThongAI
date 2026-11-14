import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, LogOut } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function TechDashboardPage({ tickets, onAcceptTicket }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [presenceError, setPresenceError] = useState('');
  const [updatingPresence, setUpdatingPresence] = useState(false);

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

  const handleAcceptAndOpen = (ticket) => {
    onAcceptTicket(ticket.id);
    navigate(`/tech/ticket/${ticket.id}`);
  };

  const handleOpenActiveTicket = () => {
    const target = inProgressTickets[0] || waitingTickets[0];
    if (target) {
      navigate(`/tech/ticket/${target.id}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      window.alert(`Đã đăng xuất nhưng chưa cập nhật được trạng thái ca trực: ${error.message}`);
    }
    navigate('/login');
  };

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

      <div className="screen-body">
        {presenceError && <p className="auth-error-box" role="alert">{presenceError}</p>}
        {ownShifts.length === 0 && !presenceError && (
          <p className="auth-error-box" role="alert">Tài khoản chưa có ca trực khớp với họ tên.</p>
        )}
        {waitingTickets.length > 0 && (
          <div className="tech-alert-banner">
            <div className="tech-alert-title">
              Sự cố chờ tiếp nhận ({waitingTickets.length})
            </div>
          </div>
        )}

        {/* Danh sách sự cố chờ tiếp nhận */}
        {waitingTickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card urgent">
            <div className="badge-row" style={{ marginBottom: 2 }}>
              <span className="badge-red">{ticket.roomBadge}</span>
              <span className="badge-gray">Mã: {ticket.equipmentCode}</span>
            </div>

            <h3 className="equip-name" style={{ marginBottom: 0 }}>
              {ticket.equipmentName}
            </h3>
            <p className="ticket-meta">
              Lắp: {ticket.installedShort} • Báo lỗi: {ticket.reportedTime}
            </p>

            <p className="ticket-quote-label">Mô tả lỗi từ người báo cáo:</p>
            <div className="ticket-quote-box">"{ticket.description}"</div>

            <p className="ticket-meta">
              Người báo: {ticket.reporterName} • {ticket.reportedTime}
            </p>

            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: '4px' }}
              onClick={() => handleAcceptAndOpen(ticket)}
            >
              Nhận xử lý sự cố
            </button>
          </div>
        ))}

        {/* Danh sách sự cố đang sửa */}
        {inProgressTickets.map((ticket) => (
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

        {/* Nút mở nhanh Trợ lý AI Kỹ thuật */}
        <button
          type="button"
          className="tech-ai-fab"
          onClick={() =>
            navigate('/tech/ai-assistant', {
              state: {
                equipmentName:
                  waitingTickets[0]?.equipmentName ||
                  inProgressTickets[0]?.equipmentName ||
                  'Điều hòa Daikin Inverter 2HP',
              },
            })
          }
        >
          <Bot size={18} />
          <span>Mở Trợ lý AI Kỹ thuật</span>
        </button>

        {/* Đã hoàn tất gần đây */}
        {completedTickets.length > 0 && (
          <>
            <h3 className="section-heading">Đã hoàn tất trong ca</h3>
            {completedTickets.map((ticket) => (
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
          </>
        )}

        {/* Nút xanh ở đáy giống bản vẽ */}
        {(inProgressTickets.length > 0 || waitingTickets.length > 0) && (
          <button
            type="button"
            className="btn-success"
            style={{ marginTop: 'auto' }}
            onClick={handleOpenActiveTicket}
          >
            Cập nhật ngày sửa &amp; Hoàn tất
          </button>
        )}
      </div>
    </MobileAppLayout>
  );
}