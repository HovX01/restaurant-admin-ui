'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, canAccess } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, requiredRoles, canAccess, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}

interface RoleBasedAccessProps {
  children: React.ReactNode;
  roles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleBasedAccess({ 
  children, 
  roles, 
  fallback = null 
}: RoleBasedAccessProps) {
  const { canAccess } = useAuth();

  if (!canAccess(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface CanAccessProps {
  roles: UserRole[];
  yes?: React.ReactNode;
  no?: React.ReactNode;
}

export function CanAccess({ roles, yes, no }: CanAccessProps) {
  const { canAccess } = useAuth();
  return <>{canAccess(roles) ? yes : no}</>;
}
