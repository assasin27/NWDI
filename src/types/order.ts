export interface Order {
  id: string;
  customerId: string;
  farmerId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 
  | 'card'
  | 'upi'
  | 'netbanking'
  | 'cod';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  product?: {
    name: string;
    imageUrl: string;
  };
}

export interface OrderFilter {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
