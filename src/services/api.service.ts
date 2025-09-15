import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { 
  User, Category, Product, Order, Delivery,
  LoginRequest, LoginResponse, RegisterRequest, ChangePasswordRequest,
  ApiResponse,
  UserFilter, ProductFilter, OrderFilter, DeliveryFilter,
  OrderStatus, DeliveryStatus
} from '@/types';

// Global error handler for authentication errors
let authErrorHandler: (() => void) | null = null;

export const setAuthErrorHandler = (handler: () => void) => {
  authErrorHandler = handler;
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
        if (error.response?.status === 401) {
          // Token expired or invalid - handle without page refresh
          Cookies.remove('jwt-token');
          if (authErrorHandler) {
            authErrorHandler();
          }
          // Don't show toast here for login failures, let the login component handle it
          if (!error.config?.url?.includes('/auth/login')) {
            toast.error('Session expired. Please login again.');
          }
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else if (error.response?.data?.error) {
          // Don't show generic error toast for login failures
          if (!error.config?.url?.includes('/auth/login')) {
            toast.error(error.response.data.error);
          }
        } else {
          // Don't show generic error toast for login failures
          if (!error.config?.url?.includes('/auth/login')) {
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

  // User APIs
  async getUsers(filter?: UserFilter): Promise<User[]> {
    const response = await this.api.get<ApiResponse<User[]>>('/users', { params: filter });
    return response.data.data || [];
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.api.get<User>(`/users/${id}`);
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

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}`);
    toast.success('User deleted successfully');
  }

  // Category APIs
  async getCategories(): Promise<Category[]> {
    const response = await this.api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data || [];
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await this.api.get<Category>(`/categories/${id}`);
    return response.data;
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await this.api.post<Category>('/categories', data);
    toast.success('Category created successfully');
    return response.data;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response = await this.api.put<Category>(`/categories/${id}`, data);
    toast.success('Category updated successfully');
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/categories/${id}`);
    toast.success('Category deleted successfully');
  }

  // Product APIs
  async getProducts(filter?: ProductFilter): Promise<Product[]> {
    const response = await this.api.get<ApiResponse<Product[]>>('/products', { params: filter });
    return response.data.data || [];
  }

  async getProductById(id: number): Promise<Product> {
    const response = await this.api.get<Product>(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await this.api.post<Product>('/products', data);
    toast.success('Product created successfully');
    return response.data;
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await this.api.put<Product>(`/products/${id}`, data);
    toast.success('Product updated successfully');
    return response.data;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.api.delete(`/products/${id}`);
    toast.success('Product deleted successfully');
  }

  // Order APIs
  async getOrders(filter?: OrderFilter): Promise<Order[]> {
    const response = await this.api.get<ApiResponse<Order[]>>('/orders', { params: filter });
    return response.data.data || [];
  }

  async getOrderById(id: number): Promise<Order> {
    const response = await this.api.get<Order>(`/orders/${id}`);
    return response.data;
  }

  async createOrder(data: Partial<Order>): Promise<Order> {
    const response = await this.api.post<Order>('/orders/create', data);
    toast.success('Order created successfully');
    return response.data;
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await this.api.put<Order>(`/orders/${id}/status`, { status });
    toast.success('Order status updated successfully');
    return response.data;
  }

  async getKitchenOrders(): Promise<Order[]> {
    const response = await this.api.get<ApiResponse<Order[]>>('/orders/kitchen');
    return response.data.data || [];
  }

  // Delivery APIs
  async getDeliveries(filter?: DeliveryFilter): Promise<Delivery[]> {
    const response = await this.api.get<ApiResponse<Delivery[]>>('/deliveries', { params: filter });
    return response.data.data || [];
  }

  async assignDelivery(orderId: number, deliveryStaffId: number): Promise<Delivery> {
    const response = await this.api.post<Delivery>('/deliveries/assign', {
      orderId,
      deliveryStaffId
    });
    toast.success('Delivery assigned successfully');
    return response.data;
  }

  async updateDeliveryStatus(id: number, status: DeliveryStatus): Promise<Delivery> {
    const response = await this.api.put<Delivery>(`/deliveries/${id}/status`, { status });
    toast.success('Delivery status updated successfully');
    return response.data;
  }

  async getMyDeliveries(): Promise<Delivery[]> {
    const response = await this.api.get<ApiResponse<Delivery[]>>('/deliveries/my');
    return response.data.data || [];
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<unknown> {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }
}

export const apiService = new ApiService();
