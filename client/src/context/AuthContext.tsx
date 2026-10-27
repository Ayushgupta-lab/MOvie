import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTheatreOwner: boolean;
  isSubscribed: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (getAuthToken()) {
        const res = await api.auth.getMe();
        if (res.success && res.user) {
          setUser({
            id: res.user._id,
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone,
            role: res.user.role,
            city: res.user.city,
            isSubscribed: res.user.isSubscribed,
            subscriptionExpiresAt: res.user.subscriptionExpiresAt,
            subscriptionPlan: res.user.subscriptionPlan,
            rewardPoints: res.user.rewardPoints,
            referralCode: res.user.referralCode,
          });
        }
      } else {
        setUser(null);
      }
    } catch {
      removeAuthToken();
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.auth.login(credentials);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
    }
  };

  const register = async (userData: any) => {
    const res = await api.auth.register(userData);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    removeAuthToken();
    setTokenState(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isTheatreOwner = user?.role === 'theatre_owner' || isAdmin;
  const isSubscribed = Boolean(user?.isSubscribed);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin,
        isTheatreOwner,
        isSubscribed,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
