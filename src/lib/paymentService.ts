import { apiService } from "./apiService";

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export const paymentService = {
  // Create Stripe payment intent
  async createStripePaymentIntent(orderId: string, amount: number): Promise<PaymentIntent | null> {
    try {
      const response = await fetch('/api/payments/create-stripe-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'inr'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Stripe payment intent:', error);
      return null;
    }
  },
};

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export const paymentService = {
  // Create Razorpay order
  async createRazorpayOrder(orderId: string, amount: number): Promise<RazorpayOrder | null> {
    try {
      const response = await fetch('/api/payments/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'INR'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return null;
    }
  },

  // Verify payment
  async verifyPayment(paymentId: string, orderId: string, signature?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          orderId,
          signature
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  },

  // Update order payment status
  async updateOrderPaymentStatus(orderId: string, paymentId: string, status: string): Promise<boolean> {
    try {
      const response = await apiService.updateOrderPaymentStatus(orderId, paymentId, status);

      if (response.error) {
        console.error('Error updating order payment status:', response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating order payment status:', error);
      return false;
    }
  },

  // Get payment methods for user
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await apiService.getPaymentMethods(userId);

      if (response.error) {
        console.error('Error fetching payment methods:', response.error);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  // Save payment method
  async savePaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<boolean> {
    try {
      const response = await apiService.savePaymentMethod(userId, paymentMethod);

      if (response.error) {
        console.error('Error saving payment method:', response.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving payment method:', error);
      return false;
    }
  },

  // Process refund
  async processRefund(paymentId: string, amount: number, reason: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Refund processing failed');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }
};