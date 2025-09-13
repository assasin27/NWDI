import type { SupabaseClient } from '@supabase/supabase-js';

type MockQueryBuilder = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  in: jest.Mock;
  order: jest.Mock;
  match: jest.Mock;
  limit: jest.Mock;
  data: any;
  error: any;
};

// A helper function to create a mock Supabase client
export function createMockSupabaseClient() {
  function createMockQueryBuilder(): MockQueryBuilder {
    return {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      data: null,
      error: null,
    };
  }

  const mockAuth = {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: {}, error: null })),
    session: null,
    user: null,
  };

  const mockSupabase = {
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn().mockResolvedValue({ data: { Key: 'test.jpg' }, error: null }),
      createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://test.com/test.jpg' }, error: null }),
      remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: jest.fn((table: string) => {
      const builder = createMockQueryBuilder();
      // Allow chaining by returning the builder for common methods
      const chainable = ['select', 'insert', 'update', 'delete', 'eq', 'match', 'single', 'in', 'order', 'limit'];
      chainable.forEach(method => {
        (builder[method] as jest.Mock).mockReturnValue(builder);
      });
      return builder;
    }),
    auth: mockAuth,
  };

  return mockSupabase as unknown as SupabaseClient;
}

// Helper function to create a mock query result
export function createMockQueryResult<T>(data: T | null = null, error: Error | null = null) {
  return {
    data,
    error,
    count: data ? (Array.isArray(data) ? data.length : 1) : 0,
  };
}

// Types for mock responses
export interface MockSupabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}
