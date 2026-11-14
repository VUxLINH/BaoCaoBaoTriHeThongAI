import { createContext, useContext, useState } from 'react';
import { authenticateUser } from '../services/authService';
import { api } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'smartschool_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const loggedUser = await authenticateUser(email, password);
    if (loggedUser.role === 'TECHNICIAN') {
      await api.setTechnicianPresence(loggedUser.email, true);
    }
    setUser(loggedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
    return loggedUser;
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'GUEST',
      fullName: 'Khách (Quét nhanh)',
      role: 'GUEST',
    };
    setUser(guestUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    return guestUser;
  };

  const logout = async () => {
    let presenceError;
    if (user?.role === 'TECHNICIAN') {
      try {
        await api.setTechnicianPresence(user.email, false);
      } catch (error) {
        presenceError = error;
      }
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    if (presenceError) throw presenceError;
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}