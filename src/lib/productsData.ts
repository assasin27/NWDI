export interface ProductVariant {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
}

export const products: Product[] = [
  // Fruits
  { 
    id: "f1", 
    name: "Guava", 
    price: 100, 
    image: "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=400&q=80", 
    category: "Fruits", 
    description: "Sweet and nutritious guava, rich in vitamins and fiber.", 
    inStock: true 
  },
  { 
    id: "f2", 
    name: "Papaya", 
    price: 40, 
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80", 
    category: "Fruits", 
    description: "Sweet and nutritious papaya, rich in vitamins.", 
    inStock: true 
  },
  { 
    id: "f3", 
    name: "Chikoo", 
    price: 60, 
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80", 
    category: "Fruits", 
    description: "Sweet and creamy chikoo, perfect for desserts.", 
    inStock: true 
  },
  { 
    id: "f4", 
    name: "Lemon", 
    price: 100, 
    image: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=400&q=80", 
    category: "Fruits", 
    description: "Fresh lemons, perfect for cooking and beverages.", 
    inStock: true 
  },
  
  // Vegetables
  { 
    id: "v1", 
    name: "Mushroom", 
    price: 467, 
    image: "https://images.unsplash.com/photo-1590326048384-2a6a8b79b97a?auto=format&fit=crop&w=400&q=80", 
    category: "Vegetables", 
    description: "Fresh mushrooms, perfect for cooking and salads.", 
    inStock: true 
  },
  { 
    id: "v2", 
    name: "Curry Leaves", 
    price: 80, 
    image: "https://images.unsplash.com/photo-1587334237935-66bdee359345?auto=format&fit=crop&w=400&q=80", 
    category: "Vegetables", 
    description: "Fresh curry leaves bundle, essential for Indian cooking.", 
    inStock: true 
  },
  { 
    id: "v3", 
    name: "Moringa Leaves", 
    price: 80, 
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80", 
    category: "Vegetables", 
    description: "Nutritious moringa leaves bundle, rich in vitamins.", 
    inStock: true 
  },
  { 
    id: "v4", 
    name: "Pumpkin", 
    price: 20, 
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80", 
    category: "Vegetables", 
    description: "Fresh pumpkin, perfect for curries and soups.", 
    inStock: true 
  },
  { 
    id: "v5", 
    name: "Lemon Grass", 
    price: 80, 
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80", 
    category: "Vegetables", 
    description: "Fresh lemon grass bundle, aromatic and flavorful.", 
    inStock: true 
  },
  
  // Grains - Rice with variants
  { 
    id: "rice", 
    name: "Rice", 
    price: 100, 
    image: "https://images.unsplash.com/photo-1534952219639-c19053940aa3?auto=format&fit=crop&w=400&q=80", 
    category: "Grains", 
    description: "Premium quality rice varieties, perfect for daily cooking.", 
    inStock: true,
    variants: [
      { name: "Indrayani Full", price: 100 },
      { name: "Indrayani Cut", price: 40 },
      { name: "Indrayani Crushed", price: 40 },
      { name: "Shakti Full", price: 100 },
      { name: "Shakti Cut", price: 60 },
      { name: "Shakti Crushed", price: 40 }
    ]
  },
  { 
    id: "g7", 
    name: "Mustard", 
    price: 400, 
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80", 
    category: "Grains", 
    description: "Pure mustard seeds, essential for pickling and cooking.", 
    inStock: true 
  },
  { 
    id: "g8", 
    name: "Nagali", 
    price: 120, 
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80", 
    category: "Grains", 
    description: "Traditional Nagali grain, nutritious and healthy.", 
    inStock: true 
  },
  
  // Dairy
  { 
    id: "d1", 
    name: "A2 Gir Cow Milk", 
    price: 150, 
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", 
    category: "Dairy", 
    description: "Premium A2 Gir Cow Milk, rich in nutrients and free from A1 protein. Sourced from healthy Gir cows, perfect for families seeking natural, easily digestible milk. Price per litre.", 
    inStock: true 
  },
  { 
    id: "d2", 
    name: "Ghee", 
    price: 3000, 
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", 
    category: "Dairy", 
    description: "Pure, clarified butter made from fresh cream. Traditional and aromatic ghee perfect for cooking and religious ceremonies.", 
    inStock: true 
  },
  { 
    id: "d3", 
    name: "Chaas", 
    price: 40, 
    image: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=400&q=80", 
    category: "Dairy", 
    description: "Fresh buttermilk, cooling and nutritious.", 
    inStock: true 
  },
  { 
    id: "d4", 
    name: "Honey", 
    price: 1000, 
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80", 
    category: "Dairy", 
    description: "Pure natural honey, sweet and healthy.", 
    inStock: true 
  },
  
  // Eco Friendly Products - Dhoopbatti with variants
  { 
    id: "dhoopbatti", 
    name: "Dhoopbatti", 
    price: 120, 
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", 
    category: "Eco Friendly Products", 
    description: "Traditional incense sticks, aromatic and spiritual.", 
    inStock: true,
    variants: [
      { name: "Chandan", price: 120 },
      { name: "Lobhan", price: 120 },
      { name: "Havan", price: 100 },
      { name: "Mosquito Repellent", price: 100 }
    ]
  },
  { 
    id: "eco5", 
    name: "Cow Dung Powder", 
    price: 50, 
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", 
    category: "Eco Friendly Products", 
    description: "Pure, sun-dried cow dung powder, perfect for organic farming and gardening.", 
    inStock: true 
  },
  { 
    id: "eco6", 
    name: "Cow Dung Cake", 
    price: 50, 
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", 
    category: "Eco Friendly Products", 
    description: "Traditional cow dung cakes, eco-friendly fuel and fertilizer.", 
    inStock: true 
  },
  
  // Handmade Warli Painted
  { 
    id: "warli1", 
    name: "Penstand", 
    price: 150, 
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", 
    category: "Handmade Warli Painted", 
    description: "Beautiful handcrafted Warli painted penstand, traditional tribal art design.", 
    inStock: true 
  }
];
