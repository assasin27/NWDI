import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Heart, ShoppingCart, Info, Trash2 } from 'lucide-react';

export interface ProductCardProps {
  product: any;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  onRemoveFromWishlist: () => void;
  isWishlisted: boolean;
  loading?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isWishlisted,
  loading = false
}) => {
  const handleWishlistClick = () => {
    if (isWishlisted) {
      onRemoveFromWishlist();
    } else {
      onAddToWishlist();
    }
  };

  const getHintText = () => {
    if (product.variants) {
      return "Add to cart or wishlist to choose variety/fragrance";
    }
    return "Click to add to cart or wishlist";
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105 hover:-translate-y-2 border-0 bg-white relative">
      {/* Green Gradient Border - positioned behind content */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-lg p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0">
        <div className="bg-white rounded-lg h-full w-full"></div>
      </div>
      
      {/* Content Container - positioned above gradient border */}
      <div className="relative z-10">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleWishlistClick}
            disabled={loading}
            className={`absolute top-3 right-3 h-10 w-10 rounded-full transition-all duration-300 transform hover:scale-110 z-20 ${
              isWishlisted 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
                : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 shadow-md backdrop-blur-sm'
            }`}
          >
            <Heart className={`h-5 w-5 transition-all duration-300 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg z-20">
              Out of Stock
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-green-600 transition-colors duration-300">
            {product.name}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm text-gray-600">
            {product.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-300">
              ₹{product.price}
            </div>
            <div className="text-sm text-gray-500 capitalize bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full border border-gray-200">
              {product.category}
            </div>
          </div>

          {/* Hint Text for Products with Variants */}
          {product.variants && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-xs text-blue-700">{getHintText()}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onAddToCart}
              disabled={loading || !product.inStock}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg text-white font-medium"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            
            {/* Remove from Wishlist Button - Only show when item is wishlisted */}
            {isWishlisted && (
              <Button
                onClick={onRemoveFromWishlist}
                disabled={loading}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove from Wishlist
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};