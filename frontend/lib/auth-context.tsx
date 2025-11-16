'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import apiClient, { UserProfile } from '@/lib/api';

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // Fetch current user profile
          const profile = await apiClient.getCurrentUser();
          setUser(profile);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(email, password);
      setToken(response.token);

      // Fetch user profile after login
      const profile = await apiClient.getCurrentUser();
      setUser(profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.signup(fullName, email, password);
      setToken(response.token);

      // Fetch user profile after signup
      const profile = await apiClient.getCurrentUser();
      setUser(profile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    apiClient.logout();
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const profile = await apiClient.getCurrentUser();
      setUser(profile);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      // If token is invalid, logout
      logout();
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
