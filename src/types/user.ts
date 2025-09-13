export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'farmer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  description: string;
  location: string;
  contactNumber: string;
  productsOffered: string[];
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  shippingAddresses: ShippingAddress[];
  preferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}
