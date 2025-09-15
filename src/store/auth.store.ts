import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  isTokenValid: () => boolean;
}

interface JWTPayload {
  sub: string;
  exp: number;
  iat: number;
  role: UserRole;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: User) => {
        // Store token in cookies for better security
        Cookies.set('jwt-token', token, { 
          expires: 1, // 1 day
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        });
        
        set({
          token,
          user,
          isAuthenticated: true
        });
      },

      logout: () => {
        Cookies.remove('jwt-token');
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });
      },

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      isTokenValid: () => {
        const { token } = get();
        if (!token) return false;

        try {
          const decoded = jwtDecode<JWTPayload>(token);
          const currentTime = Date.now() / 1000;
          return decoded.exp > currentTime;
        } catch {
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
