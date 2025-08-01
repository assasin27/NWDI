const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');
require('dotenv').config();

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await Customer.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({ name, email, password: hash });
    res.status(201).json({ id: customer.id, name: customer.name, email: customer.email });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, customer.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: customer.id, email: customer.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: customer.id, name: customer.name, email: customer.email } });
  } catch (err) {
    next(err);
  }
});

// Profile (protected)
const passport = require('passport');
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
