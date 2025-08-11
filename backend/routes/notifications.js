const express = require('express');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const { apiClient } = require('../utils/apiClient');

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      const response = await apiClient.get(`/notifications/notifications/?user=${req.user.id}`);
      res.json(response.data);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error fetching notifications' 
      });
    }
  }
);

// Mark notification as read
router.patch('/:id/read', 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    try {
      const response = await apiClient.patch(
        `/notifications/notifications/${req.params.id}/`,
        { is_read: true }
      );
      
      if (response.data.user !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this notification' });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      
      if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error updating notification' 
      });
    }
  }
);

// Send order status notification
router.post('/order-status', 
  [
    passport.authenticate('jwt', { session: false }),
    check('order_id').isInt({ min: 1 }).withMessage('Valid order ID is required'),
    check('status').notEmpty().withMessage('Status is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { order_id, status, message } = req.body;
      
      // Get order details from Django API
      const orderResponse = await apiClient.get(`/orders/orders/${order_id}/`);
      
      // Create notification in Django
      const notificationData = {
        user: req.user.id,
        message: message || `Order #${order_id} status updated to: ${status}`,
        type: 'order_status',
        is_read: false
      };
      
      const notificationResponse = await apiClient.post(
        '/notifications/notifications/',
        notificationData
      );
      
      res.status(201).json(notificationResponse.data);
    } catch (error) {
      console.error('Create notification error:', error);
      
      if (error.response?.status === 400) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.response.data
        });
      }
      
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error creating notification' 
      });
    }
  }
);

module.exports = router;
