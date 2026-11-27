import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/Pagination';
import { paginateItems } from '../../utils/pagination';
import { api } from '../../services/api';

export default function AdminShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [shiftName, setShiftName] = useState('Ca Tối (18:00 - 21:00)');
  const [techName, setTechName] = useState('');
  const [area, setArea] = useState('Giảng đường A & B');
  const [error, setError] = useState('');
  const displayedShifts = paginateItems(shifts, page);

  useEffect(() => {
    let active = true;
    const loadShifts = async () => {
      try {
        const data = await api.getShifts();
        if (active) {
          setShifts(data);
          setError('');
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      }
    };

    loadShifts();
    const intervalId = window.setInterval(loadShifts, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const toggleOnline = async (id) => {
    setError('');
    try {
      const updated = await api.toggleShiftOnline(id);
      setShifts((prev) => prev.map((shift) => (shift.id === id ? updated : shift)));
    } catch (toggleError) {
      setError(toggleError.message);
    }
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    if (!techName.trim()) return;
    setError('');
    try {
      const created = await api.createShift({
        shiftName,
        techName: techName.trim(),
        area,
        isOnline: false,
      });
      setShifts((prev) => [...prev, created]);
      setPage(1);
      setTechName('');
      setShowModal(false);
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          Phân công Ca trực Kỹ thuật viên (Điều phối tự động)
        </h1>
        <button className="admin-btn-blue" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          <span>Xếp ca trực mới</span>
        </button>
      </div>

      {error && <div className="auth-error-box" role="alert">{error}</div>}

      <div className="admin-card">
        <h3 className="admin-card-title">Ca trực và trạng thái KTV</h3>
        <p className="shift-sync-note">Trạng thái được đồng bộ tự động mỗi 5 giây.</p>
        <div className="shift-grid">
          {displayedShifts.map((shift) => (
            <div
              key={shift.id}
              className={`shift-card ${shift.isOnline ? 'online' : ''}`}
            >
              <div className="shift-title">{shift.shiftName}</div>
              <div className="shift-meta">KTV: {shift.techName}</div>
              <div className="shift-meta">Khu vực: {shift.area}</div>
              <button
                type="button"
                className="shift-status-button"
                onClick={() => toggleOnline(shift.id)}
                aria-label={`Đổi trạng thái ca của ${shift.techName}`}
              >
                {shift.isOnline ? '• Đang trực (Online)' : '• Ngoài ca trực (Offline)'}
              </button>
            </div>
          ))}
        </div>
        {!shifts.length && <p>Chưa có ca trực nào được phân công.</p>}
        <Pagination totalItems={shifts.length} page={page} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Xếp ca trực mới</h3>
              <button className="back-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddShift} className="form-stack">
              <div className="form-group">
                <label>Tên ca &amp; Khung giờ *</label>
                <input
                  className="form-input"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>KTV phụ trách (nhập đúng tên tài khoản) *</label>
                <input
                  className="form-input"
                  placeholder="VD: Phạm Huy Hoàng (KTV)"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Khu vực điều phối tự động</label>
                <input
                  className="form-input"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn-blue">
                  Lưu ca trực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}