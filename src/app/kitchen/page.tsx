'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/rbac';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Timer,
  Utensils
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api.service';
import { websocketService } from '@/services/websocket.service';
import { Order, OrderStatus, WebSocketMessage } from '@/types';
import { format } from 'date-fns';
import { getCustomerName, getOrderItems, getProductNameFromItem, parseCustomerDetails } from '@/lib/order-utils';

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const setupListeners = () => {
      websocketService.on('/topic/orders', handleOrderUpdate);
      websocketService.on('/topic/kitchen', handleKitchenUpdate);
    };

    loadOrders();
    setupListeners();

    return () => {
      websocketService.off('/topic/orders', handleOrderUpdate);
      websocketService.off('/topic/kitchen', handleKitchenUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Get orders that are in kitchen workflow states
      const response = await apiService.getKitchenOrders({ page: 0, size: 100 });
      const data = response.data.content;
      const filteredOrders = data.filter(order => 
        ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status)
      );
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Failed to load kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = (message: WebSocketMessage) => {
    if (message.type === 'ORDER_CREATED' || message.type === 'ORDER_STATUS_CHANGED') {
      loadOrders();
    }
  };

  const handleKitchenUpdate = () => {
    loadOrders();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      toast.success(`Order #${orderId} status updated to ${status.replace('_', ' ')}`);
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'PREPARING':
        return 'secondary';
      case 'READY':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <Clock className="h-4 w-4" />;
      case 'PREPARING':
        return <Timer className="h-4 w-4" />;
      case 'READY':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMED');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'KITCHEN_STAFF']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ChefHat className="h-8 w-8" />
                Kitchen Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage order preparation and kitchen workflow
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Orders
            </Button>
          </div>

          {/* Kitchen Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{confirmedOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Waiting to be prepared
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{preparingOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently being prepared
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readyOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for pickup/delivery
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Kitchen Workflow Columns */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* New Orders Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <h2 className="text-xl font-semibold">New Orders ({confirmedOrders.length})</h2>
              </div>
              
              <div className="space-y-3">
                {confirmedOrders.map((order) => (
                  <Card key={order.id} className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          Confirmed
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getCustomerName(order)} • {order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : ''}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        {getOrderItems(order).map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              <Utensils className="h-3 w-3" />
                              {getProductNameFromItem(item)} x {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {(() => {
                        const customerInfo = parseCustomerDetails(order.customerDetails);
                        const notes = customerInfo.notes || order.notes;
                        return notes ? (
                          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <strong>Notes:</strong> {notes}
                          </div>
                        ) : null;
                      })()}
                      
                      <Button 
                        className="w-full" 
                        onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                      >
                        Start Preparing
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {confirmedOrders.length === 0 && (
                  <Card className="p-6 text-center text-muted-foreground">
                    <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    No new orders
                  </Card>
                )}
              </div>
            </div>

            {/* Preparing Orders Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <h2 className="text-xl font-semibold">In Preparation ({preparingOrders.length})</h2>
              </div>
              
              <div className="space-y-3">
                {preparingOrders.map((order) => (
                  <Card key={order.id} className="bg-orange-50 border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          Preparing
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getCustomerName(order)} • {order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : ''}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        {getOrderItems(order).map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              <Utensils className="h-3 w-3" />
                              {getProductNameFromItem(item)} x {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {(() => {
                        const customerInfo = parseCustomerDetails(order.customerDetails);
                        const notes = customerInfo.notes || order.notes;
                        return notes ? (
                          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <strong>Notes:</strong> {notes}
                          </div>
                        ) : null;
                      })()}
                      
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => handleStatusUpdate(order.id, 'READY')}
                      >
                        Mark as Ready
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {preparingOrders.length === 0 && (
                  <Card className="p-6 text-center text-muted-foreground">
                    <Timer className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    No orders in preparation
                  </Card>
                )}
              </div>
            </div>

            {/* Ready Orders Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Ready for Pickup ({readyOrders.length})</h2>
              </div>
              
              <div className="space-y-3">
                {readyOrders.map((order) => (
                  <Card key={order.id} className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          Ready
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getCustomerName(order)} • {order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : ''}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        {getOrderItems(order).map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                              <Utensils className="h-3 w-3" />
                              {getProductNameFromItem(item)} x {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Ready for delivery/pickup
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {readyOrders.length === 0 && (
                  <Card className="p-6 text-center text-muted-foreground">
                    <CheckCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    No orders ready
                  </Card>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}