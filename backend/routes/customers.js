const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { apiClient, setAuthTokens } = require('../utils/apiClient');

const router = express.Router();

// Register a new customer
router.post('/register', [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;
    
    // Call Django API to register user
    const response = await apiClient.post('/auth/register/', {
      name,
      email,
      password,
      password2: password, // Django's registration expects password confirmation
      is_seller: false
    });

    // Set auth tokens for subsequent requests
    setAuthTokens({
      access: response.data.access,
      refresh: response.data.refresh
    });

    // Return user data and tokens
    res.status(201).json({
      token: response.data.access,
      refresh_token: response.data.refresh,
      user: response.data.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error.response?.data?.email) {
      return res.status(400).json({ 
        message: 'Registration failed',
        errors: { email: error.response.data.email }
      });
    }
    
    res.status(500).json({ 
      message: error.response?.data?.message || 'Server error during registration' 
    });
  }
});

// Login customer
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Call Django API to get JWT tokens
    const response = await apiClient.post('/auth/token/', {
      email,
      password
    });

    // Set auth tokens for subsequent requests
    setAuthTokens({
      access: response.data.access,
      refresh: response.data.refresh
    });

    // Return tokens and user data
    res.json({
      token: response.data.access,
      refresh_token: response.data.refresh,
      user: response.data.user
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    res.status(500).json({ 
      message: error.response?.data?.detail || 'Server error during login' 
    });
  }
});

// Get current customer profile (protected route)
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Call Django API to get user profile
    const response = await apiClient.get(`/users/${req.user.id}/`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Profile error:', error);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ 
      message: error.response?.data?.detail || 'Server error fetching profile' 
    });
  }
});

// Update customer profile (protected route)
router.put('/profile', 
  passport.authenticate('jwt', { session: false }),
  [
    check('name').optional().notEmpty().withMessage('Name cannot be empty'),
    check('email').optional().isEmail().withMessage('Valid email is required'),
    check('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Prepare update data
      const updateData = {};
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.address) updateData.address = req.body.address;
      if (req.body.phone) updateData.phone = req.body.phone;
      
      // Handle password update if provided
      if (req.body.password) {
        updateData.password = req.body.password;
        updateData.password2 = req.body.password; // For confirmation
      }

      // Call Django API to update user
      const response = await apiClient.put(`/users/${req.user.id}/`, updateData);
      
      res.json(response.data);
    } catch (error) {
      console.error('Update profile error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.response.data
        });
      }
      
      res.status(500).json({ 
        message: error.response?.data?.detail || 'Server error updating profile' 
      });
    }
  }
);

// Logout (client-side should remove the token)
router.post('/logout', (req, res) => {
  // In JWT, logout is handled client-side by removing the token
  // This endpoint is just for consistency
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
