'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/auth.context';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleGoBack = () => {
    router.back();
  };

  const getSafeRoute = () => {
    if (!user) return '/login';
    
    // Return user to appropriate dashboard based on role
    switch (user.role) {
      case 'ADMIN':
      case 'MANAGER':
        return '/dashboard';
      case 'KITCHEN_STAFF':
        return '/kitchen';
      case 'DELIVERY_STAFF':
        return '/deliveries';
      default:
        return '/dashboard';
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Access Denied
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
              You don't have permission to access this resource
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                    Insufficient Permissions
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Your current role ({user?.role}) does not have the necessary permissions to view this page. 
                    Please contact your administrator if you believe this is an error.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-white dark:text-blue-900 text-xs font-bold">i</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    What you can do:
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Return to your dashboard using the button below</li>
                    <li>• Contact your system administrator for access</li>
                    <li>• Check if you're logged in with the correct account</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleGoBack}
                variant="outline" 
                className="flex-1 h-12 text-base font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Link href={getSafeRoute()} className="flex-1">
                <Button className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Logged in as: <span className="font-medium text-gray-700 dark:text-gray-300">{user?.username}</span>
                {' '}({user?.role})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}