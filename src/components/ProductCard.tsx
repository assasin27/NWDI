import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { Product } from '../lib/productsData';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  onRemoveFromWishlist: () => void;
  isWishlisted: boolean;
  loading: boolean;
  impactBadge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isWishlisted,
  loading,
  impactBadge
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getHintText = () => {
    if (product.variants) {
      if (product.name === "Rice") {
        return "Add to cart or wishlist to choose variety";
      } else if (product.name === "Dhoopbatti") {
        return "Add to cart or wishlist to choose fragrance";
      }
      return "Add to cart or wishlist to choose variety/fragrance";
    }
    return "Click to add to cart or wishlist";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md transition-all duration-300 overflow-hidden transform hover:scale-105 hover:shadow-xl ${
        isHovered ? 'ring-2 ring-green-500 ring-opacity-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {impactBadge && (
        <div className="mb-2">
          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
            {impactBadge}
          </span>
        </div>
      )}
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300"
        />
        {!(product.inStock ?? product.in_stock) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive" className="text-white">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
            {product.name}
          </h3>
          {product.selectedVariant && (
            <div className="text-xs text-gray-700 mb-1">
              {product.category === 'Grains' || product.name.includes('Rice') ? 'Variety' : 'Fragrance'}: {product.selectedVariant.name}
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-green-600">₹{product.price}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Hint Text */}
        <p className="text-xs text-gray-500 mb-3 italic">
          {getHintText()}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddToCart}
            disabled={loading || !(product.inStock ?? product.in_stock)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </>
            )}
          </Button>

          <Button
            onClick={isWishlisted ? onRemoveFromWishlist : onAddToWishlist}
            disabled={loading}
            variant={isWishlisted ? "destructive" : "outline"}
            size="sm"
            className="px-3"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};