import { apiService } from "@/lib/apiService";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  orderDate: string;
  estimatedDelivery: string;
}

export const emailService = {
  // Send order confirmation email
  async sendOrderConfirmation(orderData: OrderEmailData): Promise<boolean> {
    try {
      const emailTemplate = this.generateOrderConfirmationTemplate(orderData);
      
      const response = await fetch('/api/email/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: orderData.customerEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          orderData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send order confirmation email');
      }

      // Log email sent to database
      await this.logEmailSent('order_confirmation', orderData.customerEmail, orderData.orderId);
      
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  },

  // Send order status update email
  async sendOrderStatusUpdate(orderId: string, customerEmail: string, status: string, trackingNumber?: string): Promise<boolean> {
    try {
      const emailTemplate = this.generateOrderStatusTemplate(status, trackingNumber);
      
      const response = await fetch('/api/email/send-status-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: customerEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          orderId,
          status,
          trackingNumber
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send order status update email');
      }

      await this.logEmailSent('order_status_update', customerEmail, orderId);
      
      return true;
    } catch (error) {
      console.error('Error sending order status update email:', error);
      return false;
    }
  },

  // Send welcome email
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    try {
      const emailTemplate = this.generateWelcomeTemplate(userName);
      
      const response = await fetch('/api/email/send-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          userName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send welcome email');
      }

      await this.logEmailSent('welcome', userEmail);
      
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    try {
      const emailTemplate = this.generatePasswordResetTemplate(resetToken);
      
      const response = await fetch('/api/email/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
          resetToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send password reset email');
      }

      await this.logEmailSent('password_reset', userEmail);
      
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  },

  // Generate order confirmation email template
  generateOrderConfirmationTemplate(orderData: OrderEmailData): EmailTemplate {
    const subject = `Order Confirmation - Order #${orderData.orderId}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your order, ${orderData.customerName}!</p>
          </div>
          <div class="content">
            <h2>Order Details</h2>
            <div class="order-details">
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
              <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>
              
              <h3>Items Ordered:</h3>
              ${orderData.orderItems.map(item => `
                <div class="item">
                  <span>${item.name} x ${item.quantity}</span>
                  <span>₹${item.price * item.quantity}</span>
                </div>
              `).join('')}
              
              <div class="total">
                <strong>Total: ₹${orderData.totalAmount}</strong>
              </div>
            </div>
            
            <h3>Shipping Address:</h3>
            <p>${orderData.shippingAddress}</p>
            
            <p>We'll send you updates on your order status. You can also track your order on our website.</p>
          </div>
          <div class="footer">
            <p>© 2024 Nareshwadi Products. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Order Confirmation - Order #${orderData.orderId}
      
      Thank you for your order, ${orderData.customerName}!
      
      Order Details:
      - Order ID: ${orderData.orderId}
      - Order Date: ${orderData.orderDate}
      - Estimated Delivery: ${orderData.estimatedDelivery}
      
      Items Ordered:
      ${orderData.orderItems.map(item => `- ${item.name} x ${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}
      
      Total: ₹${orderData.totalAmount}
      
      Shipping Address:
      ${orderData.shippingAddress}
      
      We'll send you updates on your order status.
      
      © 2024 Nareshwadi Products. All rights reserved.
    `;

    return { subject, html, text };
  },

  // Generate order status update template
  generateOrderStatusTemplate(status: string, trackingNumber?: string): EmailTemplate {
    const statusMessages = {
      'processing': 'Your order is being processed',
      'shipped': 'Your order has been shipped',
      'delivered': 'Your order has been delivered',
      'cancelled': 'Your order has been cancelled'
    };

    const subject = `Order Status Update - ${statusMessages[status]}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .status { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Status Update</h1>
          </div>
          <div class="content">
            <div class="status">
              <h2>${statusMessages[status]}</h2>
              ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
              <p>We'll keep you updated on any further changes to your order status.</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Nareshwadi Products. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Order Status Update
      
      ${statusMessages[status]}
      ${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}
      
      We'll keep you updated on any further changes to your order status.
      
      © 2024 Nareshwadi Products. All rights reserved.
    `;

    return { subject, html, text };
  },

  // Generate welcome email template
  generateWelcomeTemplate(userName: string): EmailTemplate {
    const subject = 'Welcome to Nareshwadi Products!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 Welcome to Nareshwadi Products!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Welcome to Nareshwadi Products! We're excited to have you as part of our community.</p>
            <p>Discover fresh, organic products sourced directly from local farmers:</p>
            <ul>
              <li>Fresh fruits and vegetables</li>
              <li>Organic grains and dairy</li>
              <li>Eco-friendly products</li>
              <li>Handmade items</li>
            </ul>
            <p>Start exploring our products today!</p>
          </div>
          <div class="footer">
            <p>© 2024 Nareshwadi Products. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Nareshwadi Products!
      
      Hello ${userName}!
      
      Welcome to Nareshwadi Products! We're excited to have you as part of our community.
      
      Discover fresh, organic products sourced directly from local farmers:
      - Fresh fruits and vegetables
      - Organic grains and dairy
      - Eco-friendly products
      - Handmade items
      
      Start exploring our products today!
      
      © 2024 Nareshwadi Products. All rights reserved.
    `;

    return { subject, html, text };
  },

  // Generate password reset template
  generatePasswordResetTemplate(resetToken: string): EmailTemplate {
    const subject = 'Password Reset Request - Nareshwadi Products';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested a password reset for your Nareshwadi Products account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${process.env.REACT_APP_FRONTEND_URL}/reset-password?token=${resetToken}" class="button">Reset Password</a>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
          </div>
          <div class="footer">
            <p>© 2024 Nareshwadi Products. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request - Nareshwadi Products
      
      Reset Your Password
      
      You requested a password reset for your Nareshwadi Products account.
      
      Click the link below to reset your password:
      ${process.env.REACT_APP_FRONTEND_URL}/reset-password?token=${resetToken}
      
      If you didn't request this password reset, please ignore this email.
      
      This link will expire in 1 hour for security reasons.
      
      © 2024 Nareshwadi Products. All rights reserved.
    `;

    return { subject, html, text };
  },

  // Log email sent to database
  async logEmailSent(type: string, recipientEmail: string, orderId?: string): Promise<void> {
    try {
      const result = await apiService.logEmailSent(type, recipientEmail, orderId);
      
      if (result.error) {
        console.error('Error logging email:', result.error);
      }
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }
};