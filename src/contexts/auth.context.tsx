'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { apiService, setAuthErrorHandler, setUnauthorizedHandler } from '@/services/api.service';
import { websocketService } from '@/services/websocket.service';
import { LoginRequest, RegisterRequest, User, UserRole } from '@/types';
import { getErrorMessage } from '@/lib/utils';

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

  const handleLogout = () => {
    websocketService.disconnect();
    storeLogout();
    router.push('/login');
    toast.info('You have been logged out');
  };

  const handleUnauthorized = () => {
    router.push('/unauthorized');
  };

  useEffect(() => {
    // Set up global error handlers
    setAuthErrorHandler(handleLogout);
    setUnauthorizedHandler(handleUnauthorized);

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
        const errorMsg = response.error || response.message || 'Login failed';
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      throw new Error(errorMsg);
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
        const errorMsg = response.error || response.message || 'Registration failed';
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
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
