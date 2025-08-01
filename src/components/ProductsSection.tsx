import React, { useState, useEffect, useCallback } from 'react';
import { ProductCard } from './ProductCard';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useSupabaseUser } from '../lib/useSupabaseUser';
import { useNotification } from '../contexts/NotificationContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Loader2, Search, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { products, Product } from '../lib/productsData';

const ProductsSection: React.FC = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlist();
  const { user, loading: userLoading } = useSupabaseUser();
  const { showNotification } = useNotification();
  
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('category');
  const [cartWishlistLoading, setCartWishlistLoading] = useState(false);

  const categories = ['all', ...Array.from(new Set(productsList.map(p => p.category)))];
  
  // Define category order for sorting
  const categoryOrder = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Eco Friendly Products', 'Handmade Warli Painted'];

  const filterAndSortProducts = useCallback(() => {
    let filtered = productsList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
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
          const aCategoryIndex = categoryOrder.indexOf(a.category);
          const bCategoryIndex = categoryOrder.indexOf(b.category);
          
          if (aCategoryIndex !== bCategoryIndex) {
            return aCategoryIndex - bCategoryIndex;
          }
          
          // If same category, sort by name
          return a.name.localeCompare(b.name);
        }
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, sortBy, productsList]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

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

  const handleAddToCart = async (product: Product) => {
    if (userLoading) return;
    
    if (!user) {
      showNotification('Please log in to add items to cart', 'error');
      return;
    }

    setCartWishlistLoading(true);
    try {
      await addToCart(product);
      showNotification('Item added to cart!', 'success');
    } catch (error) {
      showNotification('Failed to add item to cart', 'error');
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

    setCartWishlistLoading(true);
    try {
      await addToWishlist(product);
      showNotification('Item added to wishlist!', 'info');
    } catch (error) {
      showNotification('Failed to add item to wishlist', 'error');
    } finally {
      setCartWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setCartWishlistLoading(true);
    try {
      await removeFromWishlist(productId);
      showNotification('Item removed from wishlist', 'info');
    } catch (error) {
      showNotification('Failed to remove item from wishlist', 'error');
    } finally {
      setCartWishlistLoading(false);
    }
  };

  const handleVariantSelect = (productId: string, variant: string) => {
    if (userLoading) return;
    
    if (!user) {
      showNotification('Please log in to select product variants', 'error');
      return;
    }
    
    showNotification(`Selected ${variant} variant`, 'success');
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <section id="products" className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      <div className="px-4">
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
                    {(category as string).charAt(0).toUpperCase() + (category as string).slice(1)}
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
              {getSortIcon(sortBy)}
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
    </section>
  );
};

export default ProductsSection;
