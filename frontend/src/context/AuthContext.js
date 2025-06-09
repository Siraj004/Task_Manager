// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // ✅ NEW
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken); // ✅ set token
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(res.data);
    } catch (error) {
      localStorage.removeItem('accessToken');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { accessToken } = res.data;
    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken); // ✅ set token
    await fetchUserProfile(accessToken); // Fetch and set full user profile
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
