const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');

// Get all products with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const where = {};
    if (name) where.name = { $like: `%${name}%` };
    if (category) where.categoryId = category;
    if (minPrice) where.price = { ...where.price, $gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, $lte: parseFloat(maxPrice) };
    const products = await Product.findAll({ where, include: Category });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Category });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/', async (req, res, next) => {
  try {
    const { name, description, price, image, inventory, categoryId } = req.body;
    const product = await Product.create({ name, description, price, image, inventory, categoryId });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
