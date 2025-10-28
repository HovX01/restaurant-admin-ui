import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { 
  User, Category, Product, Order, Delivery,
  LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest,
  ApiResponse, PaginatedResponse,
  UserFilter, ProductFilter, OrderFilter, DeliveryFilter
} from '@/types';

// Global error handler for authentication errors
let authErrorHandler: (() => void) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  authErrorHandler = handler;
};

export const setUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = Cookies.get('jwt-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        const isRegisterRequest = error.config?.url?.includes('/auth/register');
        const shouldShowToast = !isLoginRequest && !isRegisterRequest;

        if (error.response?.status === 401) {
          // Token expired or invalid
          if (isLoginRequest) {
            // For login failures, don't handle here - let the login component handle it
            return Promise.reject(error);
          }
          // For authenticated requests, clear token and redirect
          Cookies.remove('jwt-token');
          if (authErrorHandler) {
            authErrorHandler();
          }
          if (shouldShowToast) {
            toast.error('Your session has expired. Please log in again.');
          }
        } else if (error.response?.status === 403) {
          // Handle unauthorized access
          if (unauthorizedHandler) {
            unauthorizedHandler();
          }
          if (shouldShowToast) {
            toast.error('Access denied. You do not have permission to perform this action.');
          }
        } else if (error.response) {
          // Extract error message from response
          const errorMessage = 
            error.response.data?.error || 
            error.response.data?.message || 
            error.response.statusText ||
            'An unexpected error occurred.';
          
          if (shouldShowToast) {
            toast.error(errorMessage);
          }
        } else if (error.request) {
          // Network error - no response received
          if (shouldShowToast) {
            toast.error('Network error. Please check your connection.');
          }
        } else {
          // Other errors
          if (shouldShowToast) {
            toast.error('An unexpected error occurred.');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await this.api.post<ApiResponse<User>>('/auth/register', data);
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>('/auth/change-password', data);
    return response.data;
  }

  async getCurrentUserInfo(): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>('/auth/info');
    return response.data;
  }

  // User APIs
  async getUsers(params?: { 
    page?: number; 
    size?: number; 
    sortBy?: string; 
    sortDir?: string; 
    role?: string; 
    enabled?: boolean; 
    search?: string; 
  }): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  }

  async getUsersLegacy(filter?: UserFilter): Promise<User[]> {
    const response = await this.api.get<ApiResponse<User[]>>('/users/all', { params: filter });
    return response.data.data || [];
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  async getUserByUsername(username: string): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/users/username/${username}`);
    return response.data;
  }

  async getUsersByRole(role: string): Promise<ApiResponse<User[]>> {
    const response = await this.api.get<ApiResponse<User[]>>(`/users/role/${role}`);
    return response.data;
  }

  async getUsersByEnabledStatus(enabled: boolean): Promise<ApiResponse<User[]>> {
    const response = await this.api.get<ApiResponse<User[]>>(`/users/enabled/${enabled}`);
    return response.data;
  }

  async getAvailableDeliveryStaff(): Promise<ApiResponse<User[]>> {
    const response = await this.api.get<ApiResponse<User[]>>('/users/delivery-staff/available');
    return response.data;
  }

  async createUser(data: Partial<User>): Promise<User> {
    const response = await this.api.post<User>('/users', data);
    toast.success('User created successfully');
    return response.data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await this.api.put<User>(`/users/${id}`, data);
    toast.success('User updated successfully');
    return response.data;
  }

  async updateUserRole(id: number, role: string): Promise<ApiResponse<User>> {
    const response = await this.api.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    toast.success('User role updated successfully');
    return response.data;
  }

  async toggleUserStatus(id: number): Promise<ApiResponse<User>> {
    const response = await this.api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`);
    toast.success('User status updated successfully');
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/users/${id}`);
    toast.success('User deleted successfully');
    return response.data;
  }

  // Category APIs
  async getCategories(params?: { 
    page?: number; 
    size?: number; 
    sortBy?: string; 
    sortDir?: string; 
    name?: string; 
  }): Promise<PaginatedResponse<Category>> {
    const response = await this.api.get<PaginatedResponse<Category>>('/categories', { params });
    return response.data;
  }

  async getCategoriesLegacy(): Promise<Category[]> {
    const response = await this.api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data || [];
  }

  async getCategoryById(id: number): Promise<ApiResponse<Category>> {
    const response = await this.api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }

  async searchCategories(name: string): Promise<ApiResponse<Category[]>> {
    const response = await this.api.get<ApiResponse<Category[]>>('/categories/search', { params: { name } });
    return response.data;
  }

  async checkCategoryExists(name: string): Promise<ApiResponse<boolean>> {
    const response = await this.api.get<ApiResponse<boolean>>(`/categories/exists/${name}`);
    return response.data;
  }

  async createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
    const response = await this.api.post<ApiResponse<Category>>('/categories', data);
    toast.success('Category created successfully');
    return response.data;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
    const response = await this.api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    toast.success('Category updated successfully');
    return response.data;
  }

  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/categories/${id}`);
    toast.success('Category deleted successfully');
    return response.data;
  }

  // Product APIs
  async getProducts(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    category?: string;
    available?: boolean;
    name?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<PaginatedResponse<Product>> {
    const response = await this.api.get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
  }

  async getProductsLegacy(filter?: ProductFilter): Promise<Product[]> {
    const response = await this.api.get<ApiResponse<Product[]>>('/products/all', { params: filter });
    return response.data.data || [];
  }

  async getAvailableProducts(): Promise<ApiResponse<Product[]>> {
    const response = await this.api.get<ApiResponse<Product[]>>('/products/available');
    return response.data;
  }

  async getProductById(id: number): Promise<ApiResponse<Product>> {
    const response = await this.api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  }

  async getProductsByCategory(categoryId: number): Promise<ApiResponse<Product[]>> {
    const response = await this.api.get<ApiResponse<Product[]>>(`/products/category/${categoryId}`);
    return response.data;
  }

  async getAvailableProductsByCategory(categoryId: number): Promise<ApiResponse<Product[]>> {
    const response = await this.api.get<ApiResponse<Product[]>>(`/products/category/${categoryId}/available`);
    return response.data;
  }

  async searchProducts(name: string): Promise<ApiResponse<Product[]>> {
    const response = await this.api.get<ApiResponse<Product[]>>('/products/search', { params: { name } });
    return response.data;
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<ApiResponse<Product[]>> {
    const response = await this.api.get<ApiResponse<Product[]>>('/products/price-range', { 
      params: { minPrice, maxPrice } 
    });
    return response.data;
  }

  async checkProductExists(name: string): Promise<ApiResponse<boolean>> {
    const response = await this.api.get<ApiResponse<boolean>>(`/products/exists/${name}`);
    return response.data;
  }

  async createProduct(data: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await this.api.post<ApiResponse<Product>>('/products', data);
    toast.success('Product created successfully');
    return response.data;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await this.api.put<ApiResponse<Product>>(`/products/${id}`, data);
    toast.success('Product updated successfully');
    return response.data;
  }

  async toggleProductAvailability(id: number): Promise<ApiResponse<Product>> {
    const response = await this.api.patch<ApiResponse<Product>>(`/products/${id}/toggle-availability`);
    toast.success('Product availability updated successfully');
    return response.data;
  }

  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/products/${id}`);
    toast.success('Product deleted successfully');
    return response.data;
  }

  // Order APIs
  async getOrders(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    status?: string;
    customerId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>('/orders', { params });
    return response.data;
  }

  async getOrdersLegacy(filter?: OrderFilter): Promise<Order[]> {
    const response = await this.api.get<ApiResponse<Order[]>>('/orders/all', { params: filter });
    return response.data.data || [];
  }

  async getOrderById(id: number): Promise<ApiResponse<Order>> {
    const response = await this.api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  }

  async getOrdersByCustomer(customerId: number, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>(`/orders/customer/${customerId}`, { params });
    return response.data;
  }

  async getOrdersByStatus(status: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>(`/orders/status/${status}`, { params });
    return response.data;
  }

  async getOrdersByDateRange(startDate: string, endDate: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>('/orders/date-range', { 
      params: { startDate, endDate, ...params } 
    });
    return response.data;
  }

  async createOrder(data: Partial<Order>): Promise<ApiResponse<Order>> {
    const response = await this.api.post<ApiResponse<Order>>('/orders', data);
    toast.success('Order created successfully');
    return response.data;
  }

  async updateOrderStatus(id: number, status: string): Promise<ApiResponse<Order>> {
    const response = await this.api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    toast.success('Order status updated successfully');
    return response.data;
  }

  async cancelOrder(id: number): Promise<ApiResponse<Order>> {
    const response = await this.api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
    toast.success('Order cancelled successfully');
    return response.data;
  }

  async deleteOrder(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/orders/${id}`);
    toast.success('Order deleted successfully');
    return response.data;
  }

  // Delivery APIs
  async getDeliveries(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    status?: string;
    driverId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Delivery>> {
    const response = await this.api.get<PaginatedResponse<Delivery>>('/deliveries', { params });
    return response.data;
  }

  async getDeliveriesLegacy(filter?: DeliveryFilter): Promise<Delivery[]> {
    const response = await this.api.get<ApiResponse<Delivery[]>>('/deliveries/all', { params: filter });
    return response.data.data || [];
  }

  async getDeliveryById(id: number): Promise<ApiResponse<Delivery>> {
    const response = await this.api.get<ApiResponse<Delivery>>(`/deliveries/${id}`);
    return response.data;
  }

  async getDeliveriesByDriver(driverId: number, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Delivery>> {
    const response = await this.api.get<PaginatedResponse<Delivery>>(`/deliveries/driver/${driverId}`, { params });
    return response.data;
  }

  async getDeliveriesByStatus(status: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Delivery>> {
    const response = await this.api.get<PaginatedResponse<Delivery>>(`/deliveries/status/${status}`, { params });
    return response.data;
  }

  async getDeliveriesByDateRange(startDate: string, endDate: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Delivery>> {
    const response = await this.api.get<PaginatedResponse<Delivery>>('/deliveries/date-range', {
      params: { startDate, endDate, ...params }
    });
    return response.data;
  }

  async assignDelivery(orderId: number, driverId: number, deliveryAddress: string, deliveryNotes?: string): Promise<ApiResponse<Delivery>> {
    const response = await this.api.post<ApiResponse<Delivery>>('/deliveries/assign', { 
      orderId, 
      driverId, 
      deliveryAddress, 
      deliveryNotes 
    });
    toast.success('Delivery assigned successfully');
    return response.data;
  }

  async updateDeliveryStatus(id: number, status: string, notes?: string): Promise<ApiResponse<Delivery>> {
    const response = await this.api.patch<ApiResponse<Delivery>>(`/deliveries/${id}/status`, { status, notes });
    toast.success('Delivery status updated successfully');
    return response.data;
  }

  async getMyDeliveries(params?: { page?: number; size?: number; status?: string }): Promise<PaginatedResponse<Delivery>> {
    const response = await this.api.get<PaginatedResponse<Delivery>>('/deliveries/my', { params });
    return response.data;
  }

  async getMyDeliveriesLegacy(): Promise<Delivery[]> {
    const response = await this.api.get<ApiResponse<Delivery[]>>('/deliveries/my/all');
    return response.data.data || [];
  }

  async completeDelivery(id: number, notes?: string): Promise<ApiResponse<Delivery>> {
    const response = await this.api.patch<ApiResponse<Delivery>>(`/deliveries/${id}/complete`, { notes });
    toast.success('Delivery completed successfully');
    return response.data;
  }

  async cancelDelivery(id: number, reason?: string): Promise<ApiResponse<Delivery>> {
    const response = await this.api.patch<ApiResponse<Delivery>>(`/deliveries/${id}/cancel`, { reason });
    toast.success('Delivery cancelled successfully');
    return response.data;
  }

  // Kitchen Orders
  async getKitchenOrders(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    status?: string;
  }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>('/orders/kitchen', { params });
    return response.data;
  }

  async getKitchenOrdersLegacy(filter?: OrderFilter): Promise<Order[]> {
    const response = await this.api.get<ApiResponse<Order[]>>('/orders/kitchen/all', { params: filter });
    return response.data.data || [];
  }

  async getKitchenOrdersByStatus(status: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>(`/orders/kitchen/status/${status}`, { params });
    return response.data;
  }

  async updateKitchenOrderStatus(id: number, status: string): Promise<ApiResponse<Order>> {
    const response = await this.api.patch<ApiResponse<Order>>(`/orders/kitchen/${id}/status`, { status });
    toast.success('Kitchen order status updated successfully');
    return response.data;
  }

  // Delivery Orders
  async getDeliveryOrders(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    status?: string;
    driverId?: number;
  }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>('/orders/delivery', { params });
    return response.data;
  }

  async getDeliveryOrdersLegacy(filter?: OrderFilter): Promise<Order[]> {
    const response = await this.api.get<ApiResponse<Order[]>>('/orders/delivery/all', { params: filter });
    return response.data.data || [];
  }

  async getDeliveryOrdersByStatus(status: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>(`/orders/delivery/status/${status}`, { params });
    return response.data;
  }

  async getDeliveryOrdersByDriver(driverId: number, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Order>> {
    const response = await this.api.get<PaginatedResponse<Order>>(`/orders/delivery/driver/${driverId}`, { params });
    return response.data;
  }

  async updateDeliveryOrderStatus(id: number, status: string): Promise<ApiResponse<Order>> {
    const response = await this.api.patch<ApiResponse<Order>>(`/orders/delivery/${id}/status`, { status });
    toast.success('Delivery order status updated successfully');
    return response.data;
  }

  async assignDeliveryDriver(orderId: number, driverId: number, notes?: string): Promise<ApiResponse<Order>> {
    const response = await this.api.post<ApiResponse<Order>>(`/orders/${orderId}/assign-driver`, {
      driverId,
      notes
    });
    toast.success('Driver assigned successfully');
    return response.data;
  }

  // Delivery Driver APIs
  async getDeliveryDrivers(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    available?: boolean;
    status?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<PaginatedResponse<User>>('/delivery-drivers', { params });
    return response.data;
  }

  async getDeliveryDriversLegacy(): Promise<User[]> {
    const response = await this.api.get<ApiResponse<User[]>>('/delivery-drivers/all');
    return response.data.data || [];
  }

  async getAvailableDeliveryDrivers(): Promise<ApiResponse<User[]>> {
    const response = await this.api.get<ApiResponse<User[]>>('/delivery-drivers/available');
    return response.data;
  }

  async getDeliveryDriverById(id: number): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>(`/delivery-drivers/${id}`);
    return response.data;
  }

  async getDeliveryDriversByStatus(status: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<PaginatedResponse<User>>(`/delivery-drivers/status/${status}`, { params });
    return response.data;
  }

  async updateDeliveryDriverStatus(id: number, status: string): Promise<ApiResponse<User>> {
    const response = await this.api.patch<ApiResponse<User>>(`/delivery-drivers/${id}/status`, { status });
    toast.success('Delivery driver status updated successfully');
    return response.data;
  }

  async assignDeliveryToDriver(driverId: number, orderId: number): Promise<ApiResponse<Delivery>> {
    const response = await this.api.post<ApiResponse<Delivery>>(`/delivery-drivers/${driverId}/assign`, { orderId });
    toast.success('Order assigned to driver successfully');
    return response.data;
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<ApiResponse<unknown>> {
    const response = await this.api.get<ApiResponse<unknown>>('/dashboard/stats');
    return response.data;
  }

  async getDashboardOrderStats(): Promise<ApiResponse<unknown>> {
    const response = await this.api.get<ApiResponse<unknown>>('/dashboard/orders/stats');
    return response.data;
  }

  async getDashboardRevenueStats(): Promise<ApiResponse<unknown>> {
    const response = await this.api.get<ApiResponse<unknown>>('/dashboard/revenue/stats');
    return response.data;
  }

  async getDashboardDeliveryStats(): Promise<ApiResponse<unknown>> {
    const response = await this.api.get<ApiResponse<unknown>>('/dashboard/deliveries/stats');
    return response.data;
  }

  // Analytics APIs
  async getAnalyticsData(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<ApiResponse<unknown>> {
    const response = await this.api.get<ApiResponse<unknown>>('/analytics', { params });
    return response.data;
  }

  async exportAnalyticsData(format: 'csv' | 'excel', params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<Blob> {
    const response = await this.api.get('/analytics/export', {
      params: { format, ...params },
      responseType: 'blob'
    });
    return response.data;
  }

  // Settings APIs
  async getSettings(): Promise<ApiResponse<unknown>> {
    const response = await this.api.get<ApiResponse<unknown>>('/settings');
    return response.data;
  }

  async updateSettings(data: unknown): Promise<ApiResponse<unknown>> {
    const response = await this.api.put<ApiResponse<unknown>>('/settings', data);
    toast.success('Settings updated successfully');
    return response.data;
  }

  async getSettingsByKey(key: string): Promise<ApiResponse<unknown>> {
    const response = await this.api.get<ApiResponse<unknown>>(`/settings/${key}`);
    return response.data;
  }

  async updateSettingsByKey(key: string, value: unknown): Promise<ApiResponse<unknown>> {
    const response = await this.api.put<ApiResponse<unknown>>(`/settings/${key}`, { value });
    toast.success('Setting updated successfully');
    return response.data;
  }
}

export const apiService = new ApiService();
