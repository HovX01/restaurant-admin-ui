'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

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
    const demoCredentials = {
      admin: { username: 'admin', password: 'password123' },
      manager: { username: 'manager', password: 'password123' },
      kitchen: { username: 'kitchen', password: 'password123' },
      delivery: { username: 'delivery', password: 'password123' },
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

  const currentYear = new Date().getFullYear();

  return (
    <div className="grid min-h-screen grid-cols-1 overflow-hidden bg-background text-foreground lg:grid-cols-[1fr_0.85fr]">
      <div className="relative hidden items-center justify-center bg-muted/30 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/15" />
        <div className="relative z-10 flex h-full w-full flex-col justify-between px-12 py-14">
          <div>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
              Restaurant Admin
            </span>
            <h1 className="mt-8 max-w-md text-4xl font-semibold leading-tight">
              Modern operations, simplified.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Monitor orders, manage menus, and keep every team aligned with a focused, contemporary dashboard.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            © {currentYear} Restaurant Admin. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <Card className="w-full max-w-md border border-border/60 bg-background/90 shadow-xl shadow-primary/5 backdrop-blur">
          <CardHeader className="space-y-2 px-8">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</span>
            <CardTitle className="text-3xl font-semibold">Sign in</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter your credentials to access the admin panel.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            <CardContent className="space-y-5 px-8">
              {error && (
                <Alert variant="destructive" className="rounded-lg">
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

              <div className="flex items-center justify-between text-sm">
                <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                  Create account
                </Link>
                <Link href="/forgot-password" className="text-muted-foreground hover:text-primary">
                  Forgot password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-8">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Try a demo role
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  onClick={() => handleDemoLogin('manager')}
                  disabled={isLoading}
                >
                  Manager
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  onClick={() => handleDemoLogin('kitchen')}
                  disabled={isLoading}
                >
                  Kitchen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
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
  );
}
