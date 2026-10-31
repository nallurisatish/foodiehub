import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('foodiehub_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication on app boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('foodiehub_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            handleLogoutClean();
          }
        } catch (err) {
          console.warn('Session verification error:', err.message);
          handleLogoutClean();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogoutClean = () => {
    localStorage.removeItem('foodiehub_token');
    setToken(null);
    setUser(null);
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('foodiehub_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('foodiehub_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const googleLogin = async (credential) => {
    const res = await authService.googleAuth(credential);
    if (res.success && res.token) {
      localStorage.setItem('foodiehub_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    handleLogoutClean();
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const addAddress = async (addrData) => {
    const res = await authService.addAddress(addrData);
    if (res.success && res.addresses) {
      setUser((prev) => ({ ...prev, addresses: res.addresses }));
    }
    return res;
  };

  const deleteAddress = async (addressId) => {
    const res = await authService.deleteAddress(addressId);
    if (res.success && res.addresses) {
      setUser((prev) => ({ ...prev, addresses: res.addresses }));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
