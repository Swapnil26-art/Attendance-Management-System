import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ams_user')) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    const { token, user: userData } = res.data.data;
    localStorage.setItem('ams_token', token);
    localStorage.setItem('ams_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('ams_token');
    localStorage.removeItem('ams_user');
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.data.data);
      localStorage.setItem('ams_user', JSON.stringify(res.data.data));
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (localStorage.getItem('ams_token') && !user) {
      fetchMe();
    }
  }, [user, fetchMe]);

  const value = { user, login, logout, loading, setLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};