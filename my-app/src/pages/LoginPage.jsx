import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileAppLayout from '../layouts/MobileAppLayout';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loginAsGuest } = useAuth();
  const requestedPath = location.state?.from?.pathname;
  const reportDestination = requestedPath?.startsWith('/report/')
    ? requestedPath
    : '/report';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'TECHNICIAN') navigate('/tech', { replace: true });
    else if (user.role === 'ADMIN') navigate('/admin', { replace: true });
    else if (user.role === 'REPORTER') navigate(reportDestination, { replace: true });
  }, [user, navigate, reportDestination]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'ADMIN') navigate('/admin');
      else if (loggedUser.role === 'TECHNICIAN') navigate('/tech');
      else navigate(reportDestination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGuestScan = () => {
    loginAsGuest();
    navigate(reportDestination, { replace: true });
  };

  return (
    <MobileAppLayout>
      <header className="header-section">
        <div className="logo-square">
          <img src="/logodtu.png" alt="Logo hệ thống" />
        </div>
        <h1 className="app-title">Bảo trì Thiết bị Trường học</h1>
        <p className="app-subtitle">Hệ thống quản lý &amp; hỗ trợ thông minh</p>
      </header>

      <main className="main-content">
        <div className="login-card">
          <h2 className="card-title">Đăng nhập hệ thống</h2>
          <p className="card-subtitle">Nhập email và mật khẩu tài khoản</p>

          {error && <div className="auth-error-box">{error}</div>}

          <form onSubmit={handleLogin} className="form-stack">
            <div className="form-group">
              <label htmlFor="email">Email trường học / Mã NV</label>
              <input
                id="email"
                type="text"
                className="form-input"
                placeholder="lan.gv@school.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="quick-scan-wrapper">
            <button
              type="button"
              className="quick-scan-link"
              onClick={handleQuickGuestScan}
            >
              Hoặc quét mã nhanh không cần đăng nhập
            </button>
          </div>
        </div>
      </main>
    </MobileAppLayout>
  );
}