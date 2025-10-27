'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ShieldCheck, Timer, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await login(formData);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  const handleDemoLogin = async (role: string) => {
    const demoPassword = 'password123';
    const demoCredentials = {
      admin: { username: 'admin', password: demoPassword },
      manager: { username: 'manager', password: demoPassword },
      kitchen: { username: 'kitchen', password: demoPassword },
      delivery: { username: 'delivery', password: demoPassword },
    };

    const creds = demoCredentials[role as keyof typeof demoCredentials];
    if (creds) {
      setFormData(creds);
      try {
        await login(creds);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-primary/10 to-secondary/20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-24 bottom-16 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-border/50 bg-background/80 shadow-2xl backdrop-blur">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary to-primary/80 p-10 text-primary-foreground md:flex">
              <div className="absolute inset-0 opacity-70">
                <div className="absolute left-1/4 top-10 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute right-6 bottom-10 h-36 w-36 rounded-full bg-secondary/50 blur-2xl" />
              </div>

              <div className="relative space-y-6">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  Modern Admin Portal
                </span>
                <h2 className="text-3xl font-semibold leading-tight">
                  Manage your restaurant with confidence.
                </h2>
                <p className="text-sm text-primary-foreground/80">
                  Stay in control of operations, monitor performance in real time, and empower every role on your team.
                </p>
              </div>

              <dl className="relative grid gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5" />
                  <div>
                    <dt className="font-semibold">Secure access</dt>
                    <dd className="text-primary-foreground/80">
                      Role-based authentication keeps your data protected.
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Timer className="mt-0.5 h-5 w-5" />
                  <div>
                    <dt className="font-semibold">Real-time updates</dt>
                    <dd className="text-primary-foreground/80">
                      Monitor orders and workflows with live dashboards.
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="mt-0.5 h-5 w-5" />
                  <div>
                    <dt className="font-semibold">Actionable insights</dt>
                    <dd className="text-primary-foreground/80">
                      Track performance metrics to optimize your service.
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="relative bg-background/60 p-8 sm:p-10">
              <Card className="border-none bg-transparent shadow-none">
                <CardHeader className="space-y-1 p-0">
                  <CardTitle className="text-3xl font-semibold">Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to continue to your restaurant management hub.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit} className="mt-8">
                  <CardContent className="space-y-5 p-0">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                      <Link href="/register" className="transition-colors hover:text-primary">
                        Create account
                      </Link>
                      <Link href="/forgot-password" className="transition-colors hover:text-primary">
                        Forgot password?
                      </Link>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-4 p-0 pt-6">
                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/60" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background/80 px-3 text-muted-foreground">
                          Or continue with demo
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => handleDemoLogin('admin')}
                        disabled={isLoading}
                      >
                        Admin
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => handleDemoLogin('manager')}
                        disabled={isLoading}
                      >
                        Manager
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => handleDemoLogin('kitchen')}
                        disabled={isLoading}
                      >
                        Kitchen
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => handleDemoLogin('delivery')}
                        disabled={isLoading}
                      >
                        Delivery
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
