import { databaseSetup } from '@/lib/databaseSetup';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

describe('databaseSetup', () => {
  // Mock responses
  const mockCartTableExists = {
    data: [{ table_name: 'cart_items' }],
    error: null
  };
  
  const mockWishlistTableExists = {
    data: [{ table_name: 'wishlist_items' }],
    error: null
  };
  
  const mockTableNotFound = {
    data: null,
    error: { code: '42P01', message: 'relation "cart_items" does not exist' }
  };
  
  const mockCreateTableSuccess = {
    data: {},
    error: null
  };
  
  const mockInsertSuccess = {
    data: { id: 1 },
    error: null
  };
  
  const mockDeleteSuccess = {
    data: {},
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAndCreateTables', () => {
    it('should not create tables if they already exist', async () => {
      // Mock RPC call for checking if tables exist
      const mockRpc = jest.fn()
        .mockResolvedValueOnce(mockCartTableExists)
        .mockResolvedValueOnce(mockWishlistTableExists);
      
      (supabase.rpc as jest.Mock).mockImplementation(mockRpc);

      const result = await databaseSetup.checkAndCreateTables();

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'cart_items' });
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'wishlist_items' });
      expect(supabase.rpc).toHaveBeenCalledTimes(2);
    });

    it('should create cart_items table if it does not exist', async () => {
      // Mock RPC calls
      const mockRpc = jest.fn()
        .mockResolvedValueOnce(mockTableNotFound) // cart_items doesn't exist
        .mockResolvedValueOnce(mockWishlistTableExists) // wishlist_items exists
        .mockResolvedValueOnce(mockCreateTableSuccess); // create cart_items success
      
      (supabase.rpc as jest.Mock).mockImplementation(mockRpc);

      const result = await databaseSetup.checkAndCreateTables();

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'cart_items' });
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'wishlist_items' });
      expect(supabase.rpc).toHaveBeenCalledWith('create_cart_items_table');
      expect(supabase.rpc).toHaveBeenCalledTimes(3);
    });

    it('should create wishlist_items table if it does not exist', async () => {
      // Mock RPC calls
      const mockRpc = jest.fn()
        .mockResolvedValueOnce(mockCartTableExists) // cart_items exists
        .mockResolvedValueOnce(mockTableNotFound) // wishlist_items doesn't exist
        .mockResolvedValueOnce(mockCreateTableSuccess); // create wishlist_items success
      
      (supabase.rpc as jest.Mock).mockImplementation(mockRpc);

      const result = await databaseSetup.checkAndCreateTables();

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'cart_items' });
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'wishlist_items' });
      expect(supabase.rpc).toHaveBeenCalledWith('create_wishlist_items_table');
      expect(supabase.rpc).toHaveBeenCalledTimes(3);
    });

    it('should create both tables if neither exists', async () => {
      // Mock RPC calls
      const mockRpc = jest.fn()
        .mockResolvedValueOnce(mockTableNotFound) // cart_items doesn't exist
        .mockResolvedValueOnce(mockTableNotFound) // wishlist_items doesn't exist
        .mockResolvedValueOnce(mockCreateTableSuccess) // create cart_items success
        .mockResolvedValueOnce(mockCreateTableSuccess); // create wishlist_items success
      
      (supabase.rpc as jest.Mock).mockImplementation(mockRpc);

      const result = await databaseSetup.checkAndCreateTables();

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'cart_items' });
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'wishlist_items' });
      expect(supabase.rpc).toHaveBeenCalledWith('create_cart_items_table');
      expect(supabase.rpc).toHaveBeenCalledWith('create_wishlist_items_table');
      expect(supabase.rpc).toHaveBeenCalledTimes(4);
    });

    it('should handle errors when checking tables', async () => {
      // Mock RPC call to throw an error
      const mockError = new Error('Database connection error');
      (supabase.rpc as jest.Mock).mockRejectedValue(mockError);

      const result = await databaseSetup.checkAndCreateTables();

      expect(result).toBe(false);
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'cart_items' });
    });

    it('should handle errors when creating tables', async () => {
      // Mock RPC calls
      const mockRpc = jest.fn()
        .mockResolvedValueOnce(mockTableNotFound) // cart_items doesn't exist
        .mockRejectedValueOnce(new Error('Failed to create table')); // create cart_items fails
      
      (supabase.rpc as jest.Mock).mockImplementation(mockRpc);

      const result = await databaseSetup.checkAndCreateTables();

      expect(result).toBe(false);
      expect(supabase.rpc).toHaveBeenCalledWith('get_table_info', { table_name: 'cart_items' });
      expect(supabase.rpc).toHaveBeenCalledWith('create_cart_items_table');
    });
  });

  describe('testConnection', () => {
    it('should return true if connection is successful', async () => {
      // Mock from().select().limit() chain for connection test
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [{}], error: null })
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await databaseSetup.testConnection();

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('count');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it('should return false if connection fails', async () => {
      // Mock from().select().limit() to return error
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'Connection failed' } })
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await databaseSetup.testConnection();

      expect(result).toBe(false);
      expect(supabase.from).toHaveBeenCalledWith('cart_items');
    });

    it('should handle exceptions', async () => {
      // Mock from() to throw an exception
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await databaseSetup.testConnection();

      expect(result).toBe(false);
      expect(supabase.from).toHaveBeenCalledWith('cart_items');
    });
  });

  describe('testInsert', () => {
    it('should successfully insert and delete a test item', async () => {
      // Mock from().insert().select() and from().delete().eq()
      const mockInsertQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockInsertSuccess)
      };
      
      const mockDeleteQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockDeleteSuccess)
      };
      
      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockInsertQueryBuilder)
        .mockReturnValueOnce(mockDeleteQueryBuilder);

      const result = await databaseSetup.testInsert();

      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockInsertQueryBuilder.insert).toHaveBeenCalledWith([{
        user_id: 'test-user-id',
        product_id: 'test-product',
        name: 'Test Product',
        price: 100,
        image: 'test-image.jpg',
        category: 'test',
        description: 'Test description',
        quantity: 1,
        is_organic: false,
        in_stock: true
      }]);
      expect(mockInsertQueryBuilder.select).toHaveBeenCalled();
      expect(mockDeleteQueryBuilder.delete).toHaveBeenCalled();
      expect(mockDeleteQueryBuilder.eq).toHaveBeenCalledWith('product_id', 'test-product');
    });

    it('should handle insert errors', async () => {
      // Mock from().insert().select() to return an error
      const mockInsertQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' }
        })
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockInsertQueryBuilder);

      const result = await databaseSetup.testInsert();

      expect(result).toBe(false);
      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockInsertQueryBuilder.insert).toHaveBeenCalled();
      expect(mockInsertQueryBuilder.select).toHaveBeenCalled();
    });

    it('should handle delete errors but still return true if insert succeeded', async () => {
      // Mock from().insert().select() and from().delete().eq()
      const mockInsertQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(mockInsertSuccess)
      };
      
      const mockDeleteQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Delete failed' }
        })
      };
      
      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockInsertQueryBuilder)
        .mockReturnValueOnce(mockDeleteQueryBuilder);

      const result = await databaseSetup.testInsert();

      // Should still return true because insert succeeded
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockInsertQueryBuilder.insert).toHaveBeenCalled();
      expect(mockInsertQueryBuilder.select).toHaveBeenCalled();
      expect(mockDeleteQueryBuilder.delete).toHaveBeenCalled();
      expect(mockDeleteQueryBuilder.eq).toHaveBeenCalledWith('product_id', 'test-product');
    });

    it('should handle exceptions', async () => {
      // Mock from() to throw an exception
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await databaseSetup.testInsert();

      expect(result).toBe(false);
      expect(supabase.from).toHaveBeenCalledWith('cart_items');
    });
  });

  describe('getTableInfo', () => {
    it('should complete table info check without errors', async () => {
      // Mock from().select().limit() for table existence check
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [{}], error: null })
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockQueryBuilder);

      await databaseSetup.getTableInfo();

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(1);
    });

    it('should handle errors when accessing tables', async () => {
      // Mock from().select().limit() to return error
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'Table does not exist' } })
      };
      
      (supabase.from as jest.Mock).mockReturnValue(mockQueryBuilder);

      await databaseSetup.getTableInfo();

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(supabase.from).toHaveBeenCalledWith('wishlist_items');
    });

    it('should handle exceptions', async () => {
      // Mock from() to throw an exception
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      await databaseSetup.getTableInfo();

      expect(supabase.from).toHaveBeenCalled();
    });
  });
});