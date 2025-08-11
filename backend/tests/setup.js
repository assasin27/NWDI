// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_1234567890';
process.env.DJANGO_API_URL = 'http://localhost:8000/api';

// Mock console methods to keep test output clean
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
});

afterAll(() => {
  // Restore original console methods
  global.console = originalConsole;
});
