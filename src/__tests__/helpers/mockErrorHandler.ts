// Mock error handler for testing
export const mockHandleError = jest.fn();

// Add a test to prevent "no tests found" error
describe('Mock Error Handler', () => {
  it('should be defined', () => {
    expect(mockHandleError).toBeDefined();
  });
});