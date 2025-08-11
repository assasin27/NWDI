const express = require('express');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { apiClient } = require('../utils/apiClient');

const router = express.Router();

// Create Stripe payment intent for an order
router.post('/create-payment-intent', 
  [
    passport.authenticate('jwt', { session: false }),
    check('order_id').isInt({ min: 1 }).withMessage('Valid order ID is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { order_id } = req.body;
      
      // Get order details from Django API
      const orderResponse = await apiClient.get(`/orders/orders/${order_id}/`);
      const order = orderResponse.data;
      
      // Check if the order belongs to the authenticated user
      if (order.customer !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to pay for this order' });
      }
      
      // Check if order is already paid or in a terminal state
      if (order.status !== 'PENDING') {
        return res.status(400).json({ 
          message: `Order is already ${order.status.toLowerCase()}` 
        });
      }
      
      // Create a payment record in Django
      const paymentData = {
        order: order_id,
        amount: order.total,
        status: 'PENDING',
        payment_method: 'stripe'
      };
      
      const paymentResponse = await apiClient.post('/payments/payments/', paymentData);
      
      // Create a Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total * 100), // Stripe expects amount in cents
        currency: 'usd',
        metadata: { 
          order_id: order_id,
          payment_id: paymentResponse.data.id,
          customer_id: req.user.id 
        },
      });
      
      // Update payment with payment intent ID
      await apiClient.patch(
        `/payments/payments/${paymentResponse.data.id}/`,
        { payment_intent_id: paymentIntent.id }
      );
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        payment_id: paymentResponse.data.id
      });
      
    } catch (error) {
      console.error('Create payment intent error:', error);
      
      if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error creating payment intent' 
      });
    }
  }
);

// Webhook endpoint for Stripe (to be set in Stripe dashboard)
router.post('/webhook', 
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body, 
        sig, 
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const paymentFailed = event.data.object;
        await handlePaymentIntentFailed(paymentFailed);
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

// Helper function to handle successful payments
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    const { payment_id, order_id } = paymentIntent.metadata;
    
    // Update payment status to PAID in Django
    await apiClient.patch(
      `/payments/payments/${payment_id}/`,
      { 
        status: 'PAID',
        payment_details: {
          payment_intent_id: paymentIntent.id,
          payment_method: paymentIntent.payment_method_types[0],
          amount_received: paymentIntent.amount_received / 100, // Convert back to dollars
          receipt_url: paymentIntent.charges?.data[0]?.receipt_url
        }
      }
    );
    
    // Update order status to PAID in Django
    await apiClient.patch(
      `/orders/orders/${order_id}/`,
      { status: 'PAID' }
    );
    
    console.log(`Payment ${payment_id} for order ${order_id} processed successfully`);
    
  } catch (error) {
    console.error('Error processing payment success:', error);
    // In a production environment, you might want to implement retry logic here
  }
}

// Helper function to handle failed payments
async function handlePaymentIntentFailed(paymentFailed) {
  try {
    const { payment_id, order_id } = paymentFailed.metadata;
    
    // Update payment status to FAILED in Django
    await apiClient.patch(
      `/payments/payments/${payment_id}/`,
      { 
        status: 'FAILED',
        error: paymentFailed.last_payment_error?.message || 'Payment failed'
      }
    );
    
    console.error(`Payment ${payment_id} for order ${order_id} failed`);
    
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}

module.exports = router;
