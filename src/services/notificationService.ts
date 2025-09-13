import { ApiClient } from './apiClient';
import { BaseResponse } from '../types/api';
import { Notification, StockAlert } from '../types/notification';

export class NotificationService {
  private api: ApiClient;
  private endpoint = '/api/v1/notifications';

  constructor(api: ApiClient) {
    this.api = api;
  }

  public async getNotifications(userId: string): Promise<BaseResponse<Notification[]>> {
    return this.api.get(`${this.endpoint}/${userId}`);
  }

  public async markAsRead(userId: string, notificationId: string): Promise<BaseResponse<void>> {
    return this.api.put(`${this.endpoint}/${userId}/${notificationId}/read`, {});
  }

  public async markAllAsRead(userId: string): Promise<BaseResponse<void>> {
    return this.api.put(`${this.endpoint}/${userId}/read-all`, {});
  }

  public async deleteNotification(userId: string, notificationId: string): Promise<BaseResponse<void>> {
    return this.api.delete(`${this.endpoint}/${userId}/${notificationId}`);
  }

  public async clearAllNotifications(userId: string): Promise<BaseResponse<void>> {
    return this.api.delete(`${this.endpoint}/${userId}`);
  }

  public async getUnreadCount(userId: string): Promise<BaseResponse<number>> {
    return this.api.get(`${this.endpoint}/${userId}/unread-count`);
  }

  public async getStockAlerts(farmerId: string): Promise<BaseResponse<StockAlert[]>> {
    return this.api.get(`${this.endpoint}/stock-alerts/${farmerId}`);
  }

  public async resolveStockAlert(alertId: string): Promise<BaseResponse<void>> {
    return this.api.put(`${this.endpoint}/stock-alerts/${alertId}/resolve`, {});
  }

  public async subscribeToProductAlerts(userId: string, productId: string): Promise<BaseResponse<void>> {
    return this.api.post(`${this.endpoint}/subscribe`, { userId, productId });
  }

  public async unsubscribeFromProductAlerts(userId: string, productId: string): Promise<BaseResponse<void>> {
    return this.api.delete(`${this.endpoint}/subscribe/${userId}/${productId}`);
  }
}
