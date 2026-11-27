import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import PartUsageFields from '../../components/PartUsageFields';
import { api } from '../../services/api';

const normalizeEquipmentStatus = (status) => {
  if (status === 'ACTIVE') return 'Đang hoạt động';
  if (status === 'BROKEN') return 'Đã hỏng';
  if (status === 'MAINTENANCE' || status === 'Đang sửa chữa') return 'Đang bảo trì';
  return ['Đang hoạt động', 'Đang bảo trì', 'Đã hỏng'].includes(status)
    ? status
    : 'Đang hoạt động';
};

export default function TechTicketDetailPage({
  tickets,
  equipments = [],
  onCompleteTicket,
  onUpdateEquipmentStatus,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const ticket = tickets.find((t) => String(t.id) === String(id));
  const equipment = equipments.find((item) => item.code === ticket?.equipmentCode);

  const [todayStr] = useState(() => new Date().toLocaleDateString('vi-VN'));
  const [rootCauseNote, setRootCauseNote] = useState(ticket?.rootCauseNote || '');
  const [parts, setParts] = useState([]);
  const [imageAfterFile, setImageAfterFile] = useState(null);
  const [imageAfterPreview, setImageAfterPreview] = useState(null);
  const imageAfterPreviewUrl = useRef(null);
  const [equipmentStatus, setEquipmentStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => () => {
    if (imageAfterPreviewUrl.current) {
      URL.revokeObjectURL(imageAfterPreviewUrl.current);
    }
  }, []);

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
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setCompletionError('Ảnh nghiệm thu không được vượt quá 10 MB.');
      e.target.value = '';
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setCompletionError('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.');
      e.target.value = '';
      return;
    }
    if (imageAfterPreviewUrl.current) {
      URL.revokeObjectURL(imageAfterPreviewUrl.current);
    }
    const previewUrl = URL.createObjectURL(file);
    imageAfterPreviewUrl.current = previewUrl;
    setImageAfterFile(file);
    setImageAfterPreview(previewUrl);
    setCompletionError('');
  };

  const handleUpdateEquipmentStatus = async (e) => {
    e.preventDefault();
    if (!equipment) return;

    const selectedStatus = equipmentStatus ?? normalizeEquipmentStatus(equipment.status);
    setSavingStatus(true);
    setStatusMessage('');
    setStatusError('');
    try {
      const updated = await onUpdateEquipmentStatus(equipment.code, selectedStatus);
      setEquipmentStatus(normalizeEquipmentStatus(updated.status));
      setStatusMessage('Đã cập nhật trạng thái thiết bị.');
    } catch (error) {
      setStatusError(error.message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!rootCauseNote.trim()) return;

    setCompleting(true);
    setCompletionError('');
    try {
      await onCompleteTicket(ticket.id, {
        rootCauseNote,
        replacedParts: parts
          .filter((part) => part.partName.trim())
          .map((part) => `${part.partName.trim()} × ${part.quantity} ${part.unit}`)
          .join('; '),
        parts: parts
          .filter((part) => part.partName.trim())
          .map((part) => ({
            ...part,
            quantity: Number(part.quantity),
            unitCost: Number(part.unitCost),
          })),
        equipmentStatus: equipmentStatus ?? normalizeEquipmentStatus(equipment?.status),
        image: imageAfterFile,
      });
      navigate('/tech');
    } catch (error) {
      setCompletionError(error.message);
    } finally {
      setCompleting(false);
    }
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

        {equipment && (
          <form onSubmit={handleUpdateEquipmentStatus} className="info-card form-stack">
            <div className="form-group">
              <label htmlFor="equipment-status">Trạng thái thiết bị</label>
              <select
                id="equipment-status"
                className="form-input"
                value={equipmentStatus ?? normalizeEquipmentStatus(equipment.status)}
                onChange={(e) => setEquipmentStatus(e.target.value)}
              >
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Đang bảo trì">Đang bảo trì</option>
                <option value="Đã hỏng">Đã hỏng</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={savingStatus}>
              {savingStatus ? 'Đang lưu...' : 'Lưu trạng thái thiết bị'}
            </button>
            {statusMessage && <p role="status">{statusMessage}</p>}
            {statusError && <p className="auth-error-box" role="alert">{statusError}</p>}
          </form>
        )}

        {/* Ảnh hiện trường từ người báo cáo */}
        <div className="form-group">
          <label>Ảnh hiện trường từ người báo:</label>
          <div className="photo-evidence-box">
            {ticket.hasImageBefore ? (
              <img
                src={api.getReportImageUrl(ticket.id, 'before')}
                alt="Ảnh hiện trường do người báo gửi"
              />
            ) : (
              <>
                <ImageIcon size={24} />
                <span>[ {ticket.imagePlaceholderText || 'Ảnh hiện trường thiết bị'} ]</span>
              </>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Ảnh hiện trường sau sửa của KTV:</label>
          <div className="photo-evidence-box">
            {ticket.hasImageAfter ? (
              <img
                src={api.getReportImageUrl(ticket.id, 'after')}
                alt="Ảnh nghiệm thu do KTV gửi"
              />
            ) : (
              <>
                <ImageIcon size={24} />
                <span>{isCompleted ? 'Không có ảnh nghiệm thu' : 'Chưa chọn ảnh nghiệm thu'}</span>
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
            <label>Linh kiện đã sử dụng (nếu có)</label>
            {!isCompleted ? (
              <PartUsageFields parts={parts} onChange={setParts} />
            ) : (
              <p>{ticket.replacedParts || 'Không ghi nhận linh kiện.'}</p>
            )}
          </div>

          {!isCompleted && (
            <label className="upload-box">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
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
            <button type="submit" className="btn-success" disabled={completing}>
              {completing ? 'Đang lưu...' : 'Xác nhận Hoàn tất sửa chữa'}
            </button>
          )}
          {completionError && <p className="auth-error-box" role="alert">{completionError}</p>}
        </form>
      </div>
    </MobileAppLayout>
  );
}