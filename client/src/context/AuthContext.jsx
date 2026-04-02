import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, usersApi, setAccessToken, clearAccessToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await usersApi.me();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('cat_nanny_token');
    if (stored) {
      setAccessToken(stored);
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const saveToken = useCallback((token) => {
    sessionStorage.setItem('cat_nanny_token', token);
    setAccessToken(token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, saveToken, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
