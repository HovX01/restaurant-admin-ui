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

  const AccountPreview = () => (
    <div className="mb-4 px-3 py-2">
      <div className="flex items-center space-x-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary text-primary-foreground font-semibold shadow-sm">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.username}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
      </div>
    </div>
  );

  const NavigationLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="space-y-1">
      {filteredMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
          >
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start transition-all',
                isActive && 'bg-secondary/80 shadow-sm'
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
              {item.badge && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Button>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:flex">
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <h2 className="text-lg font-semibold tracking-tight">Restaurant Admin</h2>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <AccountPreview />
          <NavigationLinks />
        </ScrollArea>
        <div className="border-t border-border/60 p-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center border-b px-6">
              <h2 className="text-lg font-semibold tracking-tight">Restaurant Admin</h2>
            </div>
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <div className="px-3 py-4">
                <AccountPreview />
                <NavigationLinks onNavigate={() => setIsMobileOpen(false)} />
              </div>
              <div className="border-t p-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
