// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
require('@testing-library/jest-dom');

// Suppress console errors during tests
console.error = jest.fn();

// Mock the Supabase client
jest.mock('@/integrations/supabase/client', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    mockResolvedValue: jest.fn(),
    mockResolvedValueOnce: jest.fn(),
  };
  
  // Add the ability to chain methods and mock resolved values
  mockSupabase.mockResolvedValue = function(value) {
    return jest.fn().mockResolvedValue(value);
  };
  
  mockSupabase.mockResolvedValueOnce = function(value) {
    return jest.fn().mockResolvedValueOnce(value);
  };
  
  return { supabase: mockSupabase };
});

// Suppress console errors during tests
console.error = jest.fn();