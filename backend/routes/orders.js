const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const { sequelize } = require('../models'); // Ensure sequelize instance is imported
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');

const router = express.Router();

// Create a new order
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items required' });
    }
    let total = 0;
    // Validate inventory and calculate total
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product || product.inventory < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Product unavailable: ${item.productId}` });
      }
      total += product.price * item.quantity;
    }
    // Create order
    const order = await Order.create({
      customerId: req.user.id,
      status: 'pending',
      total,
      shippingAddress,
    }, { transaction: t });
    // Create order items and update inventory
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }, { transaction: t });
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (product.inventory < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Insufficient inventory for product: ${item.productId}` });
      }
      await product.decrement('inventory', { by: item.quantity, transaction: t });
    }
    await t.commit();
    // TODO: Integrate payment gateway and shipping provider here
    // TODO: Send order confirmation notification
    res.status(201).json(order);
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

// Get all orders for the logged-in customer
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Get order by ID
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, customerId: req.user.id },
      include: [{ model: OrderItem, include: [Product] }],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Update order status (admin or system use)
router.put('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    // TODO: Send notification to customer about status update
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
