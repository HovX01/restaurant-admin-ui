'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/rbac';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Package,
  Navigation,
  Phone,
  User,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api.service';
import { websocketService } from '@/services/websocket.service';
import { Order, OrderStatus, User as UserType, WebSocketMessage, DeliveryDriver } from '@/types';
import { format } from 'date-fns';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export default function DeliveriesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadDeliveryOrders();
    loadDrivers();
    setupWebSocketListeners();

    return () => {
      websocketService.off('/topic/deliveries', handleDeliveryUpdate);
      websocketService.off('/topic/orders', handleOrderUpdate);
    };
  }, []);

  const loadDeliveryOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDeliveryOrders({ page: 0, size: 100 });
      const data = response.data.content;
      setOrders(data);
    } catch (error) {
      console.error('Failed to load delivery orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await apiService.getDeliveryDrivers({ page: 0, size: 100 });
      const data = response.data.content;
      setDrivers(data);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    }
  };

  const setupWebSocketListeners = () => {
    websocketService.on('/topic/deliveries', handleDeliveryUpdate);
    websocketService.on('/topic/orders', handleOrderUpdate);
  };

  const handleDeliveryUpdate = (message: WebSocketMessage) => {
    loadDeliveryOrders();
    loadDrivers();
  };

  const handleOrderUpdate = (message: WebSocketMessage) => {
    if (message.type === 'ORDER_STATUS_CHANGED' || message.type === 'DELIVERY_ASSIGNED') {
      loadDeliveryOrders();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDeliveryOrders(), loadDrivers()]);
    setRefreshing(false);
  };

  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriver) return;
    
    try {
      await apiService.assignDeliveryDriver(selectedOrder.id, selectedDriver, notes);
      toast.success(`Driver assigned to order #${selectedOrder.id}`);
      setIsAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedDriver(null);
      setNotes('');
      await loadDeliveryOrders();
      await loadDrivers();
    } catch (error) {
      console.error('Failed to assign driver:', error);
      toast.error('Failed to assign driver');
    }
  };

  const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      toast.success(`Order #${orderId} status updated to ${status.replace('_', ' ')}`);
      await loadDeliveryOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'READY':
        return 'default';
      case 'OUT_FOR_DELIVERY':
        return 'secondary';
      case 'DELIVERED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'READY':
        return <Package className="h-4 w-4" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };



  const readyOrders = orders.filter(o => o.status === 'READY');
  const outForDeliveryOrders = orders.filter(o => o.status === 'OUT_FOR_DELIVERY');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const availableDrivers = drivers.filter(d => d.enabled);

  const deliveryColumns: ColumnDef<Order>[] = [
    {
      header: 'Order ID',
      accessorKey: 'id',
      cell: ({ row }) => `#${row.original.id}`,
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
    },
    {
      header: 'Address',
      accessorKey: 'deliveryAddress',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-xs truncate">{row.original.deliveryAddress}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'customerPhone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {row.original.customerPhone}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status)} className="flex items-center gap-1 w-fit">
          {getStatusIcon(row.original.status)}
          {row.original.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Driver',
      accessorKey: 'assignedDriverName',
      cell: ({ row }) => (
        row.original.assignedDriverName ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            {row.original.assignedDriverName}
          </div>
        ) : (
          <span className="text-muted-foreground">Not assigned</span>
        )
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        row.original.createdAt ? format(new Date(row.original.createdAt), 'MMM dd, HH:mm') : ''
      ),
    },
    {
      header: 'Total',
      accessorKey: 'totalAmount',
      cell: ({ row }) => `$${row.original.totalAmount?.toFixed(2) || '0.00'}`,
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedOrder(row.original);
              setIsViewDialogOpen(true);
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
          {row.original.status === 'READY' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedOrder(row.original);
                setIsAssignDialogOpen(true);
              }}
            >
              <User className="h-3 w-3" />
            </Button>
          )}
          {row.original.status === 'OUT_FOR_DELIVERY' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate(row.original.id, 'DELIVERED')}
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'DELIVERY_STAFF']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Truck className="h-8 w-8" />
                Delivery Management
              </h1>
              <p className="text-muted-foreground">
                Manage delivery orders and track deliveries
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Delivery Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ready for Delivery</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{readyOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting assignment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out for Delivery</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{outForDeliveryOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently being delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deliveredOrders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Completed deliveries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableDrivers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for assignment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList>
              <TabsTrigger value="orders">Delivery Orders</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="map">Delivery Map</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <DataTable
                data={orders}
                columns={deliveryColumns}
                searchPlaceholder="Search orders..."
              />
            </TabsContent>

            <TabsContent value="drivers" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drivers.map((driver) => (
                  <Card key={driver.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {driver.firstName && driver.lastName ? `${driver.firstName} ${driver.lastName}` : driver.username}
                        </CardTitle>
                        <Badge variant={driver.enabled ? 'default' : 'secondary'}>
                          {driver.enabled ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {driver.phone}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Current deliveries:</span>
                          <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total deliveries:</span>
                          <span className="font-medium">0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              <Card className="p-6 text-center">
                <Navigation className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Delivery Map</h3>
                <p className="text-muted-foreground mb-4">
                  Interactive map showing real-time delivery locations would be integrated here.
                </p>
                <p className="text-sm text-muted-foreground">
                  This would typically integrate with services like Google Maps API or Mapbox
                  to show driver locations and delivery routes.
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Assign Driver Dialog */}
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Driver to Order #{selectedOrder?.id}</DialogTitle>
                <DialogDescription>
                  Select a driver to assign this delivery order.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Drivers</Label>
                  <Select value={selectedDriver?.toString()} onValueChange={(value) => setSelectedDriver(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id.toString()}>
                          <div className="flex items-center gap-2">
                            {driver.firstName && driver.lastName ? `${driver.firstName} ${driver.lastName}` : driver.username} - {driver.phone || 'No phone'}
                            <Badge variant="outline" className="ml-2">
                              0 active
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Delivery Notes (Optional)</Label>
                  <Textarea
                    placeholder="Special delivery instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {selectedOrder && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Order Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>Customer: {selectedOrder.customerName}</div>
                      <div>Phone: {selectedOrder.customerPhone}</div>
                      <div>Address: {selectedOrder.deliveryAddress}</div>
                      <div>Total: ${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignDriver} disabled={!selectedDriver}>
                  Assign Driver
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* View Order Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
                <DialogDescription>
                  Complete order information and delivery details
                </DialogDescription>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {selectedOrder.customerName}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {selectedOrder.customerPhone}
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          {selectedOrder.deliveryAddress}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Order Status</h4>
                      <div className="space-y-2">
                        <Badge variant={getStatusColor(selectedOrder.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(selectedOrder.status)}
                          {selectedOrder.status.replace('_', ' ')}
                        </Badge>
                        {selectedOrder.assignedDriverName && (
                          <div className="text-sm">
                            <strong>Driver:</strong> {selectedOrder.assignedDriverName}
                          </div>
                        )}
                        {selectedOrder.createdAt && (
                          <div className="text-sm text-muted-foreground">
                            Ordered: {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{item.productName} x {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Special Notes</h4>
                      <p className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}