import { Order, OrderItem } from '@/types';

export const parseCustomerDetails = (customerDetails?: string) => {
  if (!customerDetails) return { name: 'N/A', phone: '', address: '', notes: '' };
  
  const namePart = customerDetails.match(/Name:\s*([^|]+)/)?.[1]?.trim() || 'N/A';
  const phonePart = customerDetails.match(/Phone:\s*([^|]+)/)?.[1]?.trim() || '';
  const addressPart = customerDetails.match(/Address:\s*([^|]+)/)?.[1]?.trim() || '';
  const notesPart = customerDetails.match(/Notes:\s*(.+)/)?.[1]?.trim() || '';
  
  return {
    name: namePart,
    phone: phonePart,
    address: addressPart,
    notes: notesPart,
  };
};

export const getOrderItems = (order: Order): OrderItem[] => {
  return order.orderItems || order.items || [];
};

export const getTotalPrice = (order: Order): number => {
  return order.totalPrice || order.totalAmount || 0;
};

export const getCustomerName = (order: Order): string => {
  if (order.customerName) return order.customerName;
  if (order.customerDetails) {
    return parseCustomerDetails(order.customerDetails).name;
  }
  return 'N/A';
};

export const getProductNameFromItem = (item: OrderItem): string => {
  return item.product?.name || item.productName || 'Unknown Product';
};
