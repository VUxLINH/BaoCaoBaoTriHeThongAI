import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarDays,
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      window.alert(`Đã đăng xuất nhưng chưa cập nhật được trạng thái ca trực: ${error.message}`);
    }
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img className="admin-brand-logo" src="/logodtu.png" alt="Logo" />
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard size={17} />
            <span>Tổng quan</span>
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
            to="/admin/maintenance"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <CalendarDays size={17} />
            <span>Lịch bảo trì</span>
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