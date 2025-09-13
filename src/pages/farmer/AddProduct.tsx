import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  Package,
  Search
} from 'lucide-react';
import { apiService } from '../../lib/apiService';
import { useToast } from '../../components/ui/use-toast';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  inStock: boolean;
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    inStock: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    'Fruits',
    'Vegetables', 
    'Grains',
    'Dairy',
    'Eco Friendly Products',
    'Handmade Warli Painted'
  ];

  const handleInputChange = (field: keyof ProductForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const searchImage = async (productName: string) => {
    try {
      // Use Unsplash image URL directly for <img src>
      const searchTerm = encodeURIComponent(productName);
      const imageUrl = `https://source.unsplash.com/400x300/?${searchTerm}`;
      setForm(prev => ({ ...prev, image: imageUrl }));
      setMessage({ type: 'success', text: 'Image found and added!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to find image. Please add manually.' });
    }
  };

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Validate form
      if (!form.name || !form.price || !form.category) {
        setMessage({ type: 'error', text: 'Please fill in all required fields.' });
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Please fill in all required fields.'
        });
        return;
      }

      // Check authentication using apiService
      const { data: user, error: authError } = await apiService.getCurrentUser();
      if (authError || !user) {
        setMessage({ type: 'error', text: 'You must be logged in to add products.' });
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You must be logged in to add products.'
        });
        navigate('/farmer/login');
        return;
      }

      // Map form data to product data
      const productData = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        image_url: form.image,
        quantity: form.inStock ? 10 : 0, // Default to 10 in stock
        min_stock_level: 5,
        unit: 'kg'
      };

      // Create product using apiService
      const { data, error } = await apiService.createProduct(productData);
      
      if (error) throw new Error(error);

      setMessage({ 
        type: 'success', 
        text: 'Product added successfully! It will now appear in the customer portal.' 
      });
      
      toast({
        title: 'Success',
        description: 'Product added successfully! It will now appear in the customer portal.',
      });
      
      // Reset form
      setForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        inStock: true,
      });
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/farmer/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to add product. Please try again.' 
      });
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add product. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                onClick={() => navigate('/farmer/dashboard')}
                variant="ghost"
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Package className="w-8 h-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-orange-800">Add New Product</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-orange-800">Product Information</CardTitle>
            <CardDescription>
              Add a new product that will be available to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-orange-700">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Fresh Tomatoes"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-orange-700">Category *</Label>
                <Select value={form.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-orange-700">Price (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  autoComplete="off"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g., 50.00"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-orange-700">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  autoComplete="off"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product..."
                  rows={3}
                />
              </div>

              {/* Image */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-orange-700">Product Image URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="image"
                    name="image"
                    autoComplete="off"
                    value={form.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="Image URL or search for image"
                  />
                  <Button
                    type="button"
                    onClick={() => searchImage(form.name)}
                    disabled={!form.name}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
                {form.image && (
                  <div className="mt-2">
                    <img 
                      src={form.image} 
                      alt="Product preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="space-y-2">
                <Label htmlFor="inStock" className="text-orange-700">Stock Status</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    name="inStock"
                    autoComplete="off"
                    checked={form.inStock}
                    onChange={(e) => handleInputChange('inStock', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="inStock" className="text-sm">In Stock</Label>
                </div>
              </div>

              {/* Message */}
              {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={loading}
              >
                {loading ? 'Adding Product...' : 'Add Product'}
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;