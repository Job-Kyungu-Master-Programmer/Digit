import React, { createContext, useState, useEffect, useCallback } from 'react';
import { setToken, getToken, removeToken } from '../config/api.config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [token, _setToken] = useState(getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);

  const setTokenWrapper = (newToken) => {
    _setToken(newToken);
    if (newToken) {
      setToken(newToken);
    } else {
      removeToken();
    }
  };

  const checkAuth = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return false;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();

      if (!userData.success) throw new Error('Invalid token');

      setUser(userData.user);
      setIsAuthenticated(true);

      if (userData.user.role === 'company_admin' && userData.user.company?._id) { // ← CORRIGÉ : vérifie ._id
        const companyRes = await fetch(`${API_BASE_URL}/companies/${userData.user.company._id}`, { // ← CORRIGÉ : ._id
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const companyData = await companyRes.json();
        if (companyData.success) setCompany(companyData.data);
      }

      return true;
    } catch (error) {
      console.error('Auth check error:', error); // ← AJOUT : log pour debug
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        setTokenWrapper(data.token);
        setUser(data.user);
        setIsAuthenticated(true);

        if (data.user.role === 'company_admin' && data.user.company?._id) { // ← CORRIGÉ : vérifie ._id
          const companyRes = await fetch(`${API_BASE_URL}/companies/${data.user.company._id}`, { // ← CORRIGÉ : ._id
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const companyData = await companyRes.json();
          if (companyData.success) setCompany(companyData.data);
        }

        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (error) {
      console.error('Login error:', error); // ← AJOUT : log pour debug
      return { success: false, error: 'Erreur réseau' };
    }
  };

  const logout = () => {
    setTokenWrapper(null);
    setUser(null);
    setCompany(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{
      user,
      company,
      setCompany,
      token,
      login,
      logout,
      checkAuth,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};