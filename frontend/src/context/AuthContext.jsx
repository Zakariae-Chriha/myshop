import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import BASE_URL from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res  = await fetch(`${BASE_URL}/api/auth/login`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const res  = await fetch(BASE_URL + '/api/auth/register', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // Silently refresh access token using httpOnly refresh cookie
  const refreshAccessToken = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method:      'POST',
        credentials: 'include', // send cookie
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('token', data.token);
      return data.token;
    } catch {
      return false;
    }
  }, []);

  // Auto-refresh on mount if token looks expired
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !localStorage.getItem('user')) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      if (expiresIn < 60_000) {
        // Expires within 60 seconds — refresh now
        refreshAccessToken();
      } else {
        // Schedule refresh 60 seconds before expiry
        const timer = setTimeout(refreshAccessToken, Math.max(expiresIn - 60_000, 0));
        return () => clearTimeout(timer);
      }
    } catch {
      // malformed token — ignore
    }
  }, [refreshAccessToken]);

  const loginWithToken = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Clear server-side refresh cookie
    fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, register, logout, isAdmin, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);