import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import { api } from '../../services/api';

function formatDisplayDate(value) {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  return isoDate ? `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}` : value;
}

export default function CreateReportPage({ equipments }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const equipment = (equipments || []).find((eq) => eq.code === code);
  const [roomName, setRoomName] = useState(equipment?.roomFullName || '');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [equipmentImageAvailable, setEquipmentImageAvailable] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (equipment) {
      setRoomName(equipment.roomFullName || equipment.roomCode || '');
      setEquipmentImageAvailable(null);
    }
  }, [equipment]);

  if (!equipment) {
    return (
      <MobileAppLayout>
        <header className="white-topbar">
          <button className="back-btn" onClick={() => navigate('/report')}>
            <ChevronLeft size={20} />
          </button>
          <h2>Thông tin &amp; Báo cáo</h2>
        </header>
        <div className="screen-body">
          <p className="error-text">
            Không tìm thấy thiết bị trong database. Hãy kiểm tra kết nối hoặc chọn lại mã thiết bị.
          </p>
          <button className="btn-primary" onClick={() => navigate('/report')}>
            Quay lại danh sách thiết bị
          </button>
        </div>
      </MobileAppLayout>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(null);
      setImagePreview(null);
      setError('Ảnh hiện trường không được vượt quá 10 MB.');
      e.target.value = '';
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(null);
      setImagePreview(null);
      setError('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.');
      e.target.value = '';
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsAnalyzing(true);
    setError('');
    try {
      const aiResult = await api.analyzeIssueWithAi(
        equipment.code,
        description,
        imageFile
      );
      navigate('/report/result', {
        state: {
          equipment,
          roomName,
          description,
          imageFile,
          imagePreview,
          aiResult,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const equipmentDetails = [
    ['Loại thiết bị', equipment.category],
    ['Hãng sản xuất', equipment.manufacturer],
    ['Model', equipment.model],
    ['Ngày hết bảo hành', formatDisplayDate(equipment.warrantyExpiryDate)],
    [
      'Chu kỳ bảo trì',
      equipment.maintenanceIntervalMonths
        ? `${equipment.maintenanceIntervalMonths} tháng`
        : '',
    ],
    ['KTV phụ trách', equipment.responsiblePerson],
  ].filter(([, value]) => value !== null && value !== undefined && String(value).trim());

  return (
    <MobileAppLayout>
      <header className="white-topbar">
        <button className="back-btn" onClick={() => navigate('/report')}>
          <ChevronLeft size={20} />
        </button>
        <h2>Thông tin &amp; Báo cáo</h2>
      </header>

      <div className="screen-body">
        <div className="info-card">
          {equipmentImageAvailable !== false && (
            <div className={`equipment-photo-frame${equipmentImageAvailable === null ? ' loading' : ''}`}>
              {equipmentImageAvailable === null && (
                <span className="equipment-photo-loading">Đang tải ảnh thiết bị...</span>
              )}
              <img
                key={equipment.code}
                className={`equipment-photo${equipmentImageAvailable ? ' loaded' : ''}`}
                src={api.getEquipmentImageUrl(equipment.code)}
                alt={`Ảnh ${equipment.name}`}
                onLoad={() => setEquipmentImageAvailable(true)}
                onError={() => setEquipmentImageAvailable(false)}
              />
            </div>
          )}
          <div className="badge-row">
            <span className="badge-blue">Mã: {equipment.code}</span>
            <span className="badge-gray">Phòng: {equipment.roomCode}</span>
          </div>
          <h3 className="equip-name">{equipment.name}</h3>
          <div className="meta-table">
            <div className="meta-row">
              <span className="meta-label">Ngày lắp đặt:</span>
              <span className="meta-value">{equipment.installedDate || 'Chưa cập nhật'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Ngày bảo trì gần nhất:</span>
              <span className="meta-value">{equipment.lastMaintenanceDate || 'Chưa ghi nhận'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Ngày sửa gần nhất:</span>
              <span className="meta-value">{equipment.lastRepairDate || 'Chưa ghi nhận'}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Trạng thái hiện tại:</span>
              <span className="meta-value green">{equipment.status || 'Chưa xác định'}</span>
            </div>
          </div>
          <details className="equipment-details">
            <summary>Thông tin chi tiết thiết bị</summary>
            {equipmentDetails.length ? (
              <div className="equipment-detail-grid">
                {equipmentDetails.map(([label, value]) => (
                  <div className="equipment-detail-item" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="equipment-details-empty">Chưa có thông tin chi tiết.</p>
            )}
          </details>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="equipment-report-heading">
            <h3>Báo cáo sự cố</h3>
            <p>Mô tả tình trạng thiết bị để hệ thống điều phối hỗ trợ.</p>
          </div>
          <div className="form-group">
            <label>Số phòng bị hỏng *</label>
            <input
              type="text"
              className="form-input"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mô tả lỗi thiết bị *</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Máy chiếu bật nguồn có đèn nhưng không hiển thị hình lên bảng."
              required
            />
          </div>

          <label className="upload-box">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Ảnh lỗi" className="preview-img" />
            ) : (
              <span>+ Chụp ảnh lỗi (Tùy chọn)</span>
            )}
          </label>

          <div className="dispatch-banner">
            <strong>Tự động điều phối khi gửi báo cáo:</strong>
            <br />• Lỗi nhẹ: Hướng dẫn tự sửa &nbsp;• Lỗi nặng: Gọi KTV trực
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={isAnalyzing}>
            {isAnalyzing ? 'AI đang phân tích sự cố...' : 'Gửi báo cáo sự cố'}
          </button>
        </form>
      </div>
    </MobileAppLayout>
  );
}