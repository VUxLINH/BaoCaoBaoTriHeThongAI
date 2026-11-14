import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, X } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import MobileAppLayout from '../../layouts/MobileAppLayout';
import { useAuth } from '../../context/AuthContext';

export default function ScanDevicePage({ equipments, recentReports }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [deviceCode, setDeviceCode] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleCheckDevice = (codeToSearch) => {
    const raw = (codeToSearch || deviceCode).trim();
    // Hỗ trợ cả trường hợp QR chứa mã máy thuần (MC-P302-01) hoặc URL
    const extracted = raw.includes('/') ? raw.split('/').pop() : raw;
    const cleanCode = extracted.toUpperCase();

    if (!cleanCode) {
      setError('Vui lòng nhập hoặc quét mã thiết bị.');
      return;
    }

    const found = equipments.find((eq) => eq.code.toUpperCase() === cleanCode);
    if (!found) {
      setError(`Không tìm thấy thiết bị có mã "${cleanCode}".`);
      setIsScanning(false);
      return;
    }

    setError('');
    setIsScanning(false);
    navigate(`/report/create/${found.code}`);
  };

  const handleScanSuccess = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedValue = detectedCodes[0].rawValue;
      if (scannedValue) {
        handleCheckDevice(scannedValue);
      }
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
          <h1>Báo hỏng Thiết bị</h1>
          <p>{user?.fullName || 'Hệ thống bảo trì trường học'}</p>
        </div>
        <button className="topbar-logout-btn" onClick={handleLogout}>
          <LogOut size={14} />
          <span>{user?.role === 'GUEST' ? 'Đăng nhập' : 'Thoát'}</span>
        </button>
      </header>

      <div className="screen-body">
        {/* Vùng Camera quét QR thật */}
        {isScanning ? (
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Scanner
              onScan={handleScanSuccess}
              onError={() => {
                setError(
                  'Không mở được Camera. Hãy cấp quyền Camera hoặc chạy trên HTTPS / localhost.'
                );
                setIsScanning(false);
              }}
              constraints={{ facingMode: 'environment' }}
              formats={['qr_code']}
              components={{ audio: true, finder: true }}
              styles={{
                container: { width: '100%', height: '250px' },
              }}
            />
            <button
              type="button"
              onClick={() => setIsScanning(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                zIndex: 5,
              }}
            >
              <X size={14} />
              <span>Tắt Camera</span>
            </button>
          </div>
        ) : (
          <div
            className="qr-scanner-box"
            onClick={() => {
              setError('');
              setIsScanning(true);
            }}
          >
            <div className="qr-frame">
              <div className="qr-scan-line" />
            </div>
            <p className="qr-hint" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={15} />
              <span>Chạm để mở Camera quét mã QR trên thiết bị</span>
            </p>
          </div>
        )}

        <p className="divider-label">Hoặc nhập mã dán trên máy</p>

        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="VD: MC-P302-01"
            value={deviceCode}
            onChange={(e) => {
              setDeviceCode(e.target.value);
              setError('');
            }}
          />
          {error && <p className="error-text">{error}</p>}
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => handleCheckDevice()}
        >
          Kiểm tra thiết bị
        </button>

        <h3 className="section-heading">Báo cáo gần đây của bạn</h3>

        <div className="form-stack" style={{ gap: '10px' }}>
          {recentReports.map((item) => (
            <div key={item.id} className="recent-card">
              <div className="recent-card-title">{item.equipmentName}</div>
              <div
                className={
                  item.type === 'success'
                    ? 'recent-status-success'
                    : 'recent-status-warning'
                }
              >
                {item.statusText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileAppLayout>
  );
}