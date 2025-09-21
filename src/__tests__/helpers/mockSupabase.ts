// Mock Supabase client for testing
export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        then: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        then: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          then: jest.fn()
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        then: jest.fn()
      }))
    }))
  })),
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn()
  }
});

// Add a test to prevent "no tests found" error
describe('Mock Supabase', () => {
  it('should create mock client', () => {
    const mockClient = createMockSupabaseClient();
    expect(mockClient).toBeDefined();
    expect(mockClient.from).toBeDefined();
    expect(mockClient.auth).toBeDefined();
  });
});