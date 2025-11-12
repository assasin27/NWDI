/**
 * Mock Express API server for local development
 * Simulates Django REST API endpoints for Farmer Dashboard testing
 * Run: node backend-mock.js (runs on port 8000)
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Mock data generators
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const mockProducts = [
  {
    id: generateUUID(),
    name: 'Organic Tomatoes',
    description: 'Fresh, pesticide-free tomatoes',
    price: 45.50,
    quantity: 25,
    image_url: 'https://via.placeholder.com/300x300?text=Tomatoes',
    certification: 'Organic',
    region: 'Nareshwadi',
    category: 'Vegetables',
    unit: 'kg',
    in_stock: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Fresh Spinach',
    description: 'Leafy green spinach',
    price: 30.00,
    quantity: 5,
    image_url: 'https://via.placeholder.com/300x300?text=Spinach',
    certification: 'Organic',
    region: 'Nareshwadi',
    category: 'Leafy Greens',
    unit: 'kg',
    in_stock: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Carrots',
    description: 'Sweet orange carrots',
    price: 35.00,
    quantity: 0,
    image_url: 'https://via.placeholder.com/300x300?text=Carrots',
    certification: 'Organic',
    region: 'Nareshwadi',
    category: 'Vegetables',
    unit: 'kg',
    in_stock: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockOrders = [
  {
    id: generateUUID(),
    user_id: generateUUID(),
    customer_name: 'Raj Kumar',
    customer_email: 'raj@example.com',
    status: 'pending',
    total_amount: 250.50,
    shipping_address: '123 Main St, Nareshwadi',
    items: [
      { product_name: 'Organic Tomatoes', quantity: 2, price: 45.50 },
      { product_name: 'Fresh Spinach', quantity: 1, price: 30.00 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    user_id: generateUUID(),
    customer_name: 'Priya Singh',
    customer_email: 'priya@example.com',
    status: 'shipped',
    total_amount: 150.00,
    shipping_address: '456 Oak Ave, Nareshwadi',
    items: [
      { product_name: 'Carrots', quantity: 3, price: 35.00 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    user_id: generateUUID(),
    customer_name: 'Amit Patel',
    customer_email: 'amit@example.com',
    status: 'delivered',
    total_amount: 100.00,
    shipping_address: '789 Pine Rd, Nareshwadi',
    items: [
      { product_name: 'Organic Tomatoes', quantity: 1, price: 45.50 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock API server running' });
});

// Products endpoints
app.get('/api/v1/products/', (req, res) => {
  console.log('GET /api/v1/products/');
  res.json(mockProducts);
});

app.get('/api/v1/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/v1/products/', (req, res) => {
  const newProduct = {
    id: generateUUID(),
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mockProducts.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/v1/products/:id', (req, res) => {
  const idx = mockProducts.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    mockProducts[idx] = {
      ...mockProducts[idx],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    res.json(mockProducts[idx]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/v1/products/:id', (req, res) => {
  const idx = mockProducts.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    const deleted = mockProducts.splice(idx, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Orders endpoints
app.get('/api/v1/orders/', (req, res) => {
  console.log('GET /api/v1/orders/', req.query);
  const limit = parseInt(req.query.limit) || 10;
  res.json(mockOrders.slice(0, limit));
});

app.get('/api/v1/orders/:id', (req, res) => {
  const order = mockOrders.find(o => o.id === req.params.id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.put('/api/v1/orders/:id', (req, res) => {
  const idx = mockOrders.findIndex(o => o.id === req.params.id);
  if (idx !== -1) {
    mockOrders[idx] = {
      ...mockOrders[idx],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    res.json(mockOrders[idx]);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Categories endpoints
app.get('/api/v1/products/categories/', (req, res) => {
  const categories = [...new Set(mockProducts.map(p => p.category))];
  res.json(categories);
});

// Catch-all for debugging (using middleware, not app.all)
app.use((req, res) => {
  console.log(`${req.method} ${req.path} - not implemented`);
  res.status(404).json({ error: 'Endpoint not found', path: req.path, method: req.method });
});

app.listen(PORT, () => {
  console.log(`✓ Mock API server running at http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET /api/v1/health`);
  console.log(`  GET /api/v1/products/`);
  console.log(`  GET /api/v1/orders/?limit=10`);
  console.log(`  GET /api/v1/orders/:id`);
  console.log(`  PUT /api/v1/orders/:id`);
  console.log(`  POST /api/v1/products/`);
  console.log(`  PUT /api/v1/products/:id`);
  console.log(`  DELETE /api/v1/products/:id`);
});
