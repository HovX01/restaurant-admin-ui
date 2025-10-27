'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

  const handleGoToDashboard = () => {
    router.push(getSafeRoute());
  };

  const formatRole = (role?: string | null) => {
    if (!role) return 'Unknown role';

    const roleMap: Record<string, string> = {
      ADMIN: 'Administrator',
      MANAGER: 'Manager',
      KITCHEN_STAFF: 'Kitchen Staff',
      DELIVERY_STAFF: 'Delivery Staff',
    };

    return (
      roleMap[role] ?? role.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
    );
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
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-3xl">
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Signed in as {formatRole(user?.role)}
                  </Badge>
                  <CardTitle className="text-2xl font-semibold">
                    Hi {user?.username}, this page is restricted
                  </CardTitle>
                </div>
              </div>
            </div>
            <CardDescription className="text-base text-muted-foreground">
              Only certain team roles can view this section right now. Your {formatRole(user?.role)} access keeps you in the right
              workspace, but we can point you to a safe spot or help you request the permissions you need.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-primary/30 bg-primary/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-semibold">Why am I seeing this?</AlertTitle>
              <AlertDescription>
                Your current role of <span className="font-medium">{formatRole(user?.role)}</span> doesn&apos;t grant access to this
                page. If you think this is an error, your manager or an administrator can adjust your permissions.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <h3 className="text-sm font-semibold text-foreground">Your session</h3>
                <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div>
                    <dt className="font-medium text-foreground">Signed in as</dt>
                    <dd className="truncate">{user?.username}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Role</dt>
                    <dd>{formatRole(user?.role)}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <h3 className="text-sm font-semibold text-foreground">Helpful next steps</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Double-check you&apos;re logged in with the right account.</li>
                  <li>• Reach out to a manager for an access update.</li>
                  <li>• Visit your main dashboard to keep working.</li>
                </ul>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleGoBack} variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>

            <Button onClick={handleGoToDashboard} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Return to dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
