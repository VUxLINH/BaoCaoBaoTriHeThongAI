import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { api } from '../../services/api';

export default function AdminShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [shiftName, setShiftName] = useState('Ca Tối (18:00 - 21:00)');
  const [techName, setTechName] = useState('');
  const [area, setArea] = useState('Giảng đường A & B');

  useEffect(() => {
    api.getShifts().then(setShifts).catch(console.error);
  }, []);

  const toggleOnline = async (id) => {
    const updated = await api.toggleShiftOnline(id);
    setShifts((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    if (!techName.trim()) return;
    const created = await api.createShift({
      shiftName,
      techName: techName.trim(),
      area,
      isOnline: true,
    });
    setShifts((prev) => [...prev, created]);
    setTechName('');
    setShowModal(false);
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

      <div className="admin-card">
        <h3 className="admin-card-title">Lịch trực Tuần hiện tại</h3>
        <div className="shift-grid">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className={`shift-card ${shift.isOnline ? 'online' : ''}`}
            >
              <div className="shift-title">{shift.shiftName}</div>
              <div className="shift-meta">KTV: {shift.techName}</div>
              <div className="shift-meta">Khu vực: {shift.area}</div>
              <div
                className="shift-online-dot"
                style={{
                  color: shift.isOnline ? '#059669' : '#64748b',
                  cursor: 'pointer',
                }}
                onClick={() => toggleOnline(shift.id)}
                title="Bấm để đổi trạng thái trực"
              >
                {shift.isOnline ? '• Đang trực (Online)' : '• Ngoài ca trực (Offline)'}
              </div>
            </div>
          ))}
        </div>
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
                <label>Kỹ thuật viên phụ trách *</label>
                <input
                  className="form-input"
                  placeholder="VD: Anh Lê Minh D"
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