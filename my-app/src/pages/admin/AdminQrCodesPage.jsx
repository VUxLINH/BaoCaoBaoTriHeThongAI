import { useState } from 'react';
import { Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/Pagination';
import { paginateItems } from '../../utils/pagination';

export default function AdminQrCodesPage({ equipments }) {
  const [page, setPage] = useState(1);
  const [printingAll, setPrintingAll] = useState(false);
  const displayedEquipments = paginateItems(equipments, page);

  const handlePrintPdf = () => {
    setPrintingAll(true);
    window.setTimeout(() => {
      window.print();
      setPrintingAll(false);
    }, 100);
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
          {(printingAll ? equipments : displayedEquipments).map((eq) => (
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
      {!printingAll && (
        <Pagination
          totalItems={equipments.length}
          page={page}
          onPageChange={setPage}
        />
      )}
    </AdminLayout>
  );
}