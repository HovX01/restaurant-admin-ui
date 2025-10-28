// User and Authentication Types
export type UserRole = 'ADMIN' | 'MANAGER' | 'KITCHEN_STAFF' | 'DELIVERY_STAFF';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginData {
  token: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginData;
  error: string | null;
  timestamp: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  role?: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  category?: Category;
  available?: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId?: number;
  product?: Product;
  productName?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface Order {
  id: number;
  orderNumber?: string;
  customerId?: number;
  customer?: User;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerDetails?: string;
  deliveryAddress?: string;
  assignedDriverId?: number;
  assignedDriver?: User;
  assignedDriverName?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  totalAmount?: number;
  totalPrice?: number;
  status: OrderStatus;
  orderType?: OrderType;
  notes?: string;
  createdBy?: User;
  createdAt?: string;
  updatedAt?: string;
  delivery?: Delivery | null;
}

// Delivery Types
export type DeliveryStatus = 'ASSIGNED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'FAILED';

export interface Delivery {
  id: number;
  orderId: number;
  order?: Order;
  driverId: number;
  driver?: User;
  deliveryStaffId?: number; // Legacy field for backward compatibility
  deliveryStaff?: User; // Legacy field for backward compatibility
  status: DeliveryStatus;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
}

export interface DeliveryDriver {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentDeliveries: number;
  totalDeliveries: number;
}

// WebSocket Types
export type NotificationType = 
  | 'ORDER_CREATED' 
  | 'ORDER_UPDATED' 
  | 'ORDER_STATUS_CHANGED'
  | 'DELIVERY_ASSIGNED' 
  | 'DELIVERY_STATUS_CHANGED'
  | 'KITCHEN_NEW_ORDER'
  | 'DELIVERY_READY_ORDER'
  | 'DELIVERY_STAFF_NEW_ASSIGNMENT'
  | 'SYSTEM_ALERT'
  | 'USER_NOTIFICATION';

export interface WebSocketMessage {
  type: NotificationType;
  message: string;
  data?: unknown;
  timestamp: string;
}

// API Response Types (matching ApiResponseDTO from documentation)
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
  timestamp: string;
}

// Standardized Pagination Types
export interface PaginatedData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: PaginatedData<T>;
  error: string | null;
  timestamp: string;
}

// Settings Types
export interface RestaurantSettings {
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

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  orderNotifications: boolean;
  deliveryNotifications: boolean;
  lowStockNotifications: boolean;
  customerNotifications: boolean;
}

export interface OperationalSettings {
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

export interface PaymentSettings {
  acceptCash: boolean;
  acceptCard: boolean;
  acceptOnline: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  stripePublicKey: string;
  paypalClientId: string;
}
export interface UserFilter {
  role?: UserRole;
  search?: string;
}

export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  search?: string;
}

export interface OrderFilter {
  status?: OrderStatus;
  customerId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface DeliveryFilter {
  status?: DeliveryStatus;
  deliveryStaffId?: number;
  orderId?: number;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalOrders?: number;
  totalRevenue?: number;
  activeDeliveries?: number;
  completedOrders?: number;
  pendingOrders?: number;
  cancelledOrders?: number;
  [key: string]: unknown;
}

// Settings Container Type
export interface Settings {
  restaurant?: RestaurantSettings;
  notifications?: NotificationSettings;
  operational?: OperationalSettings;
  payment?: PaymentSettings;
  [key: string]: unknown;
}