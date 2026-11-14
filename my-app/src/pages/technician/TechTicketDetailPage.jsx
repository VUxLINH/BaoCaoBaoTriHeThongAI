import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';

export default function TechTicketDetailPage({ tickets, onCompleteTicket }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const ticket = tickets.find((t) => String(t.id) === String(id)) || tickets[0];


  const todayStr = new Date().toLocaleDateString('vi-VN');
  const [rootCauseNote, setRootCauseNote] = useState(ticket?.rootCauseNote || '');
  const [replacedParts, setReplacedParts] = useState(ticket?.replacedParts || '');
  const [imageAfterPreview, setImageAfterPreview] = useState(null);

  if (!ticket) {
    return (
      <MobileAppLayout>
        <header className="white-topbar">
          <button className="back-btn" onClick={() => navigate('/tech')}>
            <ChevronLeft size={20} />
          </button>
          <h2>Chi tiết &amp; Nghiệm thu</h2>
        </header>
        <div className="screen-body">
          <p>Không tìm thấy phiếu sửa chữa.</p>
        </div>
      </MobileAppLayout>
    );
  }

  const handleImageAfterChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageAfterPreview(URL.createObjectURL(file));
    }
  };

  const handleComplete = (e) => {
    e.preventDefault();
    if (!rootCauseNote.trim()) return;

    onCompleteTicket(ticket.id, {
      rootCauseNote,
      replacedParts,
      completedDate: todayStr,
    });
    navigate('/tech');
  };

  const isCompleted = ticket.status === 'COMPLETED';

  return (
    <MobileAppLayout>
      <header className="white-topbar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="back-btn" onClick={() => navigate('/tech')}>
            <ChevronLeft size={20} />
          </button>
          <h2>Chi tiết &amp; Nghiệm thu</h2>
        </div>

        <button
          type="button"
          className="quick-code-chip"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
          onClick={() =>
            navigate('/tech/ai-assistant', {
              state: { equipmentName: ticket.equipmentName },
            })
          }
        >
          <Bot size={14} />
          <span>Hỏi AI</span>
        </button>
      </header>

      <div className="screen-body">
        {/* Thẻ thông tin thiết bị đang sửa */}
        <div className="info-card">
          <h3 className="equip-name" style={{ marginBottom: '4px' }}>
            {ticket.equipmentName} • {ticket.roomBadge}
          </h3>
          <p className="ticket-meta" style={{ marginBottom: '10px' }}>
            Mã {ticket.equipmentCode} • Báo lúc {ticket.reportedTime}
          </p>
          <span
            className="badge-blue"
            style={
              isCompleted
                ? { background: '#ecfdf5', color: '#047857' }
                : undefined
            }
          >
            {isCompleted ? 'Đã hoàn tất sửa chữa' : 'Đang tiến hành sửa'}
          </span>
        </div>

        {/* Ảnh hiện trường từ người báo cáo */}
        <div className="form-group">
          <label>Ảnh hiện trường từ người báo:</label>
          <div className="photo-evidence-box">
            {ticket.imageBeforeUrl ? (
              <img src={ticket.imageBeforeUrl} alt="Hiện trường lỗi" />
            ) : (
              <>
                <ImageIcon size={24} />
                <span>[ {ticket.imagePlaceholderText || 'Ảnh hiện trường thiết bị'} ]</span>
              </>
            )}
          </div>
        </div>

        {/* Form nghiệm thu của KTV */}
        <form onSubmit={handleComplete} className="form-stack">
          <div className="form-group">
            <label>Ghi chú nguyên nhân &amp; cách sửa *</label>
            <textarea
              className="form-textarea"
              placeholder="VD: Thông ống thoát nước, thay tụ khởi động và kiểm tra lại aptomat nguồn."
              value={rootCauseNote}
              onChange={(e) => setRootCauseNote(e.target.value)}
              required
              disabled={isCompleted}
            />
          </div>

          <div className="form-group">
            <label>Linh kiện thay thế (Nếu có)</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Tụ điện 35uF"
              value={replacedParts}
              onChange={(e) => setReplacedParts(e.target.value)}
              disabled={isCompleted}
            />
          </div>

          {!isCompleted && (
            <label className="upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageAfterChange}
                style={{ display: 'none' }}
              />
              {imageAfterPreview ? (
                <img src={imageAfterPreview} alt="Ảnh nghiệm thu" className="preview-img" />
              ) : (
                <span>+ Chụp ảnh nghiệm thu sau khi sửa</span>
              )}
            </label>
          )}

          <div className="form-group">
            <label>Cập nhật ngày sửa gần nhất</label>
            <input
              type="text"
              className="form-input readonly-input"
              value={`${ticket.completedDate || todayStr} (Tự động)`}
              readOnly
            />
          </div>

          {!isCompleted && (
            <button type="submit" className="btn-success">
              Xác nhận Hoàn tất sửa chữa
            </button>
          )}
        </form>
      </div>
    </MobileAppLayout>
  );
}