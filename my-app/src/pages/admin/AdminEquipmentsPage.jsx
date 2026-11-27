import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/Pagination';
import { paginateItems } from '../../utils/pagination';
import { api } from '../../services/api';

const EMPTY_EQUIPMENT_DETAILS = {
  manufacturer: '',
  model: '',
  serialNumber: '',
  responsibleUnit: '',
  responsiblePerson: '',
  warrantyExpiryDate: '',
  maintenanceIntervalMonths: '',
  safetyNotes: '',
};

function getStatusLabel(status) {
  return {
    ACTIVE: 'Đang hoạt động',
    MAINTENANCE: 'Đang bảo trì',
    BROKEN: 'Đã hỏng',
    'Đang sửa chữa': 'Đang bảo trì',
  }[status] || status;
}

export default function AdminEquipmentsPage({
  equipments,
  onAddEquipment,
  onUpdateEquipmentDetails,
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [detailsForm, setDetailsForm] = useState(EMPTY_EQUIPMENT_DETAILS);
  const [equipmentRows, setEquipmentRows] = useState(equipments);
  const [refreshError, setRefreshError] = useState('');

  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Máy chiếu');
  const [newRoomCode, setNewRoomCode] = useState('P.302');
  const [newDetails, setNewDetails] = useState(EMPTY_EQUIPMENT_DETAILS);

  useEffect(() => {
    let active = true;
    const loadEquipments = async () => {
      try {
        const data = await api.getEquipments();
        if (active) {
          setEquipmentRows(data);
          setRefreshError('');
        }
      } catch (error) {
        if (active) setRefreshError(error.message);
      }
    };

    loadEquipments();
    const intervalId = window.setInterval(loadEquipments, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const filtered = equipmentRows.filter((eq) => {
    const q = search.toLowerCase();
    return (
      eq.code.toLowerCase().includes(q) ||
      eq.name.toLowerCase().includes(q) ||
      eq.roomCode.toLowerCase().includes(q)
    );
  });
  const displayedEquipments = paginateItems(filtered, page);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const today = new Date().toLocaleDateString('vi-VN');
    setRefreshError('');
    try {
      const saved = await onAddEquipment({
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        category: newCategory,
        roomCode: newRoomCode.trim(),
        roomFullName: `Phòng ${newRoomCode.replace('P.', '')}`,
        area: 'Giảng đường A & B',
        installedDate: today,
        lastMaintenanceDate: '',
        lastRepairDate: 'Chưa có',
        status: 'Đang hoạt động',
        ...newDetails,
        warrantyExpiryDate: newDetails.warrantyExpiryDate || null,
        maintenanceIntervalMonths: newDetails.maintenanceIntervalMonths
          ? Number(newDetails.maintenanceIntervalMonths)
          : null,
      });
      setEquipmentRows((previous) => [saved, ...previous]);
      setPage(1);
      setNewCode('');
      setNewName('');
      setNewDetails(EMPTY_EQUIPMENT_DETAILS);
      setShowModal(false);
    } catch (error) {
      setRefreshError(error.message);
    }
  };

  const openEquipmentDetails = (equipment) => {
    setSelectedEquipment(equipment);
    setDetailsForm({
      manufacturer: equipment.manufacturer || '',
      model: equipment.model || '',
      serialNumber: equipment.serialNumber || '',
      responsibleUnit: equipment.responsibleUnit || '',
      responsiblePerson: equipment.responsiblePerson || '',
      warrantyExpiryDate: equipment.warrantyExpiryDate || '',
      maintenanceIntervalMonths: equipment.maintenanceIntervalMonths || '',
      safetyNotes: equipment.safetyNotes || '',
    });
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    try {
      const updated = await onUpdateEquipmentDetails(selectedEquipment.code, {
        ...detailsForm,
        warrantyExpiryDate: detailsForm.warrantyExpiryDate || null,
        maintenanceIntervalMonths: detailsForm.maintenanceIntervalMonths
          ? Number(detailsForm.maintenanceIntervalMonths)
          : null,
      });
      setEquipmentRows((previous) =>
        previous.map((item) => item.code === updated.code ? updated : item)
      );
      setSelectedEquipment(null);
      setRefreshError('');
    } catch (error) {
      setRefreshError(error.message);
    }
  };

  const updateDetailsField = (setter, field, value) => {
    setter((previous) => ({ ...previous, [field]: value }));
  };

  const renderDetailsFields = (values, setter) => (
    <>
      <div className="form-group">
        <label>Hãng sản xuất</label>
        <input className="form-input" value={values.manufacturer}
          onChange={(e) => updateDetailsField(setter, 'manufacturer', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Model</label>
        <input className="form-input" value={values.model}
          onChange={(e) => updateDetailsField(setter, 'model', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Số serial (nếu có)</label>
        <input className="form-input" value={values.serialNumber}
          onChange={(e) => updateDetailsField(setter, 'serialNumber', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Đơn vị phụ trách</label>
        <input className="form-input" value={values.responsibleUnit}
          onChange={(e) => updateDetailsField(setter, 'responsibleUnit', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Người phụ trách</label>
        <input className="form-input" value={values.responsiblePerson}
          onChange={(e) => updateDetailsField(setter, 'responsiblePerson', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Ngày hết bảo hành</label>
        <input type="date" className="form-input" value={values.warrantyExpiryDate}
          onChange={(e) => updateDetailsField(setter, 'warrantyExpiryDate', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Chu kỳ bảo trì (tháng)</label>
        <input type="number" min="1" className="form-input"
          value={values.maintenanceIntervalMonths}
          onChange={(e) => updateDetailsField(setter, 'maintenanceIntervalMonths', e.target.value)} />
      </div>
      <div className="form-group">
        <label>Ghi chú an toàn/kỹ thuật</label>
        <textarea className="form-textarea" value={values.safetyNotes}
          onChange={(e) => updateDetailsField(setter, 'safetyNotes', e.target.value)} />
      </div>
    </>
  );

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý Danh mục Thiết bị</h1>
      </div>

      {refreshError && <div className="auth-error-box" role="alert">{refreshError}</div>}

      <div className="admin-card">
        <div className="table-toolbar">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm theo mã máy, phòng, tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
              <th>THÔNG TIN</th>
            </tr>
          </thead>
          <tbody>
            {displayedEquipments.map((eq) => {
              const status = getStatusLabel(eq.status);
              return (
                <tr key={eq.code}>
                  <td className="code-link">{eq.code}</td>
                  <td>{eq.name}</td>
                  <td>{eq.roomCode}</td>
                  <td>{eq.installedDate}</td>
                  <td>{eq.lastMaintenanceDate}</td>
                  <td>
                    <span
                      className={
                        status === 'Đang hoạt động'
                          ? 'status-pill-active'
                          : status === 'Đã hỏng'
                            ? 'status-pill-broken'
                            : 'status-pill-repair'
                      }
                    >
                      {status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => openEquipmentDetails(eq)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td colSpan="7">Không tìm thấy thiết bị phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination totalItems={filtered.length} page={page} onPageChange={setPage} />
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
              {renderDetailsFields(newDetails, setNewDetails)}
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
      {selectedEquipment && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Chi tiết thiết bị · {selectedEquipment.code}</h3>
              <button type="button" className="back-btn"
                onClick={() => setSelectedEquipment(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="shift-sync-note">
              {selectedEquipment.name} · {selectedEquipment.roomFullName || selectedEquipment.roomCode}
            </p>
            <form onSubmit={handleSaveDetails} className="form-stack">
              {renderDetailsFields(detailsForm, setDetailsForm)}
              <div className="modal-actions">
                <button type="button" className="btn-cancel"
                  onClick={() => setSelectedEquipment(null)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-blue">
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}