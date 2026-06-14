import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios.js';


const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
          // Test the token via calling profile API to verify validity
          const res = await api.get('/users/profile');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session validation failed. Logging out...', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setErrorMsg(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, ...userData } = res.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please inspect credentials.';
      setErrorMsg(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    setErrorMsg(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, confirmPassword });
      const { token: receivedToken, ...userData } = res.data;

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setErrorMsg(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setErrorMsg(null);
  };

  const updateProfileName = (name) => {
    if (user) {
      const updated = { ...user, name };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfileName,
        errorMsg,
        setErrorMsg
      }}>
      
      {children}
    </AuthContext.Provider>);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be mounted inside an AuthProvider.');
  }
  return context;
};
