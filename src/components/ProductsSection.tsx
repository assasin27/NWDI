import React, { useState, useEffect, useCallback } from 'react';
import { ProductCard } from './ProductCard';
import { VariantSelector } from './VariantSelector';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useSupabaseUser } from '../lib/useSupabaseUser';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Loader2, Search, ArrowUpDown, ArrowUp, ArrowDown, X, ShoppingCart, Heart } from 'lucide-react';
import { Product, productService } from '../lib/productService';
import { ProductVariant } from '../lib/productsData';
import heroFarm from '../assets/hero-farm.jpg';
import fruitsImg from '../assets/fruits.jpg';
import vegetablesImg from '../assets/vegetables.jpg';
import farmerPortrait from '../assets/farmer-portrait.jpg';

const ProductsSection: React.FC = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlist();
  const { user, loading: userLoading } = useSupabaseUser();
  const { showNotification } = useNotification();
  
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('category');
  const [cartWishlistLoading, setCartWishlistLoading] = useState(false);
  
  // Variant selector state
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variantAction, setVariantAction] = useState<'cart' | 'wishlist' | null>(null);

  const categories = ['all', ...Array.from(new Set(
    productsList
      .map(p => (p && p.category) ? p.category : 'Uncategorized')
      .filter(Boolean)
  ))];
  
  // Define category order for sorting
  const categoryOrder = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Eco Friendly Products', 'Handmade Warli Painted'];

  const filterAndSortProducts = useCallback(() => {
    let filtered = productsList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => (product.category || 'Uncategorized') === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price; // Low to High (ascending)
        case 'price-high':
          return b.price - a.price; // High to Low (descending)
        case 'category':
        default: {
          // Sort by category order first, then by name within each category
          const aCategoryIndex = categoryOrder.indexOf(a.category || 'Uncategorized');
          const bCategoryIndex = categoryOrder.indexOf(b.category || 'Uncategorized');
          
          if (aCategoryIndex !== bCategoryIndex) {
            return aCategoryIndex - bCategoryIndex;
          }
          
          // If same category, sort by name
          return (a.name || '').localeCompare(b.name || '');
        }
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, sortBy, productsList]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  // Load products from Supabase so IDs are UUID
  useEffect(() => {
    (async () => {
      const data = await productService.getAllProducts();
      if (data && Array.isArray(data)) {
        setProductsList(data);
        setFilteredProducts(data);
      }
    })();
  }, []);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const getSortIcon = (sortType: string) => {
    switch (sortType) {
      case 'price-low':
        return <ArrowUp className="h-4 w-4" />;
      case 'price-high':
        return <ArrowDown className="h-4 w-4" />;
      case 'category':
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getSortLabel = (sortType: string) => {
    switch (sortType) {
      case 'price-low':
        return 'Price: Low to High';
      case 'price-high':
        return 'Price: High to Low';
      case 'category':
      default:
        return 'Category';
    }
  };

  const isProductInStock = (product: Product) => {
    if (typeof product.in_stock === 'boolean') return product.in_stock;
    if (typeof (product as any).inStock === 'boolean') return (product as any).inStock;
    if (typeof product.quantity === 'number') return product.quantity > 0;
    return true;
  };

  const handleAddToCart = async (product: Product) => {
    if (userLoading) {
      return;
    }
    
    if (!user) {
      showNotification('Please log in to add items to cart', 'error');
      return;
    }

    if (!isProductInStock(product)) {
      showNotification(`${product.name} is currently out of stock`, 'error');
      return;
    }

    console.log('🔍 Debug: handleAddToCart called for product:', product.name);
    console.log('🔍 Debug: Product has variants:', !!product.variants);
    console.log('🔍 Debug: Variants:', product.variants);

    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      console.log('🔍 Debug: Showing variant selector for cart');
      setSelectedProduct(product);
      setVariantAction('cart');
      setShowVariantSelector(true);
      return;
    }

    console.log('🔍 Debug: No variants, adding directly to cart');
    setCartWishlistLoading(true);
    try {
      const result = await addToCart(product);
      if (result) {
        showNotification(`${product.name} added to cart!`, 'success');
      } else {
        showNotification(`Failed to add ${product.name} to cart`, 'error');
      }
    } catch (error) {
      showNotification(`Failed to add ${product.name} to cart`, 'error');
    } finally {
      setCartWishlistLoading(false);
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    if (userLoading) return;
    
    if (!user) {
      showNotification('Please log in to add items to wishlist', 'error');
      return;
    }

    if (!isProductInStock(product)) {
      showNotification(`${product.name} is currently out of stock`, 'error');
      return;
    }

    console.log('🔍 Debug: handleAddToWishlist called for product:', product.name);
    console.log('🔍 Debug: Product has variants:', !!product.variants);
    console.log('🔍 Debug: Variants:', product.variants);

    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      console.log('🔍 Debug: Showing variant selector for wishlist');
      setSelectedProduct(product);
      setVariantAction('wishlist');
      setShowVariantSelector(true);
      return;
    }

    console.log('🔍 Debug: No variants, adding directly to wishlist');
    setCartWishlistLoading(true);
    try {
      const result = await addToWishlist(product);
      if (result) {
        showNotification(`${product.name} added to wishlist!`, 'info');
      } else {
        showNotification(`Failed to add ${product.name} to wishlist`, 'error');
      }
    } catch (error) {
      showNotification(`Failed to add ${product.name} to wishlist`, 'error');
    } finally {
      setCartWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setCartWishlistLoading(true);
    try {
      await removeFromWishlist(productId);
      // Find the product name for the notification
      const product = productsList.find(p => p.id === productId);
      const productName = product ? product.name : 'Item';
      showNotification(`${productName} removed from wishlist`, 'info');
    } catch (error) {
      // Find the product name for the error notification
      const product = productsList.find(p => p.id === productId);
      const productName = product ? product.name : 'Item';
      showNotification(`Failed to remove ${productName} from wishlist`, 'error');
    } finally {
      setCartWishlistLoading(false);
    }
  };

  const handleVariantSelect = async (variant: ProductVariant) => {
    if (!selectedProduct) return;
    
    if (!isProductInStock(selectedProduct)) {
      showNotification(`${selectedProduct.name} is currently out of stock`, 'error');
      setShowVariantSelector(false);
      setSelectedProduct(null);
      setVariantAction(null);
      return;
    }

    console.log('🔍 Debug: handleVariantSelect called');
    console.log('🔍 Debug: Selected variant:', variant.name);
    console.log('🔍 Debug: Variant action:', variantAction);
    
    setCartWishlistLoading(true);
    try {
      // Create a product with the selected variant
      const productWithVariant = {
        ...selectedProduct,
        name: `${selectedProduct.name} - ${variant.name}`,
        price: variant.price,
        selectedVariant: variant
      };

      console.log('🔍 Debug: Product with variant:', productWithVariant);

      if (variantAction === 'cart') {
        console.log('🔍 Debug: Adding variant to cart');
        await addToCart(productWithVariant);
        showNotification(`${variant.name} variant added to cart!`, 'success');
      } else if (variantAction === 'wishlist') {
        console.log('🔍 Debug: Adding variant to wishlist');
        await addToWishlist(productWithVariant);
        showNotification(`${variant.name} variant added to wishlist!`, 'info');
      }
    } catch (error) {
      console.error('🔍 Debug: Error in handleVariantSelect:', error);
      showNotification(`Failed to add ${variant.name} variant`, 'error');
    } finally {
      setCartWishlistLoading(false);
      setShowVariantSelector(false);
      setSelectedProduct(null);
      setVariantAction(null);
    }
  };

  const handleVariantClose = () => {
    setShowVariantSelector(false);
    setSelectedProduct(null);
    setVariantAction(null);
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <section id="products" className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      <div className="px-4">
        {/* Visual Banner */}
        <div className="mb-12 flex justify-center">
          <img src={heroFarm} alt="Nareshwadi Farm" className="rounded-2xl shadow-lg w-full max-w-3xl object-cover h-64" />
        </div>

        {/* Category Highlights */}
        <div className="mb-8 flex flex-col md:flex-row gap-6 justify-center items-center">
          <div className="flex flex-col items-center">
            <img src={fruitsImg} alt="Fresh Fruits" className="rounded-xl shadow w-40 h-28 object-cover mb-2" />
            <span className="text-green-700 font-semibold">Fruits</span>
          </div>
          <div className="flex flex-col items-center">
            <img src={vegetablesImg} alt="Organic Vegetables" className="rounded-xl shadow w-40 h-28 object-cover mb-2" />
            <span className="text-green-700 font-semibold">Vegetables</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover fresh, organic products sourced directly from local farmers. 
            Quality guaranteed, delivered to your doorstep.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      {category !== 'all' && (
                        <span className="text-sm">{category}</span>
                      )}
                      <span>{(category as string).charAt(0).toUpperCase() + (category as string).slice(1)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort - Category and price options */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <div className="flex items-center gap-2">
                  {getSortIcon(sortBy)}
                  <span>{getSortLabel(sortBy)}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Category
                  </div>
                </SelectItem>
                <SelectItem value="price-low">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" />
                    Price: Low to High
                  </div>
                </SelectItem>
                <SelectItem value="price-high">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4" />
                    Price: High to Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {productsList.length} products
            </p>
            {searchTerm && (
              <Badge variant="secondary">
                Search: "{searchTerm}"
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              {getSortLabel(sortBy)}
            </Badge>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
                onRemoveFromWishlist={() => handleRemoveFromWishlist(product.id)}
                isWishlisted={isWishlisted(product.id)}
                loading={cartWishlistLoading || userLoading}
                impactBadge="Supports a child for a week"
              />
            ))}
          </div>
        )}

        {/* Loading State */}
        {cartWishlistLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
            <span className="text-gray-600">Processing...</span>
          </div>
        )}
      </div>

      {/* Variant Selector Modal */}
      {showVariantSelector && selectedProduct && (
        <VariantSelector
          product={selectedProduct}
          onSelect={handleVariantSelect}
          onClose={handleVariantClose}
          productType={selectedProduct.name === 'Rice' ? 'rice' : 'dhoopbatti'}
        />
      )}
    </section>
  );
};

export default ProductsSection;
