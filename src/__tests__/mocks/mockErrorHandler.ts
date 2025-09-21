// Mock error handler to avoid import.meta issues in tests
const errorHandler = {
  handleError: jest.fn(),
};

export default errorHandler;

// Add a simple test to prevent "no tests found" error
describe('mockErrorHandler', () => {
  it('should have handleError method', () => {
    expect(errorHandler.handleError).toBeDefined();
    expect(typeof errorHandler.handleError).toBe('function');
  });
});
