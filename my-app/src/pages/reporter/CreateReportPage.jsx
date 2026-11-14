import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import { api } from '../../services/api';

export default function CreateReportPage({ equipments }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const equipment = (equipments || []).find((eq) => eq.code === code);
  const [roomName, setRoomName] = useState(equipment?.roomFullName || '');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (equipment) {
      setRoomName(equipment.roomFullName || equipment.roomCode || '');
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
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
          <div className="badge-row">
            <span className="badge-blue">Mã: {equipment.code}</span>
            <span className="badge-gray">Phòng: {equipment.roomCode}</span>
          </div>
          <h3 className="equip-name">{equipment.name}</h3>
          <div className="meta-table">
            <div className="meta-row">
              <span className="meta-label">Ngày lắp đặt:</span>
              <span className="meta-value">{equipment.installedDate}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Ngày bảo trì gần nhất:</span>
              <span className="meta-value">{equipment.lastMaintenanceDate}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Ngày sửa gần nhất:</span>
              <span className="meta-value">{equipment.lastRepairDate}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Trạng thái hiện tại:</span>
              <span className="meta-value green">{equipment.status}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
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
              accept="image/*"
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