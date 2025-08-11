const express = require('express');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const { apiClient } = require('../utils/apiClient');

const router = express.Router();

// Create a new order
router.post('/', 
  [
    passport.authenticate('jwt', { session: false }),
    check('items').isArray({ min: 1 }).withMessage('At least one order item is required'),
    check('items.*.product').isInt({ min: 1 }).withMessage('Invalid product ID'),
    check('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    check('shipping_address').isObject().withMessage('Shipping address is required')
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { items, shipping_address } = req.body;
      
      // Prepare order data for Django API
      const orderData = {
        customer: req.user.id,
        status: 'PENDING',
        shipping_address: shipping_address,
        order_items: items.map(item => ({
          product: item.product,
          quantity: item.quantity
        }))
      };

      // Call Django API to create order
      const response = await apiClient.post('/orders/orders/', orderData);
      
      res.status(201).json(response.data);
    } catch (error) {
      console.error('Create order error:', error);
      
      if (error.response?.status === 400) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.response.data
        });
      }
      
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error creating order' 
      });
    }
  }
);

// Get all orders for the authenticated user
router.get('/', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      // Call Django API to get user's orders
      const response = await apiClient.get(`/orders/orders/?customer=${req.user.id}`);
      res.json(response.data);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error fetching orders' 
      });
    }
  }
);

// Get order by ID
router.get('/:id', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      // Call Django API to get order details
      const response = await apiClient.get(`/orders/orders/${req.params.id}/`);
      
      // Check if the order belongs to the authenticated user
      if (response.data.customer !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error('Get order error:', error);
      
      if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error fetching order' 
      });
    }
  }
);

// Update order status (for admin/seller)
router.patch('/:id/status', 
  [
    passport.authenticate('jwt', { session: false }),
    check('status').isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // First, get the order to check permissions
      const orderResponse = await apiClient.get(`/orders/orders/${req.params.id}/`);
      
      // Check if user is authorized to update this order
      // Note: In a real app, you'd also check if the user is an admin/seller
      if (orderResponse.data.customer !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
      
      // Update order status
      const response = await apiClient.patch(
        `/orders/orders/${req.params.id}/`,
        { status: req.body.status }
      );
      
      res.json(response.data);
    } catch (error) {
      console.error('Update order status error:', error);
      
      if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error updating order status' 
      });
    }
  }
);

module.exports = router;
