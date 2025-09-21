// Mock API Service for testing
export const mockApiService = {
  getCartItems: jest.fn(),
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  testCartConnection: jest.fn(),
};

// Add a test to prevent "no tests found" error
describe('Mock API Service', () => {
  it('should be defined', () => {
    expect(mockApiService).toBeDefined();
  });
});