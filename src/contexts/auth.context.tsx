'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { apiService } from '@/services/api.service';
import { websocketService } from '@/services/websocket.service';
import { LoginRequest, RegisterRequest, User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, logout: storeLogout, hasRole, isTokenValid } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check token validity on mount
    if (isAuthenticated && !isTokenValid()) {
      handleLogout();
    } else if (isAuthenticated && user) {
      // Connect WebSocket if authenticated
      const token = useAuthStore.getState().token;
      if (token) {
        websocketService.connect(token, user.id, user.role);
      }
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(data);
      
      if (response.success && response.data) {
        setAuth(response.data.token, response.data.user);
        
        // Connect WebSocket
        websocketService.connect(response.data.token, response.data.user.id, response.data.user.role);
        
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(response.message || response.error || 'Login failed');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(data);
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        router.push('/login');
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    websocketService.disconnect();
    storeLogout();
    router.push('/login');
    toast.info('You have been logged out');
  };

  const canAccess = (requiredRoles: UserRole[]) => {
    if (!isAuthenticated || !user) return false;
    return hasRole(requiredRoles);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout: handleLogout,
        hasRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
