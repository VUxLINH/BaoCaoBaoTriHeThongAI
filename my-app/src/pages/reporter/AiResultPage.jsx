import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import { useAuth } from '../../context/AuthContext';

export default function AiResultPage({ onSaveReport }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!state?.equipment || !state?.aiResult) {
    return (
      <MobileAppLayout>
        <header className="white-topbar">
          <button className="back-btn" onClick={() => navigate('/report')}>
            <ChevronLeft size={20} />
          </button>
          <h2>Kết quả phân tích sự cố</h2>
        </header>
        <div className="screen-body">
          <div className="info-card">
            <p style={{ fontSize: '13.5px', marginBottom: '12px', color: '#475569' }}>
              Chưa có dữ liệu báo cáo sự cố. Vui lòng quét hoặc nhập mã thiết bị để bắt đầu.
            </p>
            <button className="btn-primary" onClick={() => navigate('/report')}>
              Quay lại quét mã thiết bị
            </button>
          </div>
        </div>
      </MobileAppLayout>
    );
  }

  const { equipment, roomName, description, imageFile, imagePreview, aiResult } = state;
  const isComplex = aiResult.severity === 'COMPLEX';
  const steps = Array.isArray(aiResult.steps) ? aiResult.steps : [];

  const saveReport = async (report) => {
    setSaving(true);
    setSaveError('');
    try {
      await onSaveReport({
        ...report,
        image: imageFile || null,
      });
      navigate('/report');
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelfFixed = () => saveReport({
      equipmentCode: equipment.code,
      equipmentName: equipment.name,
      roomBadge: roomName || equipment.roomCode,
      description,
      reporterName: user?.fullName || 'Người báo cáo',
      aiSeverity: aiResult.severity,
      resolvedByAi: true,
      status: 'COMPLETED',
    });

  const handleEscalateToTech = () => saveReport({
      equipmentCode: equipment.code,
      equipmentName: equipment.name,
      roomBadge: roomName || equipment.roomCode,
      description,
      reporterName: user?.fullName || 'Người báo cáo',
      aiSeverity: aiResult.severity,
      resolvedByAi: false,
      status: 'WAITING_TECH',
    });

  return (
    <MobileAppLayout>
      <header className="white-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h2>Kết quả phân tích sự cố</h2>
      </header>

      <div className="screen-body">
        <div className={isComplex ? 'ai-banner-complex' : 'ai-banner-success'}>
          <h3 className={isComplex ? 'ai-banner-title-red' : 'ai-banner-title-green'}>
            {aiResult.title}
          </h3>
          <p className="ai-banner-sub">
            {equipment.roomCode} • {equipment.name}
          </p>
          <p className="ai-banner-meta">
            {aiResult.provider === 'gemini'
              ? 'Phân tích bởi Gemini'
              : 'Kết quả phân tích dự phòng nội bộ'}
          </p>
          <p className="ai-banner-meta">Thông báo gửi tới: {aiResult.notifyTarget}</p>
          {aiResult.warning && <p className="ai-banner-meta">{aiResult.warning}</p>}
        </div>

        {imagePreview && (
          <div className="form-group">
            <label>Ảnh hiện trường sẽ gửi kèm báo cáo:</label>
            <img src={imagePreview} alt="Ảnh hiện trường đã chọn" className="preview-img" />
          </div>
        )}

        <h3 className="section-heading">
          {isComplex ? 'Khuyến nghị an toàn khẩn cấp:' : 'Hướng dẫn sửa nhanh (2 phút):'}
        </h3>

        <div className="form-stack" style={{ gap: '10px' }}>
          {steps.map((item, idx) => (
            <div key={idx} className="step-card">
              <div className="step-title">{item.step}</div>
              <div className="step-detail">{item.detail}</div>
            </div>
          ))}
        </div>

        {!isComplex && (
          <>
            <button
              type="button"
              className="btn-success"
              onClick={handleSelfFixed}
              disabled={saving}
            >
              Đã sửa được! (Đóng báo cáo)
            </button>
            <p className="escalate-note">Thử các bước trên nhưng vẫn không khắc phục được?</p>
          </>
        )}

        {saveError && <p className="auth-error-box" role="alert">{saveError}</p>}

        <button
          type="button"
          className="btn-danger-outline"
          onClick={handleEscalateToTech}
          disabled={saving}
        >
          Chuyển ngay cho Kỹ thuật viên trực
        </button>
      </div>
    </MobileAppLayout>
  );
}