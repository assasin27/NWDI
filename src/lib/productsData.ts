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
  inStock?: boolean;
  in_stock?: boolean;
  quantity?: number;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
}

export const products: Product[] = [
  // Fruits
  { 
    id: "f1", 
    name: "Guava", 
    price: 100, 
    image: "/src/assets/guava.jpg", 
    category: "Fruits", 
    description: "Sweet and nutritious guava, rich in vitamins and fiber.", 
    inStock: true 
  },
  { 
    id: "f2", 
    name: "Papaya", 
    price: 40, 
    image: "/src/assets/papaya.jpg", 
    category: "Fruits", 
    description: "Sweet and nutritious papaya, rich in vitamins.", 
    inStock: true 
  },
  { 
    id: "f3", 
    name: "Chikoo", 
    price: 60, 
    image: "/src/assets/chikoo.jpg", 
    category: "Fruits", 
    description: "Sweet and creamy chikoo, perfect for desserts.", 
    inStock: true 
  },
  { 
    id: "f4", 
    name: "Lemon", 
    price: 100, 
    image: "/src/assets/lemon.jpg", 
    category: "Fruits", 
    description: "Fresh lemons, perfect for cooking and beverages.", 
    inStock: true 
  },
  
  // Vegetables
  { 
    id: "v1", 
    name: "Mushroom", 
    price: 467, 
    image: "/src/assets/mushroom.jpg", 
    category: "Vegetables", 
    description: "Fresh mushrooms, perfect for cooking and salads.", 
    inStock: true 
  },
  { 
    id: "v2", 
    name: "Curry Leaves", 
    price: 80, 
    image: "/src/assets/curry-leaves.jpg", 
    category: "Vegetables", 
    description: "Fresh curry leaves bundle, essential for Indian cooking.", 
    inStock: true 
  },
  { 
    id: "v3", 
    name: "Moringa Leaves", 
    price: 80, 
    image: "/src/assets/moringa-leaves.jpg", 
    category: "Vegetables", 
    description: "Nutritious moringa leaves bundle, rich in vitamins.", 
    inStock: true 
  },
  { 
    id: "v4", 
    name: "Pumpkin", 
    price: 20, 
    image: "/src/assets/pumpkin.jpg", 
    category: "Vegetables", 
    description: "Fresh pumpkin, perfect for curries and soups.", 
    inStock: true 
  },
  { 
    id: "v5", 
    name: "Lemon Grass", 
    price: 80, 
    image: "/src/assets/lemon-grass.jpg", 
    category: "Vegetables", 
    description: "Fresh lemon grass bundle, aromatic and flavorful.", 
    inStock: true 
  },
  
  // Grains - Rice with variants
  { 
    id: "rice", 
    name: "Rice", 
    price: 100, 
    image: "/src/assets/rice.jpg", 
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
    image: "/src/assets/mustard.jpg", 
    category: "Grains", 
    description: "Pure mustard seeds, essential for pickling and cooking.", 
    inStock: true 
  },
  { 
    id: "g8", 
    name: "Nagali", 
    price: 120, 
    image: "/src/assets/nagali.jpg", 
    category: "Grains", 
    description: "Traditional Nagali grain, nutritious and healthy.", 
    inStock: true 
  },
  
  // Dairy
  { 
    id: "d1", 
    name: "A2 Gir Cow Milk", 
    price: 150, 
    image: "/src/assets/milk.jpg", 
    category: "Dairy", 
    description: "Premium A2 Gir Cow Milk, rich in nutrients and free from A1 protein. Sourced from healthy Gir cows, perfect for families seeking natural, easily digestible milk. Price per litre.", 
    inStock: true 
  },
  { 
    id: "d2", 
    name: "Ghee", 
    price: 3000, 
    image: "/src/assets/ghee.jpg", 
    category: "Dairy", 
    description: "Pure, clarified butter made from fresh cream. Traditional and aromatic ghee perfect for cooking and religious ceremonies.", 
    inStock: true 
  },
  { 
    id: "d3", 
    name: "Chaas", 
    price: 40, 
    image: "/src/assets/chaas.jpg", 
    category: "Dairy", 
    description: "Fresh buttermilk, cooling and nutritious.", 
    inStock: true 
  },
  { 
    id: "d4", 
    name: "Honey", 
    price: 1000, 
    image: "/src/assets/honey.jpg", 
    category: "Dairy", 
    description: "Pure natural honey, sweet and healthy.", 
    inStock: true 
  },
  
  // Eco Friendly Products - Dhoopbatti with variants
  { 
    id: "dhoopbatti", 
    name: "Dhoopbatti", 
    price: 120, 
    image: "/src/assets/dhoopbatti.jpg", 
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
    image: "/src/assets/cow-dung-powder.jpg", 
    category: "Eco Friendly Products", 
    description: "Pure, sun-dried cow dung powder, perfect for organic farming and gardening.", 
    inStock: true 
  },
  { 
    id: "eco6", 
    name: "Cow Dung Cake", 
    price: 50, 
    image: "/src/assets/cow-dung-cake.jpg", 
    category: "Eco Friendly Products", 
    description: "Traditional cow dung cakes, eco-friendly fuel and fertilizer.", 
    inStock: true 
  },
  
  // Handmade Warli Painted
  { 
    id: "warli1", 
    name: "Penstand", 
    price: 150, 
    image: "/src/assets/penstand.jpg", 
    category: "Handmade Warli Painted", 
    description: "Beautiful handcrafted Warli painted penstand, traditional tribal art design.", 
    inStock: true 
  }
];
