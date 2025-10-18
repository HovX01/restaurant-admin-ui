'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { ProtectedRoute } from '@/components/auth/rbac';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { websocketService } from '@/services/websocket.service';
import { apiService } from '@/services/api.service';
import { WebSocketMessage, Order, OrderStatus } from '@/types';
import {
  Users,
  Package,
  ShoppingCart,
  Truck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  activeDeliveries: number;
  todayRevenue: number;
  monthlyRevenue: number;
  growthRate: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeDeliveries: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    growthRate: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await loadDashboardData();
    };
    loadData();
    setupWebSocketListeners();

    return () => {
      // Cleanup WebSocket listeners
      websocketService.off('/topic/orders', handleOrderUpdate);
      websocketService.off('/topic/deliveries', handleDeliveryUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load dashboard stats (you might want to create a specific endpoint for this)
      const [ordersResponse, productsResponse, usersResponse] = await Promise.all([
        apiService.getOrders({ status: 'PENDING' as OrderStatus, page: 0, size: 20 }),
        apiService.getProducts({ page: 0, size: 20 }),
        apiService.getUsers({ page: 0, size: 20 }),
      ]);

      const orders = ordersResponse.data.content;

      setRecentOrders(orders.slice(0, 5));
      
      setStats({
        totalUsers: usersResponse.data.totalElements,
        totalProducts: productsResponse.data.totalElements,
        totalOrders: ordersResponse.data.totalElements,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        activeDeliveries: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
        todayRevenue: orders
          .filter(o => isToday(new Date(o.createdAt || '')))
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        monthlyRevenue: orders
          .filter(o => isThisMonth(new Date(o.createdAt || '')))
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        growthRate: 12.5, // This would be calculated from historical data
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocketListeners = () => {
    websocketService.on('/topic/orders', handleOrderUpdate);
    websocketService.on('/topic/deliveries', handleDeliveryUpdate);
  };

  const handleOrderUpdate = (message: WebSocketMessage) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    // Reload orders when new order is created
    if (message.type === 'ORDER_CREATED') {
      loadDashboardData();
    }
  };

  const handleDeliveryUpdate = (message: WebSocketMessage) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]);
    // Update delivery stats
    if (message.type === 'DELIVERY_STATUS_CHANGED') {
      loadDashboardData();
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisMonth = (date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'CONFIRMED':
        return <AlertCircle className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'outline';
      case 'CONFIRMED':
      case 'PREPARING':
        return 'secondary';
      case 'READY':
      case 'OUT_FOR_DELIVERY':
        return 'default';
      case 'DELIVERED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">
              Welcome back, {user?.username}
            </h1>
            <p className="text-base text-muted-foreground">
              Here&apos;s what&apos;s happening with your restaurant today.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card className="group border border-border/60 shadow-md shadow-primary/5 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <div className="rounded-lg bg-muted/60 p-2 transition-colors group-hover:bg-muted">
                  <DollarSign className="h-5 w-5 text-foreground/70" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">${stats.monthlyRevenue.toFixed(2)}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-emerald-600">+{stats.growthRate}%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-border/60 shadow-md shadow-primary/5 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
                <div className="rounded-lg bg-muted/60 p-2 transition-colors group-hover:bg-muted">
                  <ShoppingCart className="h-5 w-5 text-foreground/70" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{stats.pendingOrders}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats.totalOrders} total orders today
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-border/60 shadow-md shadow-primary/5 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Deliveries</CardTitle>
                <div className="rounded-lg bg-muted/60 p-2 transition-colors group-hover:bg-muted">
                  <Truck className="h-5 w-5 text-foreground/70" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{stats.activeDeliveries}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Currently out for delivery
                </p>
              </CardContent>
            </Card>

            <Card className="group border border-border/60 shadow-md shadow-primary/5 transition-all hover:border-border/80 hover:shadow-lg hover:shadow-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Revenue</CardTitle>
                <div className="rounded-lg bg-muted/60 p-2 transition-colors group-hover:bg-muted">
                  <TrendingUp className="h-5 w-5 text-foreground/70" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">${stats.todayRevenue.toFixed(2)}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Updated in real-time
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="border border-border/60 shadow-md shadow-primary/5 lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                    <CardDescription className="mt-1">Latest orders from your restaurant</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadDashboardData}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full border border-border/60"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {recentOrders.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-10 text-center text-sm text-muted-foreground">
                      No recent orders available yet.
                    </div>
                  ) : (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-start gap-4 rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                        <div className="mt-0.5 rounded-full bg-muted p-2">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            Order #{order.orderNumber || order.id}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.customerName}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {format(new Date(order.createdAt || ''), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-sm font-semibold">${(order.totalAmount || 0).toFixed(2)}</p>
                          <Badge variant={getStatusColor(order.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-md shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Live Notifications</CardTitle>
                <CardDescription className="mt-1">Real-time updates via WebSocket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No new notifications
                    </p>
                  ) : (
                    notifications.map((notification, index) => (
                      <div key={index} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(notification.timestamp), 'HH:mm:ss')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Card className="border border-border/60 shadow-md shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <div className="rounded-lg bg-muted/60 p-2">
                  <Users className="h-5 w-5 text-foreground/70" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-md shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                <div className="rounded-lg bg-muted/60 p-2">
                  <Package className="h-5 w-5 text-foreground/70" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{stats.totalProducts}</div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-md shadow-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                <div className="rounded-lg bg-muted/60 p-2">
                  <ShoppingCart className="h-5 w-5 text-foreground/70" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold tracking-tight">{stats.totalOrders}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
