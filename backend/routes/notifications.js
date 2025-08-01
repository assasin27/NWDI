const express = require('express');
const passport = require('passport');
const Order = require('../models/order');
const Customer = require('../models/customer');
const { sendOrderNotification } = require('../controllers/notificationController');

const router = express.Router();

// Send notification for order status update
router.post('/order-status', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const customer = await Customer.findByPk(order.customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const subject = `Order #${order.id} Status Update`;
    const text = `Dear ${customer.name},\n\nYour order status is now: ${status}.\n\nThank you for shopping with us!`;
    await sendOrderNotification(customer.email, subject, text);
    res.json({ message: 'Notification sent' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
