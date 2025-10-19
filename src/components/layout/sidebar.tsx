'use client';

import { useEffect, useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebar-collapsed') : null;
      if (stored) setIsCollapsed(stored === '1');
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
        }
      } catch {}
      return next;
    });
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return canAccess(item.roles);
  });

  const SidebarContent = () => (
    <>
      <div className={cn('px-2 py-2') }>
        <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'justify-between px-2')}>
          {!isCollapsed && (
            <h2 className="text-sm font-semibold tracking-tight">Restaurant Admin</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('hidden md:inline-flex', isCollapsed ? '' : 'ml-2')}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="px-2 py-3">
          <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'space-x-2')}>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={item.title}
              >
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full',
                    isCollapsed ? 'justify-center px-0' : 'justify-start',
                    isActive && 'bg-secondary'
                  )}
                >
                  <Icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
                  {!isCollapsed && item.title}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-auto p-2">
        <Button
          variant="ghost"
          className={cn('w-full', isCollapsed ? 'justify-center px-0' : 'justify-start text-destructive hover:text-destructive')}
          onClick={logout}
          title="Logout"
        >
          <LogOut className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
          {!isCollapsed && 'Logout'}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden md:flex h-full flex-col border-r bg-background overflow-hidden transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
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
