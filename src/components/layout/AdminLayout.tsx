'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { DynamicBreadcrumb } from '@/components/layout/breadcrumbs';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/40 text-foreground">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 px-8 backdrop-blur">
          <div className="flex-1">
            <DynamicBreadcrumb />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full border border-border/60 bg-background/90"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 inline-flex size-2 rounded-full bg-primary" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-8 py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
