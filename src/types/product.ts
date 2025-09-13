export interface Product {
  id: string;
  farmer_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  quantity: number;
  unit: string;
  min_stock_level: number;
  max_stock_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Form data type that handles price as string for better form input handling
export interface ProductFormData {
  name: string;
  description: string;
  price: string; // Handled as string in form for better input control
  category: string;
  image_url: string | null;
  quantity: number;
  unit: string;
  min_stock_level: number;
  max_stock_level: number;
}
