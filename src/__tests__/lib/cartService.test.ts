import type { CartItem } from "@/lib/cartService";

jest.mock("@/lib/apiService", () => ({
  apiService: {
    testCartConnection: jest.fn(),
    getCartItems: jest.fn(),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
  }
}));

jest.mock("@/lib/errorHandler", () => ({
  handleError: jest.fn()
}));

import { cartService } from "@/lib/cartService";
import { apiService } from "@/lib/apiService";

describe("cartService", () => {
  const mockUserId = "test-user-id";
  const mockProductId = "test-product-id";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCartItems", () => {
    it("should return cart items when successful", async () => {
      const mockCartItems: CartItem[] = [
        {
          id: "1",
          user_id: mockUserId,
          product_id: mockProductId,
          name: "Test Product",
          price: 100,
          image: "test-image.jpg",
          category: "test",
          description: "Test description",
          quantity: 1,
          is_organic: false,
          in_stock: true
        },
      ];

      (apiService.getCartItems as jest.Mock).mockResolvedValue({
        data: mockCartItems,
        error: null
      });

      const result = await cartService.getCartItems(mockUserId);

      expect(apiService.getCartItems).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockCartItems);
    });

    it("should handle errors gracefully", async () => {
      (apiService.getCartItems as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Test error" }
      });

      const result = await cartService.getCartItems(mockUserId);

      expect(apiService.getCartItems).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual([]);
    });
  });

  describe("addToCart", () => {
    it("should add new item successfully", async () => {
      const mockCartItem: CartItem = {
        id: "1",
        user_id: mockUserId,
        product_id: mockProductId,
        name: "Test Product",
        price: 100,
        image: "test-image.jpg",
        category: "test",
        description: "Test description",
        quantity: 1,
        is_organic: false,
        in_stock: true
      };

      (apiService.addToCart as jest.Mock).mockResolvedValue({
        data: mockCartItem,
        error: null,
        isUpdate: false
      });

      const result = await cartService.addToCart(mockUserId, mockProductId);

      expect(apiService.addToCart).toHaveBeenCalledWith(mockUserId, mockProductId, 1, undefined);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Item added to cart");
      expect(result.item).toEqual(mockCartItem);
    });

    it("should handle update of existing item", async () => {
      const mockCartItem: CartItem = {
        id: "1",
        user_id: mockUserId,
        product_id: mockProductId,
        name: "Test Product",
        price: 100,
        image: "test-image.jpg",
        category: "test",
        description: "Test description",
        quantity: 2,
        is_organic: false,
        in_stock: true
      };

      (apiService.addToCart as jest.Mock).mockResolvedValue({
        data: mockCartItem,
        error: null,
        isUpdate: true
      });

      const result = await cartService.addToCart(mockUserId, mockProductId, 2);

      expect(apiService.addToCart).toHaveBeenCalledWith(mockUserId, mockProductId, 2, undefined);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Cart item updated");
      expect(result.item).toEqual(mockCartItem);
    });

    it("should handle errors gracefully", async () => {
      (apiService.addToCart as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Test error" }
      });

      const result = await cartService.addToCart(mockUserId, mockProductId);

      expect(apiService.addToCart).toHaveBeenCalledWith(mockUserId, mockProductId, 1, undefined);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to add item to cart");
    });
  });

  describe("removeFromCart", () => {
    it("should remove item successfully", async () => {
      (apiService.removeFromCart as jest.Mock).mockResolvedValue({
        data: true,
        error: null
      });

      const result = await cartService.removeFromCart(mockUserId, mockProductId);

      expect(apiService.removeFromCart).toHaveBeenCalledWith(mockUserId, mockProductId, undefined);
      expect(result).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      (apiService.removeFromCart as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Test error" }
      });

      const result = await cartService.removeFromCart(mockUserId, mockProductId);

      expect(apiService.removeFromCart).toHaveBeenCalledWith(mockUserId, mockProductId, undefined);
      expect(result).toBe(false);
    });
  });

  describe("updateQuantity", () => {
    it("should update quantity successfully", async () => {
      (apiService.updateQuantity as jest.Mock).mockResolvedValue({
        data: true,
        error: null
      });

      const result = await cartService.updateQuantity(mockUserId, mockProductId, 3);

      expect(apiService.updateQuantity).toHaveBeenCalledWith(mockUserId, mockProductId, 3, undefined);
      expect(result).toBe(true);
    });

    it("should handle errors gracefully", async () => {
      (apiService.updateQuantity as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Test error" }
      });

      const result = await cartService.updateQuantity(mockUserId, mockProductId, 3);

      expect(apiService.updateQuantity).toHaveBeenCalledWith(mockUserId, mockProductId, 3, undefined);
      expect(result).toBe(false);
    });
  });
});
