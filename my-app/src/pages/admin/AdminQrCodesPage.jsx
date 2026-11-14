import { Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminQrCodesPage({ equipments }) {
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="admin-page-header no-print">
        <h1 className="admin-page-title">Tạo &amp; In Tem QR Dán Thiết bị</h1>
        <button className="admin-btn-green" onClick={handlePrintPdf}>
          <Printer size={16} />
          <span>Xuất PDF In Hàng Loạt</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="qr-grid">
          {equipments.map((eq) => (
            <div key={eq.code} className="qr-sticker-card">
              <QRCodeSVG
                value={eq.code}
                size={130}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
              />
              <div className="qr-sticker-code">{eq.code}</div>
              <div className="qr-sticker-sub">
                {eq.name} • {eq.roomCode}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}