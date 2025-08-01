import { supabase } from "../integrations/supabase/supabaseClient";

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

  // Create Razorpay order
  async createRazorpayOrder(orderId: string, amount: number): Promise<any> {
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
      const { error } = await supabase
        .from('orders')
        .update({
          payment_id: paymentId,
          payment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order payment status:', error);
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
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  },

  // Save payment method
  async savePaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert([{
          user_id: userId,
          payment_method_id: paymentMethod.id,
          type: paymentMethod.type,
          card_brand: paymentMethod.card?.brand,
          card_last4: paymentMethod.card?.last4,
          card_exp_month: paymentMethod.card?.exp_month,
          card_exp_year: paymentMethod.card?.exp_year
        }]);

      if (error) {
        console.error('Error saving payment method:', error);
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