import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { toast } from 'sonner';
import { WebSocketMessage, UserRole } from '@/types';

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  }

  connect(token: string, userId: number, userRole: UserRole): void {
    if (this.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const socket = new SockJS(`${this.baseURL}/ws`);
    
    this.client = new Client({
      webSocketFactory: () => socket as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[STOMP Debug]:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;

      // Subscribe to global topics
      this.subscribeToGlobalTopics();

      // Subscribe to role-specific topics
      this.subscribeToRoleTopics(userRole);

      // Subscribe to user-specific notifications
      this.subscribeToUserNotifications(userId);

      toast.success('Real-time connection established');
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket disconnected');
      this.connected = false;
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      this.connected = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        toast.error(`Connection lost. Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      } else {
        toast.error('Failed to establish real-time connection');
      }
    };

    this.client.activate();
  }

  private subscribeToGlobalTopics(): void {
    if (!this.client || !this.connected) return;

    // Subscribe to global order notifications
    this.client.subscribe('/topic/orders', (message: IMessage) => {
      this.handleMessage('/topic/orders', message);
    });

    // Subscribe to global delivery notifications
    this.client.subscribe('/topic/deliveries', (message: IMessage) => {
      this.handleMessage('/topic/deliveries', message);
    });

    // Subscribe to system alerts
    this.client.subscribe('/topic/system', (message: IMessage) => {
      this.handleMessage('/topic/system', message);
    });
  }

  private subscribeToRoleTopics(role: UserRole): void {
    if (!this.client || !this.connected) return;

    switch (role) {
      case 'KITCHEN_STAFF':
        this.client.subscribe('/topic/kitchen', (message: IMessage) => {
          this.handleMessage('/topic/kitchen', message);
        });
        break;
      
      case 'DELIVERY_STAFF':
        this.client.subscribe('/topic/delivery-staff', (message: IMessage) => {
          this.handleMessage('/topic/delivery-staff', message);
        });
        break;
      
      case 'ADMIN':
      case 'MANAGER':
        // Admins and managers get all notifications
        this.client.subscribe('/topic/kitchen', (message: IMessage) => {
          this.handleMessage('/topic/kitchen', message);
        });
        this.client.subscribe('/topic/delivery-staff', (message: IMessage) => {
          this.handleMessage('/topic/delivery-staff', message);
        });
        break;
    }
  }

  private subscribeToUserNotifications(userId: number): void {
    if (!this.client || !this.connected) return;

    this.client.subscribe(`/user/${userId}/notifications`, (message: IMessage) => {
      this.handleMessage(`/user/${userId}/notifications`, message);
    });
  }

  private handleMessage(topic: string, message: IMessage): void {
    try {
      const wsMessage: WebSocketMessage = JSON.parse(message.body);
      
      // Show toast notification based on message type
      this.showNotification(wsMessage);

      // Call registered handlers
      const handlers = this.handlers.get(topic);
      if (handlers) {
        handlers.forEach(handler => handler(wsMessage));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private showNotification(message: WebSocketMessage): void {
    const { type, message: text, data } = message;
    const orderData = data as { orderId?: number; status?: string } | undefined;

    switch (type) {
      case 'ORDER_CREATED':
        toast.info(`New Order: ${text}`, {
          description: orderData?.orderId ? `Order #${orderData.orderId}` : undefined,
        });
        break;

      case 'ORDER_STATUS_CHANGED':
        toast.info(`Order Status Updated: ${text}`, {
          description: orderData?.status ? `Status: ${orderData.status}` : undefined,
        });
        break;

      case 'DELIVERY_ASSIGNED':
        toast.success(`Delivery Assigned: ${text}`);
        break;

      case 'KITCHEN_NEW_ORDER':
        toast.warning(`Kitchen Alert: ${text}`, {
          description: 'New order requires preparation',
        });
        break;

      case 'DELIVERY_READY_ORDER':
        toast.success(`Ready for Delivery: ${text}`);
        break;

      case 'SYSTEM_ALERT':
        toast.error(`System Alert: ${text}`);
        break;

      default:
        toast.info(text);
    }
  }

  // Register a handler for a specific topic
  on(topic: string, handler: MessageHandler): void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)?.add(handler);
  }

  // Remove a handler for a specific topic
  off(topic: string, handler: MessageHandler): void {
    this.handlers.get(topic)?.delete(handler);
  }

  // Send a message to the server
  send(destination: string, body: unknown): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.handlers.clear();
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const websocketService = new WebSocketService();
