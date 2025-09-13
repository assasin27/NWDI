export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

export type NotificationType = 
  | 'order_status'
  | 'payment_status'
  | 'stock_alert'
  | 'price_update'
  | 'review'
  | 'system';

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  alertType: 'low_stock' | 'out_of_stock';
  message: string;
  isResolved: boolean;
  createdAt: string;
}
