import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles/mobile.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { api } from './services/api';

import LoginPage from './pages/LoginPage';
import ScanDevicePage from './pages/reporter/ScanDevicePage';
import CreateReportPage from './pages/reporter/CreateReportPage';
import AiResultPage from './pages/reporter/AiResultPage';

import TechDashboardPage from './pages/technician/TechDashboardPage';
import TechMaintenanceCalendarPage from './pages/technician/TechMaintenanceCalendarPage';
import TechTicketDetailPage from './pages/technician/TechTicketDetailPage';
import TechAiAssistantPage from './pages/technician/TechAiAssistantPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminEquipmentsPage from './pages/admin/AdminEquipmentsPage';
import AdminQrCodesPage from './pages/admin/AdminQrCodesPage';
import AdminShiftsPage from './pages/admin/AdminShiftsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminMaintenancePage from './pages/admin/AdminMaintenancePage';

export default function App() {
  const [equipments, setEquipments] = useState([]);
  const [reports, setReports] = useState([]);
  const [databaseError, setDatabaseError] = useState('');

  const loadDataFromBackend = useCallback(async () => {
    try {
      const [eqData, repData] = await Promise.all([
        api.getEquipments(),
        api.getReports(),
      ]);
      setEquipments(eqData);
      setReports(repData);
      setDatabaseError('');
    } catch (err) {
      setDatabaseError(
        err instanceof Error
          ? err.message
          : 'Không thể tải dữ liệu từ backend/MySQL.'
      );
    }
  }, []);

  useEffect(() => {
    loadDataFromBackend();
  }, [loadDataFromBackend]);

  // Chuyển đổi dữ liệu báo cáo từ MySQL sang định dạng hiển thị ở A2 (Báo cáo gần đây)
  const recentReports = reports.slice(0, 5).map((r) => ({
    id: r.id,
    equipmentName: `${r.equipmentName} • ${r.roomBadge}`,
    statusText: r.resolvedByAi
      ? 'Đã xử lý (Lỗi đơn giản - Tự khắc phục)'
      : r.status === 'COMPLETED'
      ? `Đã sửa xong (${r.completedDate || 'Hoàn tất'})`
      : `Đã chuyển KTV trực ${r.assignedTechName || 'Nguyễn Văn B'}`,
    type: r.resolvedByAi || r.status === 'COMPLETED' ? 'success' : 'warning',
  }));

  const handleAddEquipment = async (newEquip) => {
    const saved = await api.createEquipment(newEquip);
    setEquipments((prev) => [saved, ...prev]);
  };

  const handleUpdateEquipmentDetails = async (code, details) => {
    const updated = await api.updateEquipmentDetails(code, details);
    setEquipments((prev) =>
      prev.map((equipment) => equipment.code === updated.code ? updated : equipment)
    );
    return updated;
  };

  const handleSaveReport = async (reportPayload) => {
    const saved = await api.createReport(reportPayload);
    setReports((prev) => [saved, ...prev]);
  };

  const handleAcceptTicket = async (ticketId) => {
    const updated = await api.acceptReport(ticketId);
    setReports((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
  };

  const handleCompleteTicket = async (ticketId, payload) => {
    const updated = await api.completeReport(ticketId, payload);
    setReports((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
    try {
      const equipmentData = await api.getEquipments();
      setEquipments(equipmentData);
    } catch (err) {
      setDatabaseError(
        `Phiếu đã hoàn tất nhưng chưa tải lại được danh sách thiết bị: ${err.message}`
      );
    }
  };

  const handleUpdateEquipmentStatus = async (code, status) => {
    const updated = await api.updateEquipmentStatus(code, status);
    setEquipments((prev) =>
      prev.map((equipment) => equipment.code === updated.code ? updated : equipment)
    );
    return updated;
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        {databaseError && (
          <div className="error-text" role="alert">
            <span>Không tải được dữ liệu từ backend/MySQL: {databaseError}</span>
            <button type="button" onClick={loadDataFromBackend}>
              Thử lại
            </button>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Nhóm A: Người báo cáo */}
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['REPORTER', 'GUEST']}>
                <ScanDevicePage
                  equipments={equipments}
                  recentReports={recentReports}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/create/:code"
            element={
              <ProtectedRoute allowedRoles={['REPORTER', 'GUEST']}>
                <CreateReportPage equipments={equipments} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/result"
            element={
              <ProtectedRoute allowedRoles={['REPORTER', 'GUEST']}>
                <AiResultPage onSaveReport={handleSaveReport} />
              </ProtectedRoute>
            }
          />

          {/* Nhóm B: Kỹ thuật viên */}
          <Route
            path="/tech"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechDashboardPage
                  tickets={reports}
                  onAcceptTicket={handleAcceptTicket}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tech/ticket/:id"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechTicketDetailPage
                  tickets={reports}
                  equipments={equipments}
                  onCompleteTicket={handleCompleteTicket}
                  onUpdateEquipmentStatus={handleUpdateEquipmentStatus}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tech/maintenance"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechMaintenanceCalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tech/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechAiAssistantPage />
              </ProtectedRoute>
            }
          />

          {/* Nhóm C: Admin Web Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage equipments={equipments} tickets={reports} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/equipments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminEquipmentsPage
                  equipments={equipments}
                  onAddEquipment={handleAddEquipment}
                  onUpdateEquipmentDetails={handleUpdateEquipmentDetails}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/qr-codes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminQrCodesPage equipments={equipments} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shifts"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminShiftsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/maintenance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMaintenancePage equipments={equipments} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminReportsPage tickets={reports} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}