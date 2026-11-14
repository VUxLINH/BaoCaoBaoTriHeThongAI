import { useNavigate } from 'react-router-dom';
import { Bot, LogOut } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import { useAuth } from '../../context/AuthContext';

export default function TechDashboardPage({ tickets, onAcceptTicket }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const waitingTickets = tickets.filter((t) => t.status === 'WAITING_TECH');
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS');
  const completedTickets = tickets.filter((t) => t.status === 'COMPLETED');

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <MobileAppLayout>
      <header className="blue-topbar">
        <div>
          <h1>Thông báo Kỹ thuật viên trực</h1>
          <p>Ca trực: {user?.fullName || 'Anh Nguyễn Văn B'}</p>
        </div>
        <button className="topbar-logout-btn" onClick={handleLogout}>
          <LogOut size={14} />
          <span>Thoát</span>
        </button>
      </header>

      <div className="screen-body">
        {/* Cảnh báo sự cố mới từ hệ thống */}
        {waitingTickets.length > 0 && (
          <div className="tech-alert-banner">
            <div className="tech-alert-title">
              MỚI: Sự cố phức tạp cần xử lý ({waitingTickets.length})
            </div>
            <div className="tech-alert-sub">
              Hệ thống chuyển hướng tự động • Vừa xong
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