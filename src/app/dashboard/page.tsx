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
import { getCustomerName, getTotalPrice } from '@/lib/order-utils';
import { usePageLoading } from '@/contexts/page-loading.context';

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
  const { startLoading, stopLoading } = usePageLoading();

  useEffect(() => {
    const loadData = async () => {
      await loadDashboardData(true);
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

  const loadDashboardData = async (withLoader = false) => {
    try {
      setIsLoading(true);
      if (withLoader) {
        startLoading();
      }
      
      // Load role-specific data
      if (user?.role === 'DELIVERY_STAFF') {
        // For drivers, only load their own deliveries
        const deliveriesResponse = await apiService.getMyDeliveries({ page: 0, size: 20 });
        const deliveries = deliveriesResponse.data.content;
        
        setStats({
          totalUsers: 0,
          totalProducts: 0,
          totalOrders: 0,
          pendingOrders: deliveries.filter(d => d.status === 'ASSIGNED').length,
          activeDeliveries: deliveries.filter(d => d.status === 'PICKED_UP' || d.status === 'ON_THE_WAY').length,
          todayRevenue: 0,
          monthlyRevenue: 0,
          growthRate: 0,
        });
        
        // Map deliveries to orders for display
        const ordersFromDeliveries = deliveries
          .filter(d => d.order)
          .map(d => d.order!)
          .slice(0, 5);
        setRecentOrders(ordersFromDeliveries);
      } else if (user?.role === 'KITCHEN_STAFF') {
        // For kitchen staff, only load kitchen orders
        const ordersResponse = await apiService.getKitchenOrders({ page: 0, size: 20 });
        const orders = ordersResponse.data.content;
        
        setRecentOrders(orders.slice(0, 5));
        
        setStats({
          totalUsers: 0,
          totalProducts: 0,
          totalOrders: ordersResponse.data.totalElements,
          pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length,
          activeDeliveries: orders.filter(o => o.status === 'PREPARING').length,
          todayRevenue: 0,
          monthlyRevenue: 0,
          growthRate: 0,
        });
      } else {
        // For ADMIN and MANAGER, load all data
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
            .reduce((sum, o) => sum + getTotalPrice(o), 0),
          monthlyRevenue: orders
            .filter(o => isThisMonth(new Date(o.createdAt || '')))
            .reduce((sum, o) => sum + getTotalPrice(o), 0),
          growthRate: 12.5, // This would be calculated from historical data
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      if (withLoader) {
        stopLoading();
      }
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
      case 'READY_FOR_PICKUP':
        return <CheckCircle className="h-4 w-4" />;
      case 'READY_FOR_DELIVERY':
        return <Package className="h-4 w-4" />;
      case 'COMPLETED':
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
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'PREPARING':
        return 'info';
      case 'READY_FOR_PICKUP':
        return 'success';
      case 'READY_FOR_DELIVERY':
        return 'success';
      case 'OUT_FOR_DELIVERY':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your restaurant today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+{stats.growthRate}%</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'DELIVERY_STAFF' ? 'Assigned Deliveries' : 'Pending Orders'}
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'DELIVERY_STAFF' 
                    ? 'Waiting to be picked up'
                    : user?.role === 'KITCHEN_STAFF'
                    ? 'Orders to prepare'
                    : `${stats.totalOrders} total orders today`
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user?.role === 'DELIVERY_STAFF' ? 'Active Deliveries' : user?.role === 'KITCHEN_STAFF' ? 'Preparing' : 'Active Deliveries'}
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'DELIVERY_STAFF' 
                    ? 'Currently delivering'
                    : user?.role === 'KITCHEN_STAFF'
                    ? 'Being prepared'
                    : 'Currently out for delivery'
                  }
                </p>
              </CardContent>
            </Card>

            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Updated in real-time
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Orders */}
            <Card className="col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {user?.role === 'DELIVERY_STAFF' 
                        ? 'My Deliveries' 
                        : user?.role === 'KITCHEN_STAFF'
                        ? 'Kitchen Orders'
                        : 'Recent Orders'
                      }
                    </CardTitle>
                    <CardDescription>
                      {user?.role === 'DELIVERY_STAFF' 
                        ? 'Your assigned delivery orders' 
                        : user?.role === 'KITCHEN_STAFF'
                        ? 'Orders to prepare in the kitchen'
                        : 'Latest orders from your restaurant'
                      }
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadDashboardData}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Order #{order.orderNumber || order.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getCustomerName(order)} • {format(new Date(order.createdAt || ''), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${getTotalPrice(order).toFixed(2)}</p>
                        <Badge variant={getStatusColor(order.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Notifications */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Live Notifications</CardTitle>
                <CardDescription>Real-time updates via WebSocket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No new notifications
                    </p>
                  ) : (
                    notifications.map((notification, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.timestamp), 'HH:mm:ss')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats - Only for ADMIN and MANAGER */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalProducts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
