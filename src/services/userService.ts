import { ApiClient } from './apiClient';
import { BaseResponse } from '../types/api';
import { User, FarmerProfile, CustomerProfile, ShippingAddress } from '../types/user';

export class UserService {
  private api: ApiClient;
  private endpoint = '/api/v1/users';

  constructor(api: ApiClient) {
    this.api = api;
  }

  public async getCurrentUser(): Promise<BaseResponse<User>> {
    return this.api.get(`${this.endpoint}/me`);
  }

  public async updateProfile(userId: string, data: Partial<User>): Promise<BaseResponse<User>> {
    return this.api.put(`${this.endpoint}/${userId}/profile`, data);
  }

  public async getFarmerProfile(farmerId: string): Promise<BaseResponse<FarmerProfile>> {
    return this.api.get(`${this.endpoint}/farmers/${farmerId}`);
  }

  public async updateFarmerProfile(farmerId: string, data: Partial<FarmerProfile>): Promise<BaseResponse<FarmerProfile>> {
    return this.api.put(`${this.endpoint}/farmers/${farmerId}`, data);
  }

  public async getCustomerProfile(customerId: string): Promise<BaseResponse<CustomerProfile>> {
    return this.api.get(`${this.endpoint}/customers/${customerId}`);
  }

  public async updateCustomerProfile(customerId: string, data: Partial<CustomerProfile>): Promise<BaseResponse<CustomerProfile>> {
    return this.api.put(`${this.endpoint}/customers/${customerId}`, data);
  }

  public async addShippingAddress(customerId: string, address: Omit<ShippingAddress, 'id'>): Promise<BaseResponse<CustomerProfile>> {
    return this.api.post(`${this.endpoint}/customers/${customerId}/addresses`, address);
  }

  public async updateShippingAddress(customerId: string, addressId: string, address: Partial<ShippingAddress>): Promise<BaseResponse<CustomerProfile>> {
    return this.api.put(`${this.endpoint}/customers/${customerId}/addresses/${addressId}`, address);
  }

  public async deleteShippingAddress(customerId: string, addressId: string): Promise<BaseResponse<CustomerProfile>> {
    return this.api.delete(`${this.endpoint}/customers/${customerId}/addresses/${addressId}`);
  }

  public async setDefaultShippingAddress(customerId: string, addressId: string): Promise<BaseResponse<CustomerProfile>> {
    return this.api.post(`${this.endpoint}/customers/${customerId}/addresses/${addressId}/set-default`, {});
  }

  public async getAllFarmers(query?: string): Promise<BaseResponse<FarmerProfile[]>> {
    const params = query ? { search: query } : undefined;
    return this.api.get(`${this.endpoint}/farmers`, { params });
  }
}
