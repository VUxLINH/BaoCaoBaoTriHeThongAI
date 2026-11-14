import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminEquipmentsPage({ equipments, onAddEquipment }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Máy chiếu');
  const [newRoomCode, setNewRoomCode] = useState('P.302');

  const filtered = equipments.filter((eq) => {
    const q = search.toLowerCase();
    return (
      eq.code.toLowerCase().includes(q) ||
      eq.name.toLowerCase().includes(q) ||
      eq.roomCode.toLowerCase().includes(q)
    );
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const today = new Date().toLocaleDateString('vi-VN');
    onAddEquipment({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      category: newCategory,
      roomCode: newRoomCode.trim(),
      roomFullName: `Phòng ${newRoomCode.replace('P.', '')}`,
      area: 'Giảng đường A & B',
      installedDate: today,
      lastMaintenanceDate: today,
      lastRepairDate: 'Chưa có',
      status: 'Đang hoạt động',
    });

    setNewCode('');
    setNewName('');
    setShowModal(false);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Danh mục Thiết bị</h1>
      </div>

      <div className="admin-card">
        <div className="table-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm theo mã máy, phòng, tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-btn-blue" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>Thêm thiết bị</span>
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>MÃ MÁY</th>
              <th>TÊN THIẾT BỊ</th>
              <th>PHÒNG</th>
              <th>LẮP ĐẶT</th>
              <th>BẢO TRÌ GẦN NHẤT</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((eq) => (
              <tr key={eq.code}>
                <td className="code-link">{eq.code}</td>
                <td>{eq.name}</td>
                <td>{eq.roomCode}</td>
                <td>{eq.installedDate}</td>
                <td>{eq.lastMaintenanceDate}</td>
                <td>
                  <span
                    className={
                      eq.status === 'Đang hoạt động'
                        ? 'status-pill-active'
                        : 'status-pill-repair'
                    }
                  >
                    {eq.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm thiết bị mới */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Thêm thiết bị mới</h3>
              <button className="back-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="form-stack">
              <div className="form-group">
                <label>Mã thiết bị (Mã QR) *</label>
                <input
                  className="form-input"
                  placeholder="VD: MC-P401-01"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tên thiết bị *</label>
                <input
                  className="form-input"
                  placeholder="VD: Máy chiếu Panasonic PT-LB386"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại thiết bị</label>
                <select
                  className="form-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="Máy chiếu">Máy chiếu</option>
                  <option value="Điều hòa">Điều hòa</option>
                  <option value="Máy tính">Máy tính</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phòng lắp đặt *</label>
                <input
                  className="form-input"
                  placeholder="VD: P.401"
                  value={newRoomCode}
                  onChange={(e) => setNewRoomCode(e.target.value)}
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
                  Lưu thiết bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}