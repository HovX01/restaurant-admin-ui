'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft, Shield, LifeBuoy } from 'lucide-react';
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

  const formatRole = (role?: string | null) => {
    if (!role) return 'Unknown role';

    const roleMap: Record<string, string> = {
      ADMIN: 'Administrator',
      MANAGER: 'Manager',
      KITCHEN_STAFF: 'Kitchen Staff',
      DELIVERY_STAFF: 'Delivery Staff',
    };

    return roleMap[role] ?? role.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-300/50 blur-3xl dark:bg-orange-500/30" />
        <div className="absolute bottom-[-120px] right-[-120px] h-96 w-96 rounded-full bg-red-200/60 blur-3xl dark:bg-red-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_65%)]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <Card className="border border-white/50 bg-white/80 shadow-2xl shadow-orange-500/10 backdrop-blur-xl transition-all duration-300 hover:border-white/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-orange-500/5">
            <CardHeader className="space-y-4 pb-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 text-white shadow-lg shadow-red-500/30">
                <Shield className="h-8 w-8" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge className="w-fit border-transparent bg-red-100/80 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-200">
                  Security notice
                </Badge>
                <Badge variant="secondary" className="w-fit border border-blue-100 bg-blue-50/80 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
                  Signed in as {formatRole(user?.role)}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Access restricted for your role
              </CardTitle>
              <CardDescription className="mx-auto max-w-xl text-base text-gray-600 dark:text-gray-400">
                Hey {user?.username}, this area is reserved for a different permission level than your {formatRole(user?.role)}
                access. You can jump back to your workspace or reach out for a role update in just a click.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-red-200/60 bg-red-50/80 p-5 dark:border-red-900/40 dark:bg-red-900/20">
                  <div className="mb-3 flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Why you&apos;re seeing this</span>
                  </div>
                  <p className="text-sm text-red-700/90 dark:text-red-200/80">
                    Your current role <span className="font-semibold">{user?.role}</span> doesn’t have access to this section.
                    If you need entry, request an upgrade from an administrator.
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200/70 bg-blue-50/80 p-5 dark:border-blue-900/40 dark:bg-blue-900/20">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
                    Quick actions
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700/90 dark:text-blue-200/80">
                    <li>• Review the access policies in the team handbook</li>
                    <li>• Confirm you’re logged in with the correct profile</li>
                    <li>• Contact your manager for an immediate role update</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/80 bg-white/70 p-5 shadow-inner dark:border-gray-800/80 dark:bg-slate-950/40">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Your session at a glance</h3>
                <dl className="mt-3 grid gap-3 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-gray-800 dark:text-gray-200">Signed in as</dt>
                    <dd className="truncate text-gray-700 dark:text-gray-300">{user?.username}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-800 dark:text-gray-200">Role</dt>
                    <dd className="text-gray-700 dark:text-gray-300">{formatRole(user?.role)}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex-1 h-12 text-base font-medium backdrop-blur-sm transition-colors hover:bg-white/70 dark:border-gray-700 dark:bg-transparent dark:hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go back
                </Button>

                <Link href={getSafeRoute()} className="flex-1">
                  <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-base font-medium shadow-lg shadow-blue-500/30 transition-transform hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-500/40">
                    <Home className="mr-2 h-4 w-4" />
                    Return to dashboard
                  </Button>
                </Link>

                <Link href="mailto:support@restaurant-hq.com" className="flex-1">
                  <Button
                    variant="ghost"
                    className="h-12 w-full text-base font-medium text-blue-700 hover:bg-blue-100/60 dark:text-blue-200 dark:hover:bg-blue-500/10"
                  >
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    Contact support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}