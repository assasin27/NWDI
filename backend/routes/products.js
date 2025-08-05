const express = require('express');
const router = express.Router();
const { apiClient } = require('../utils/apiClient');

// Get all products with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const queryParams = new URLSearchParams();
    
    if (name) queryParams.append('search', name);
    if (category) queryParams.append('category', category);
    if (minPrice) queryParams.append('min_price', minPrice);
    if (maxPrice) queryParams.append('max_price', maxPrice);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products/products/?${queryString}` : '/products/products/';
    
    const response = await apiClient.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: error.response?.data?.detail || 'Server error fetching products' 
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const response = await apiClient.get(`/products/products/${productId}/`);
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: error.response?.data?.detail || 'Server error fetching product' 
    });
  }
});

// Create product
router.post('/', async (req, res, next) => {
  try {
    const { name, description, price, image, stock, category } = req.body;
    const response = await apiClient.post('/products/products/', {
      name,
      description,
      price,
      image,
      stock,
      category
    });
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: error.response?.data?.detail || 'Server error creating product' 
    });
  }
});

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const response = await apiClient.put(`/products/products/${productId}/`, req.body);
    res.json(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: error.response?.data?.detail || 'Server error updating product' 
    });
  }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    await apiClient.delete(`/products/products/${productId}/`);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: error.response?.data?.detail || 'Server error deleting product' 
    });
  }
});

module.exports = router;
