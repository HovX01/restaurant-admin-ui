'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth.context';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Truck,
  Menu,
  LogOut,
  BarChart,
  Tag,
} from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'MANAGER', 'KITCHEN_STAFF', 'DELIVERY_STAFF']
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    roles: ['ADMIN', 'MANAGER', 'KITCHEN_STAFF'],
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: Tag,
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Deliveries',
    href: '/deliveries',
    icon: Truck,
    roles: ['ADMIN', 'MANAGER', 'DELIVERY_STAFF'],
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart,
    roles: ['ADMIN', 'MANAGER'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, canAccess } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return canAccess(item.roles);
  });

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex-1 px-5 py-6">
        <div className="mb-8">
          <h2 className="px-3 text-xl font-semibold tracking-tight">
            Restaurant
          </h2>
          <p className="mt-1 px-3 text-xs text-muted-foreground">Admin Panel</p>
        </div>

        <div className="mb-8 rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
              >
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'h-11 w-full justify-start gap-3 px-3 transition-all',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' 
                      : 'hover:bg-muted/60'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border/60 p-5">
        <Button
          variant="ghost"
          className="h-11 w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full w-64 flex-col border-r bg-background">
        <ScrollArea className="flex-1">
          <SidebarContent />
        </ScrollArea>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <ScrollArea className="h-full">
              <SidebarContent />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
