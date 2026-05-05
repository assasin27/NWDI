import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, ShoppingCart, Loader2, MessageCircle, Camera, Leaf, CheckCircle, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from './ui/dialog';
import { Chatbot } from './Chatbot';
import { CameraCapture } from './CameraCapture';
import { freshnessService, FreshnessResult } from '../lib/freshnessService';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/use-toast';

// Minimal product shape that supports both local/static and Supabase-backed products
interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
  inStock?: boolean;      // old local data flag
  in_stock?: boolean;     // Supabase column
  quantity?: number;      // Supabase quantity
  variants?: Array<{ name: string; price: number }>;
  selectedVariant?: { name: string; price: number };
}

interface ProductCardProps {
  product: DisplayProduct;
  onAddToCart: (product?: DisplayProduct, negotiatedPrice?: number) => void;
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
  const [chatOpen, setChatOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [freshnessOpen, setFreshnessOpen] = useState(false);
  const [freshnessResult, setFreshnessResult] = useState<FreshnessResult | null>(null);
  const [analyzingFreshness, setAnalyzingFreshness] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const isInStock = (() => {
    if (typeof product.inStock === 'boolean') return product.inStock;
    if (typeof product.in_stock === 'boolean') return product.in_stock;
    if (typeof product.quantity === 'number') return product.quantity > 0;
    return true;
  })();

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
        {!isInStock && (
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

        {product.category && (
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
            {product.category}
          </p>
        )}

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
            onClick={() => onAddToCart(product)}
            disabled={loading || !isInStock}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            aria-label={isInStock ? 'Add to cart' : 'Add to cart (out of stock)'}
            title={isInStock ? 'Add to cart' : 'This product is currently out of stock'}
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

          <Dialog open={chatOpen} onOpenChange={setChatOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={!isInStock}
                variant="outline"
                size="sm"
                className="px-3"
                aria-label="Negotiate price"
                title="Negotiate price with seller"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <Chatbot
                productId={product.id}
                productName={product.name}
                originalPrice={product.price}
                onPriceAgreed={async (agreedPrice) => {
                  // Add item to cart at negotiated price
                  const cartItem = {
                    id: product.id,
                    name: product.name,
                    price: agreedPrice, // Use negotiated price
                    image: product.image || '',
                    category: product.category || 'Misc',
                    description: product.description || '',
                    isOrganic: false, // Could be enhanced to check product data
                    inStock: isInStock,
                    selectedVariant: product.selectedVariant
                  };

                  const success = await addToCart(cartItem);
                  if (success) {
                    toast({
                      title: "Added to Cart! 🎉",
                      description: `${product.name} added at ₹${agreedPrice} (negotiated price)`,
                    });
                    setChatOpen(false);
                  } else {
                    toast({
                      title: "Failed to add to cart",
                      description: "Please try again or contact support",
                      variant: "destructive",
                    });
                  }
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={freshnessOpen} onOpenChange={setFreshnessOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="px-3"
                aria-label="Check freshness"
                title="Check product freshness with camera"
              >
                <Leaf className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Freshness Check - {product.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {!freshnessResult ? (
                  <div className="text-center space-y-4">
                    <div className="text-sm text-gray-600">
                      Take a photo of the product to check its freshness
                    </div>
                    <Button
                      onClick={async () => {
                        setAnalyzingFreshness(true);
                        try {
                          const imageData = await freshnessService.captureImage();
                          const result = await freshnessService.analyzeImage(imageData);
                          setFreshnessResult(result);
                        } catch (error) {
                          console.error('Freshness check failed:', error);
                          setFreshnessResult({
                            status: 'stale',
                            confidence: 0,
                            score: 1,
                            is_fresh: false,
                            grade: 'N/A',
                            description: 'Could not analyze image. Backend service may not be available.',
                            error: 'Service unavailable'
                          });
                        } finally {
                          setAnalyzingFreshness(false);
                        }
                      }}
                      disabled={analyzingFreshness}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {analyzingFreshness ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Capture & Check Freshness
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg border ${
                    freshnessResult.status === 'fresh'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      {freshnessResult.status === 'fresh' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      )}
                      <span className={`text-lg font-bold ${
                        freshnessResult.status === 'fresh' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {freshnessResult.grade} Grade
                      </span>
                    </div>

                    <p className={`text-sm mb-2 ${
                      freshnessResult.status === 'fresh' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {freshnessResult.description}
                    </p>

                    {freshnessResult.confidence > 0 && (
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Confidence:</span>
                        <span className="font-medium">
                          {Math.round(freshnessResult.confidence * 100)}%
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => {
                          setFreshnessResult(null);
                          setAnalyzingFreshness(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Check Again
                      </Button>
                      <Button
                        onClick={() => setFreshnessOpen(false)}
                        size="sm"
                        className="flex-1"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={isWishlisted ? onRemoveFromWishlist : onAddToWishlist}
            disabled={loading || !isInStock}
            variant={isWishlisted ? "destructive" : "outline"}
            size="sm"
            className="px-3"
            aria-label={
              !isInStock
                ? 'Add to wishlist (out of stock)'
                : isWishlisted
                  ? 'Remove from wishlist'
                  : 'Add to wishlist'
            }
            title={
              !isInStock
                ? 'This product is currently out of stock'
                : isWishlisted
                  ? 'Remove from wishlist'
                  : 'Add to wishlist'
            }
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