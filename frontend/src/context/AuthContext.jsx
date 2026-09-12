import React, { createContext, useEffect, useState, useCallback } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/auth.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('pms_user');
    const storedToken = localStorage.getItem('pms_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser, token } = await loginUser({ email, password });
    localStorage.setItem('pms_token', token);
    localStorage.setItem('pms_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    const { user: newUser, token } = await registerUser({ fullName, email, password });
    localStorage.setItem('pms_token', token);
    localStorage.setItem('pms_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    localStorage.removeItem('pms_token');
    localStorage.removeItem('pms_user');
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
