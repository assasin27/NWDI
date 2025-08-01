const express = require('express');
const passport = require('passport');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order');

const router = express.Router();

// Create Stripe payment intent for an order
router.post('/create-payment-intent', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ where: { id: orderId, customerId: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ message: 'Order already paid or processed' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: { orderId: order.id, customerId: req.user.id },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
});

// Webhook endpoint for Stripe (to be set in Stripe dashboard)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;
    // Mark order as paid
    await Order.update({ status: 'shipped' }, { where: { id: orderId } });
  }
  res.json({ received: true });
});

module.exports = router;
