'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/rbac';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Store, 
  Bell, 
  Mail,
  Clock,
  CreditCard,
  RefreshCw,
  Save,
  Globe,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api.service';
import { PageSkeleton } from '@/components/ui/loading';


interface RestaurantSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  currency: string;
  timezone: string;
  taxRate: number;
  deliveryFee: number;
  minimumOrderAmount: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  orderNotifications: boolean;
  deliveryNotifications: boolean;
  lowStockNotifications: boolean;
  customerNotifications: boolean;
}

interface OperationalSettings {
  preparationTime: number;
  deliveryTime: number;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  maxDeliveryDistance: number;
  allowPreOrders: boolean;
  preOrderDays: number;
  autoAcceptOrders: boolean;
}

interface PaymentSettings {
  acceptCash: boolean;
  acceptCard: boolean;
  acceptOnline: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  stripePublicKey: string;
  paypalClientId: string;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London Time' },
  { value: 'Europe/Paris', label: 'Central European Time' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    currency: 'USD',
    timezone: 'America/New_York',
    taxRate: 0,
    deliveryFee: 0,
    minimumOrderAmount: 0,
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    orderNotifications: true,
    deliveryNotifications: true,
    lowStockNotifications: true,
    customerNotifications: true,
  });
  const [operationalSettings, setOperationalSettings] = useState<OperationalSettings>({
    preparationTime: 15,
    deliveryTime: 30,
    openingHours: DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: { open: '09:00', close: '22:00', closed: false }
    }), {}),
    maxDeliveryDistance: 10,
    allowPreOrders: true,
    preOrderDays: 7,
    autoAcceptOrders: false,
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    acceptCash: true,
    acceptCard: true,
    acceptOnline: true,
    stripeEnabled: false,
    paypalEnabled: false,
    stripePublicKey: '',
    paypalClientId: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSettings();
      const data = response.data;
      
      if (data.restaurant) setRestaurantSettings(data.restaurant as RestaurantSettings);
      if (data.notifications) setNotificationSettings(data.notifications as NotificationSettings);
      if (data.operational) setOperationalSettings(data.operational as OperationalSettings);
      if (data.payment) setPaymentSettings(data.payment as PaymentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section: string, data: Record<string, unknown>) => {
    try {
      setSaving(true);
      await apiService.updateSettings({ [section]: data });
      toast.success(`${section} settings updated successfully`);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurantSave = () => {
    saveSettings('restaurant', restaurantSettings as unknown as Record<string, unknown>);
  };

  const handleNotificationSave = () => {
    saveSettings('notifications', notificationSettings as unknown as Record<string, unknown>);
  };

  const handleOperationalSave = () => {
    saveSettings('operational', operationalSettings as unknown as Record<string, unknown>);
  };

  const handlePaymentSave = () => {
    saveSettings('payment', paymentSettings as unknown as Record<string, unknown>);
  };

  const updateOpeningHours = (day: string, field: string, value: string | boolean) => {
    setOperationalSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminLayout>
          <PageSkeleton />
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your restaurant system configuration
              </p>
            </div>
            <Button onClick={loadSettings} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <Tabs defaultValue="restaurant" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
              <TabsTrigger value="operational">Operations</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="restaurant" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Restaurant Information
                  </CardTitle>
                  <CardDescription>
                    Basic information about your restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-name">Restaurant Name</Label>
                      <Input
                        id="restaurant-name"
                        value={restaurantSettings.name}
                        onChange={(e) => setRestaurantSettings(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter restaurant name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-phone">Phone Number</Label>
                      <Input
                        id="restaurant-phone"
                        value={restaurantSettings.phone}
                        onChange={(e) => setRestaurantSettings(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-description">Description</Label>
                    <Textarea
                      id="restaurant-description"
                      value={restaurantSettings.description}
                      onChange={(e) => setRestaurantSettings(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your restaurant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-address">Address</Label>
                    <Textarea
                      id="restaurant-address"
                      value={restaurantSettings.address}
                      onChange={(e) => setRestaurantSettings(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-email">Email</Label>
                      <Input
                        id="restaurant-email"
                        type="email"
                        value={restaurantSettings.email}
                        onChange={(e) => setRestaurantSettings(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@restaurant.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-website">Website</Label>
                      <Input
                        id="restaurant-website"
                        value={restaurantSettings.website}
                        onChange={(e) => setRestaurantSettings(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://restaurant.com"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={restaurantSettings.currency} 
                        onValueChange={(value) => setRestaurantSettings(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={restaurantSettings.timezone} 
                        onValueChange={(value) => setRestaurantSettings(prev => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        step="0.01"
                        value={restaurantSettings.taxRate}
                        onChange={(e) => setRestaurantSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="delivery-fee">Delivery Fee</Label>
                      <Input
                        id="delivery-fee"
                        type="number"
                        step="0.01"
                        value={restaurantSettings.deliveryFee}
                        onChange={(e) => setRestaurantSettings(prev => ({ ...prev, deliveryFee: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimum-order">Minimum Order Amount</Label>
                      <Input
                        id="minimum-order"
                        type="number"
                        step="0.01"
                        value={restaurantSettings.minimumOrderAmount}
                        onChange={(e) => setRestaurantSettings(prev => ({ ...prev, minimumOrderAmount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleRestaurantSave} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Restaurant Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="operational" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Service Times
                    </CardTitle>
                    <CardDescription>
                      Configure preparation and delivery times
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep-time">Average Preparation Time (minutes)</Label>
                      <Input
                        id="prep-time"
                        type="number"
                        value={operationalSettings.preparationTime}
                        onChange={(e) => setOperationalSettings(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery-time">Average Delivery Time (minutes)</Label>
                      <Input
                        id="delivery-time"
                        type="number"
                        value={operationalSettings.deliveryTime}
                        onChange={(e) => setOperationalSettings(prev => ({ ...prev, deliveryTime: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery-distance">Max Delivery Distance (km)</Label>
                      <Input
                        id="delivery-distance"
                        type="number"
                        value={operationalSettings.maxDeliveryDistance}
                        onChange={(e) => setOperationalSettings(prev => ({ ...prev, maxDeliveryDistance: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Order Management
                    </CardTitle>
                    <CardDescription>
                      Configure order handling preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Pre-orders</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow customers to place orders for future dates
                        </p>
                      </div>
                      <Switch
                        checked={operationalSettings.allowPreOrders}
                        onCheckedChange={(checked) => setOperationalSettings(prev => ({ ...prev, allowPreOrders: checked }))}
                      />
                    </div>

                    {operationalSettings.allowPreOrders && (
                      <div className="space-y-2">
                        <Label htmlFor="pre-order-days">Pre-order Days in Advance</Label>
                        <Input
                          id="pre-order-days"
                          type="number"
                          value={operationalSettings.preOrderDays}
                          onChange={(e) => setOperationalSettings(prev => ({ ...prev, preOrderDays: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Accept Orders</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically confirm incoming orders
                        </p>
                      </div>
                      <Switch
                        checked={operationalSettings.autoAcceptOrders}
                        onCheckedChange={(checked) => setOperationalSettings(prev => ({ ...prev, autoAcceptOrders: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Opening Hours
                  </CardTitle>
                  <CardDescription>
                    Set your restaurant&apos;s opening hours for each day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-24">
                          <Label className="text-sm font-medium">{day}</Label>
                        </div>
                        
                        <Switch
                          checked={!operationalSettings.openingHours[day]?.closed}
                          onCheckedChange={(checked) => updateOpeningHours(day, 'closed', !checked)}
                        />

                        {!operationalSettings.openingHours[day]?.closed && (
                          <>
                            <Input
                              type="time"
                              value={operationalSettings.openingHours[day]?.open || '09:00'}
                              onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={operationalSettings.openingHours[day]?.close || '22:00'}
                              onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                              className="w-32"
                            />
                          </>
                        )}

                        {operationalSettings.openingHours[day]?.closed && (
                          <span className="text-muted-foreground italic">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button onClick={handleOperationalSave} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Operational Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Channels
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive browser push notifications
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Notification Types
                    </CardTitle>
                    <CardDescription>
                      Choose which events trigger notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Order Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          New orders and status changes
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.orderNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, orderNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Delivery Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Delivery assignments and updates
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.deliveryNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, deliveryNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Low Stock Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Product inventory warnings
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.lowStockNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Customer Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          New customer registrations
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.customerNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, customerNotifications: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </CardTitle>
                    <CardDescription>
                      Configure accepted payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Accept Cash</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow cash payments on delivery
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.acceptCash}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, acceptCash: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Accept Card</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow card payments on delivery
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.acceptCard}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, acceptCard: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Accept Online Payments</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow online payments during order
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.acceptOnline}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, acceptOnline: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Payment Gateways
                    </CardTitle>
                    <CardDescription>
                      Configure online payment processors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Stripe</Label>
                        <p className="text-sm text-muted-foreground">
                          Process payments through Stripe
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.stripeEnabled}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, stripeEnabled: checked }))}
                      />
                    </div>

                    {paymentSettings.stripeEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                        <Input
                          id="stripe-key"
                          type="password"
                          value={paymentSettings.stripePublicKey}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, stripePublicKey: e.target.value }))}
                          placeholder="pk_..."
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable PayPal</Label>
                        <p className="text-sm text-muted-foreground">
                          Process payments through PayPal
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.paypalEnabled}
                        onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, paypalEnabled: checked }))}
                      />
                    </div>

                    {paymentSettings.paypalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="paypal-client">PayPal Client ID</Label>
                        <Input
                          id="paypal-client"
                          type="password"
                          value={paymentSettings.paypalClientId}
                          onChange={(e) => setPaymentSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
                          placeholder="PayPal Client ID"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePaymentSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Payment Settings
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}