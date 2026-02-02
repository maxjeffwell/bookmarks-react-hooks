import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiUrl } from '../../config';

const AuthContext = createContext(null);

// Configure axios to send cookies
axios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/me`);
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      // Try refresh if access token expired
      if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED') {
        try {
          await axios.post(`${apiUrl}/auth/refresh`);
          const response = await axios.get(`${apiUrl}/auth/me`);
          setUser(response.data.user);
          setError(null);
          return;
        } catch (refreshErr) {
          // Refresh failed, user needs to login
        }
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (login, password) => {
    setError(null);
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, { login, password });
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await axios.post(`${apiUrl}/auth/register`, { username, email, password });
      setUser(response.data.user);
      return response.data.user;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${apiUrl}/auth/logout`);
    } catch (err) {
      // Logout anyway even if request fails
    }
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      await axios.post(`${apiUrl}/auth/refresh`);
      return true;
    } catch (err) {
      setUser(null);
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
