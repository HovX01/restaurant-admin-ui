'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/rbac';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users,
  ShoppingCart,
  Clock,
  RefreshCw,
  Download,
  Calendar,
  Target,
  Percent,
  Star,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api.service';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    daily: Array<{ date: string; amount: number; orders: number }>;
  };
  orders: {
    total: number;
    growth: number;
    avgValue: number;
    byStatus: Array<{ status: string; count: number }>;
    hourlyDistribution: Array<{ hour: number; count: number }>;
  };
  products: {
    topSelling: Array<{ id: number; name: string; quantity: number; revenue: number }>;
    categories: Array<{ name: string; revenue: number; orders: number }>;
    lowStock: Array<{ id: number; name: string; stock: number }>;
  };
  customers: {
    total: number;
    newCustomers: number;
    retention: number;
    topCustomers: Array<{ name: string; orders: number; totalSpent: number }>;
  };
  performance: {
    avgPreparationTime: number;
    avgDeliveryTime: number;
    customerSatisfaction: number;
    completionRate: number;
  };
}

const PERIODS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom Range' },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [period, startDate, endDate]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      let dateRange = {};
      if (period === 'custom' && startDate && endDate) {
        dateRange = {
          startDate: format(startOfDay(startDate), 'yyyy-MM-dd'),
          endDate: format(endOfDay(endDate), 'yyyy-MM-dd'),
        };
      } else if (period !== 'custom') {
        const days = parseInt(period.replace('d', ''));
        dateRange = {
          startDate: format(startOfDay(subDays(new Date(), days)), 'yyyy-MM-dd'),
          endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
        };
      }

      const response = await apiService.getAnalyticsData(dateRange);
      setData(response.data as AnalyticsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await apiService.exportAnalyticsData('csv', {
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        type: period
      });
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Failed to export analytics:', error);
      toast.error('Failed to export analytics data');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↗' : '↘';
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return (
      <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
        <AdminLayout>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Business insights and performance metrics
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {period === 'custom' && (
                <div className="flex items-center gap-2">
                  <DatePicker
                    date={startDate}
                    onDateChange={setStartDate}
                    placeholder="Start date"
                  />
                  <span>to</span>
                  <DatePicker
                    date={endDate}
                    onDateChange={setEndDate}
                    placeholder="End date"
                  />
                </div>
              )}
              
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Button onClick={loadAnalyticsData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.revenue.total)}</div>
                <p className={`text-xs ${getGrowthColor(data.revenue.growth)} flex items-center`}>
                  {getGrowthIcon(data.revenue.growth)} {formatPercent(Math.abs(data.revenue.growth))} from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.orders.total.toLocaleString()}</div>
                <p className={`text-xs ${getGrowthColor(data.orders.growth)} flex items-center`}>
                  {getGrowthIcon(data.orders.growth)} {formatPercent(Math.abs(data.orders.growth))} from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.orders.avgValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Per order average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.performance.customerSatisfaction.toFixed(1)}/5</div>
                <p className="text-xs text-muted-foreground">
                  Average rating
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Daily Revenue Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.revenue.daily.slice(-7).map((day, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(day.date), 'MMM dd')}
                          </span>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(day.amount)}</div>
                            <div className="text-xs text-muted-foreground">{day.orders} orders</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.products.categories.map((category, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{category.name}</span>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(category.revenue)}</div>
                            <div className="text-xs text-muted-foreground">{category.orders} orders</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Orders by Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.orders.byStatus.map((status, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{status.status.toLowerCase().replace('_', ' ')}</span>
                          <div className="font-medium">{status.count}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Order Volume by Hour
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.orders.hourlyDistribution
                        .filter(h => h.count > 0)
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 6)
                        .map((hour, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">
                              {String(hour.hour).padStart(2, '0')}:00
                            </span>
                            <div className="font-medium">{hour.count} orders</div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Top Selling Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.products.topSelling.map((product, index) => (
                        <div key={product.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm font-medium">{product.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatCurrency(product.revenue)}</div>
                            <div className="text-xs text-muted-foreground">{product.quantity} sold</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-red-500" />
                      Low Stock Alert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.products.lowStock.length > 0 ? (
                      <div className="space-y-2">
                        {data.products.lowStock.map((product) => (
                          <div key={product.id} className="flex justify-between items-center">
                            <span className="text-sm">{product.name}</span>
                            <Badge variant="destructive">{product.stock} left</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">All products are well stocked</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Customer Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Customers</span>
                      <span className="font-medium">{data.customers.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Customers</span>
                      <span className="font-medium">{data.customers.newCustomers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Retention Rate</span>
                      <span className="font-medium">{formatPercent(data.customers.retention)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Top Customers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.customers.topCustomers.map((customer, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm font-medium">{customer.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</div>
                            <div className="text-xs text-muted-foreground">{customer.orders} orders</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Operational Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Preparation Time</span>
                      <span className="font-medium">{data.performance.avgPreparationTime} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Delivery Time</span>
                      <span className="font-medium">{data.performance.avgDeliveryTime} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Order Completion Rate</span>
                      <span className="font-medium">{formatPercent(data.performance.completionRate)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Performance Targets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Preparation Time Target: ≤ 15 min</span>
                        <span className={data.performance.avgPreparationTime <= 15 ? 'text-green-600' : 'text-red-600'}>
                          {data.performance.avgPreparationTime <= 15 ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Time Target: ≤ 30 min</span>
                        <span className={data.performance.avgDeliveryTime <= 30 ? 'text-green-600' : 'text-red-600'}>
                          {data.performance.avgDeliveryTime <= 30 ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Satisfaction Target: ≥ 4.5</span>
                        <span className={data.performance.customerSatisfaction >= 4.5 ? 'text-green-600' : 'text-red-600'}>
                          {data.performance.customerSatisfaction >= 4.5 ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}