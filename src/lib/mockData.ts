import { AdminProduct } from "@/types/admin";

export const mockProducts: AdminProduct[] = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    description: "Locally grown, fresh red tomatoes",
    price: 40.00,
    category: "Vegetables",
    image_url: "/src/assets/tomatoes.jpg",
    quantity: 100,
    is_organic: true,
    in_stock: true,
    created_at: "2025-10-01T10:00:00Z",
    updated_at: "2025-10-13T10:00:00Z"
  },
  {
    id: "2",
    name: "Organic Potatoes",
    description: "Farm fresh organic potatoes",
    price: 50.00,
    category: "Vegetables",
    image_url: "/src/assets/potatoes.jpg",
    quantity: 75,
    is_organic: true,
    in_stock: true,
    created_at: "2025-10-01T10:00:00Z",
    updated_at: "2025-10-13T10:00:00Z",
    updated_at: "2025-10-13T10:00:00Z"
  },
  {
    id: "3",
    name: "Sweet Mangoes",
    description: "Sweet and juicy Alphonso mangoes",
    price: 120.00,
    category: "Fruits",
    image_url: "/src/assets/mangoes.jpg",
    quantity: 50,
    is_organic: true,
    in_stock: true,
    created_at: "2025-10-01T10:00:00Z",
    updated_at: "2025-10-13T10:00:00Z"
  },
  {
    id: "4",
    name: "Fresh Guava",
    description: "Sweet and nutritious guava, rich in vitamins and fiber",
    price: 100.00,
    category: "Fruits",
    image_url: "/src/assets/guava.jpg",
    quantity: 60,
    is_organic: true,
    in_stock: true,
    created_at: "2025-10-01T10:00:00Z",
    updated_at: "2025-10-13T10:00:00Z"
  },
  {
    id: "5",
    name: "Dhoopbatti",
    description: "Traditional incense sticks, aromatic and spiritual",
    price: 120.00,
    category: "Eco Friendly Products",
    image_url: "/src/assets/dhoopbatti.jpg",
    quantity: 200,
    is_organic: true,
    in_stock: true,
    created_at: "2025-10-01T10:00:00Z",
    updated_at: "2025-10-13T10:00:00Z"
  }
];

import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '@/types/order';

export const mockOrders: Order[] = [
  {
    id: "1",
    customerId: "cust1",
    farmerId: "1",
    status: "processing",
    totalAmount: 280.00,
    items: [
      {
        id: "item1",
        orderId: "1",
        productId: "1",
        quantity: 4,
        pricePerUnit: 40.00,
        totalPrice: 160.00,
        product: {
          name: "Fresh Tomatoes",
          imageUrl: "https://example.com/tomatoes.jpg"
        }
      },
      {
        id: "item2",
        orderId: "1",
        productId: "2",
        quantity: 3,
        pricePerUnit: 50.00,
        totalPrice: 120.00,
        product: {
          name: "Organic Potatoes",
          imageUrl: "https://example.com/potatoes.jpg"
        }
      }
    ],
    shippingAddress: "123 Main St, Mumbai",
    paymentStatus: "completed",
    paymentMethod: "card",
    notes: "",
    createdAt: "2025-10-12T15:30:00Z",
    updatedAt: "2025-10-13T09:00:00Z"
  },
  {
    id: "2",
    customerId: "cust2",
    farmerId: "2",
    status: "pending",
    totalAmount: 360.00,
    items: [
      {
        id: "item3",
        orderId: "2",
        productId: "3",
        quantity: 3,
        pricePerUnit: 120.00,
        totalPrice: 360.00,
        product: {
          name: "Sweet Mangoes",
          imageUrl: "https://example.com/mangoes.jpg"
        }
      }
    ],
    shippingAddress: "456 Park Road, Delhi",
    paymentStatus: "pending",
    paymentMethod: "cod",
    notes: "Please deliver in morning",
    createdAt: "2025-10-13T10:00:00Z",
    updatedAt: "2025-10-13T10:00:00Z"
  }
];

export const mockUsers = [
  {
    id: "admin1",
    email: "admin@farmfresh.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-10-13T10:00:00Z"
  },
  {
    id: "farmer1",
    email: "farmer1@farmfresh.com",
    firstName: "John",
    lastName: "Farmer",
    role: "farmer",
    createdAt: "2025-09-01T00:00:00Z",
    updatedAt: "2025-10-13T09:00:00Z"
  },
  {
    id: "cust1",
    email: "customer1@gmail.com",
    firstName: "Alice",
    lastName: "Customer",
    role: "customer",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2025-10-13T08:00:00Z"
  }
];