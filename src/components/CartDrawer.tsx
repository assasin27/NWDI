import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCart } from '../hooks/useCart';
import { useSupabaseUser } from '../lib/useSupabaseUser';
import { useNotification } from '../contexts/NotificationContext';
import { orderService } from '../lib/orderService';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, ShoppingBag, MapPin, IndianRupee, X, Trash2, Plus, Minus, Home, Building, Navigation } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Address {
  id: string;
  houseBuilding: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useSupabaseUser();
  const { showNotification } = useNotification();
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    houseBuilding: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Mock addresses - in real app, these would come from user profile
  const [userAddresses, setUserAddresses] = useState<Address[]>([
    {
      id: '1',
      houseBuilding: 'A-101, Green Valley Apartments',
      street: 'MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      landmark: 'Near Central Mall',
      isDefault: true
    }
  ]);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      showNotification('Item removed from cart', 'info');
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    showNotification('Item removed from cart', 'info');
  };

  const handleClearCart = async () => {
    if (cart.length === 0) {
      showNotification('Cart is already empty', 'info');
      return;
    }

    setLoading(true);
    try {
      await clearCart();
      showNotification('Cart cleared successfully', 'success');
    } catch (error) {
      showNotification('Failed to clear cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAddress = () => {
    if (!newAddress.houseBuilding || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      showNotification('Please fill in all required address fields', 'error');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: userAddresses.length === 0
    };

    setUserAddresses(prev => [...prev, address]);
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
    setNewAddress({
      houseBuilding: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    });
    showNotification('Address added successfully!', 'success');
  };

  const handleCheckout = async () => {
    if (!user) {
      showNotification('Please log in to place an order', 'error');
      return;
    }
    if (!selectedAddressId) {
      showNotification('Please select a delivery address', 'error');
      return;
    }
    if (cart.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }

    const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
    if (!selectedAddress) {
      showNotification('Please select a valid delivery address', 'error');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_id: user.id,
        customer_name: user.user_metadata?.name || user.email || 'Customer',
        customer_email: user.email || '',
        total_amount: total,
        delivery_address: selectedAddress,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      const order = await orderService.createOrder(orderData);
      if (order) {
        showNotification(`Order placed successfully! Order ID: ${order.id}`, 'success');
        clearCart();
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        showNotification('Failed to place order. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showNotification('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              <Badge variant="secondary">{cart.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearCart}
                  disabled={loading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear
                    </>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500">Add some products to get started!</p>
              </div>
            ) : (
              cart.map((item) => (
                <Card
                  key={item.id + (item.selectedVariant ? '-' + item.selectedVariant.name : '')}
                  className="p-4 mb-4 border-2 border-green-200 shadow-md rounded-lg"
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        {/* Product Name - Aligned to the left above quantity */}
                        <h3 className="font-medium text-gray-900 text-left mb-2 line-clamp-2">
                          {item.name}
                        </h3>
                        {item.selectedVariant && (
                          <div className="text-xs text-gray-700 mb-1">
                            {item.category === 'Grains' || item.name.includes('Rice') ? 'Variety' : 'Fragrance'}: {item.selectedVariant.name}
                          </div>
                        )}
                        {/* If no selectedVariant but name contains variant info, extract it */}
                        {!item.selectedVariant && item.name.includes(' - ') && (
                          <div className="text-xs text-gray-700 mb-1">
                            {item.category === 'Grains' || item.name.includes('Rice') ? 'Variety' : 'Fragrance'}: {item.name.split(' - ')[1]}
                          </div>
                        )}
                        
                        {/* Category */}
                        <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                        
                        {/* Quantity Controls and Price */}
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {/* Price and Remove */}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-green-600">
                              ₹{item.price * item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Delivery Address Selection */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </Label>
                
                {userAddresses.length > 0 ? (
                  <div className="space-y-2">
                    <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery address" />
                      </SelectTrigger>
                      <SelectContent>
                        {userAddresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{address.houseBuilding}</span>
                              <span className="text-sm text-gray-600">
                                {address.street}, {address.city}, {address.state} - {address.pincode}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressForm(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddressForm(true)}
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Add Delivery Address
                  </Button>
                )}
              </div>

              {/* New Address Form */}
              {showAddressForm && (
                <Card className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Add New Address</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddressForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="houseBuilding">House/Building *</Label>
                      <Input
                        id="houseBuilding"
                        value={newAddress.houseBuilding}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, houseBuilding: e.target.value }))}
                        placeholder="e.g., A-101, Green Valley Apartments"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="street">Street *</Label>
                      <Input
                        id="street"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="e.g., MG Road"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g., Mumbai"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="e.g., Maharashtra"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                          placeholder="e.g., 400001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                          id="landmark"
                          value={newAddress.landmark}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                          placeholder="e.g., Near Central Mall"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleAddNewAddress}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                </Card>
              )}

              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="flex items-center gap-1 text-green-600">
                  <IndianRupee className="h-5 w-5" />
                  {total.toLocaleString()}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={loading || !user || !selectedAddressId}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Checkout
                  </>
                )}
              </Button>

              {!user && (
                <p className="text-sm text-red-600 text-center">
                  Please log in to complete your order
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
