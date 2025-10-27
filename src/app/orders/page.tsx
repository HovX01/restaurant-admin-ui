'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/rbac';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Plus,
  Eye,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { apiService } from '@/services/api.service';
import { Order, OrderStatus, Product } from '@/types';
import { format } from 'date-fns';
import { 
  parseCustomerDetails, 
  getOrderItems, 
  getTotalPrice, 
  getCustomerName,
  getProductNameFromItem 
} from '@/lib/order-utils';

interface OrderFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<OrderFormData>({
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      notes: '',
      items: [{ productId: 0, quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {

      const [ordersResponse, productsResponse] = await Promise.all([
        apiService.getOrders({ page: 0, size: 100 }),
        apiService.getProducts({ page: 0, size: 100 }),
      ]);
      const ordersData = ordersResponse.data.content;
      const productsData = productsResponse.data.content;
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (data: OrderFormData) => {
    try {
      const orderData = {
        ...data,
        totalAmount: data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
      
      if (isEditing && selectedOrder) {
        // Note: Update functionality would need to be implemented in the API
        toast.info('Order editing is not yet implemented');
      } else {
        await apiService.createOrder(orderData);
        toast.success('Order created successfully');
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully');
      await loadData();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedOrder(null);
    form.reset({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      notes: '',
      items: [{ productId: 0, quantity: 1, price: 0 }],
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'CONFIRMED':
        return <AlertCircle className="h-4 w-4" />;
      case 'PREPARING':
        return <AlertCircle className="h-4 w-4" />;
      case 'READY':
        return <CheckCircle className="h-4 w-4" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="h-4 w-4" />;
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
        return 'default';
      case 'CONFIRMED':
        return 'secondary';
      case 'PREPARING':
        return 'default';
      case 'READY':
        return 'secondary';
      case 'OUT_FOR_DELIVERY':
        return 'default';
      case 'DELIVERED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'Order #',
      cell: ({ row }) => `#${row.getValue('id')}`,
    },
    {
      id: 'customerName',
      accessorFn: (row) => getCustomerName(row),
      header: 'Customer',
      cell: ({ row }) => getCustomerName(row.original),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => {
        const amount = getTotalPrice(row.original);
        return `${amount.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as OrderStatus;
        return (
          <Badge variant={getStatusColor(status)} className="flex items-center gap-1">
            {getStatusIcon(status)}
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return date ? format(new Date(date), 'MMM dd, HH:mm') : 'N/A';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(order)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              
              {order.status === 'PENDING' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm
                </DropdownMenuItem>
              )}
              
              {order.status === 'CONFIRMED' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'PREPARING')}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Start Preparing
                </DropdownMenuItem>
              )}
              
              {order.status === 'PREPARING' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'READY')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Ready
                </DropdownMenuItem>
              )}
              
              {order.status === 'READY' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}>
                  <Truck className="mr-2 h-4 w-4" />
                  Out for Delivery
                </DropdownMenuItem>
              )}
              
              {order.status === 'OUT_FOR_DELIVERY' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Delivered
                </DropdownMenuItem>
              )}
              
              {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                  className="text-destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER', 'KITCHEN_STAFF']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
              <p className="text-muted-foreground">
                Manage customer orders and track their status
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Order
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Order</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        rules={{ required: 'Customer name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter customer name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="customerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter delivery address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Order Items</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ productId: 0, quantity: 1, price: 0 })}
                        >
                          Add Item
                        </Button>
                      </div>
                      
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end space-x-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Product</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    const productId = parseInt(value);
                                    const product = products.find(p => p.id === productId);
                                    field.onChange(productId);
                                    if (product) {
                                      form.setValue(`items.${index}.price`, product.price);
                                    }
                                  }}
                                  value={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products.filter(p => p.available).map((product) => (
                                      <SelectItem key={product.id} value={product.id.toString()}>
                                        {product.name} - ${product.price.toFixed(2)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Qty</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    className="w-20"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="w-24"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Special instructions..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Create Order
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Order Details View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>
              {selectedOrder && (() => {
                const customerInfo = selectedOrder.customerDetails 
                  ? parseCustomerDetails(selectedOrder.customerDetails)
                  : {
                      name: selectedOrder.customerName || 'N/A',
                      phone: selectedOrder.customerPhone || '',
                      address: selectedOrder.customerAddress || '',
                      notes: selectedOrder.notes || '',
                    };
                const items = getOrderItems(selectedOrder);
                const totalPrice = getTotalPrice(selectedOrder);
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Order #</h4>
                        <p className="text-lg">#{selectedOrder.id}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                        <Badge variant={getStatusColor(selectedOrder.status)} className="mt-1">
                          {selectedOrder.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {selectedOrder.orderType && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground">Order Type</h4>
                        <p className="capitalize">{selectedOrder.orderType.toLowerCase().replace('_', ' ')}</p>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-16">Name:</span>
                          <span className="font-medium">{customerInfo.name}</span>
                        </div>
                        {customerInfo.phone && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-16">Phone:</span>
                            <span>{customerInfo.phone}</span>
                          </div>
                        )}
                        {customerInfo.address && (
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-16">Address:</span>
                            <span>{customerInfo.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {items.map((item, index) => {
                          const productName = getProductNameFromItem(item);
                          const itemTotal = item.price * item.quantity;
                          
                          return (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium">{productName}</span>
                                <span className="font-semibold">${itemTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Quantity: {item.quantity}</span>
                                <span>Unit Price: ${item.price.toFixed(2)}</span>
                              </div>
                              {item.product?.description && (
                                <p className="text-xs text-muted-foreground mt-1">{item.product.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {customerInfo.notes && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <p className="text-sm bg-muted p-3 rounded-lg">{customerInfo.notes}</p>
                      </div>
                    )}

                    {selectedOrder.delivery && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Delivery Information</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground min-w-24">Status:</span>
                            <Badge variant="outline">{selectedOrder.delivery.status}</Badge>
                          </div>
                          {selectedOrder.delivery.driver && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground min-w-24">Driver:</span>
                              <span>{selectedOrder.delivery.driver.firstName} {selectedOrder.delivery.driver.lastName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm text-muted-foreground">Created</h4>
                      <p className="text-sm">{selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'PPP p') : 'N/A'}</p>
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Orders List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={orders}
                searchKey="customerName"
                searchPlaceholder="Search by customer name..."
              />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}