// Mock error handler to avoid import.meta issues in tests
const errorHandler = {
  handleError: jest.fn(),
};

export default errorHandler;
