const request = require('supertest');
const app = require('../test.app');
const { apiClient } = require('../utils/apiClient');

// Mock the apiClient
jest.mock('../utils/apiClient');

describe('Products API', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stock: 10,
    category: 'test'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should fetch all products', async () => {
      // Mock the API client response
      apiClient.get.mockResolvedValueOnce({
        data: [mockProduct],
        status: 200
      });

      const res = await request(app)
        .get('/api/products')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toEqual([mockProduct]);
      expect(apiClient.get).toHaveBeenCalledWith('/products/products/');
    });

    it('should handle API errors', async () => {
      // Mock an error response
      apiClient.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      });

      const res = await request(app)
        .get('/api/products')
        .expect(500);

      expect(res.body).toHaveProperty('message', 'Server error fetching products');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should fetch a single product', async () => {
      const productId = 1;
      apiClient.get.mockResolvedValueOnce({
        data: mockProduct,
        status: 200
      });

      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(res.body).toEqual(mockProduct);
      expect(apiClient.get).toHaveBeenCalledWith(`/products/products/${productId}/`);
    });

    it('should return 404 for non-existent product', async () => {
      const productId = 999;
      apiClient.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Product not found' }
        }
      });

      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);

      expect(res.body).toHaveProperty('message', 'Product not found');
    });
  });

  // Add more test cases for POST, PUT, DELETE endpoints
});
