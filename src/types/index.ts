// User and Authentication Types
export type UserRole = 'ADMIN' | 'MANAGER' | 'KITCHEN_STAFF' | 'DELIVERY_STAFF';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
  success: boolean;
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

export interface OrderItem {
  id?: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface Order {
  id: number;
  orderNumber?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdBy?: User;
  createdAt?: string;
  updatedAt?: string;
}

// Delivery Types
export type DeliveryStatus = 'ASSIGNED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'FAILED';

export interface Delivery {
  id: number;
  orderId: number;
  order?: Order;
  deliveryStaffId: number;
  deliveryStaff?: User;
  status: DeliveryStatus;
  assignedAt?: string;
  deliveredAt?: string;
  notes?: string;
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

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Filter Types
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
