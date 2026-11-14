import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">SmartSchool AI</div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard size={17} />
            <span>Tổng quan &amp; AI Dự đoán</span>
          </NavLink>

          <NavLink
            to="/admin/equipments"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <MonitorSmartphone size={17} />
            <span>Danh mục Thiết bị</span>
          </NavLink>

          <NavLink
            to="/admin/qr-codes"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <QrCode size={17} />
            <span>Tạo &amp; In mã QR</span>
          </NavLink>

          <NavLink
            to="/admin/shifts"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <CalendarClock size={17} />
            <span>Lịch trực KTV</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <BarChart3 size={17} />
            <span>Báo cáo &amp; Thống kê</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <strong>{user?.fullName || 'Quản trị viên CSVC'}</strong>
            <span>{user?.email || 'admin@school.edu.vn'}</span>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}