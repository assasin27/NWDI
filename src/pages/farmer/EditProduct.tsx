import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { useToast } from '../../components/ui/use-toast';
import { productService } from '../../services';
import { useAuth } from '../../contexts';
import { Product, ProductFormData } from '../../types/product';
import { ArrowLeft, Save, Loader2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

interface FormErrors {
  name?: string;
  price?: string;
  quantity?: string;
  category?: string;
  image_url?: string;
  min_stock_level?: string;
  max_stock_level?: string;
  unit?: string;
}

const EditProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<ProductFormData, 'farmer_id'>>({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    quantity: 0,
    unit: 'kg',
    min_stock_level: 5,
    max_stock_level: 100
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'ltr', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'piece', label: 'Piece' },
    { value: 'packet', label: 'Packet' },
    { value: 'dozen', label: 'Dozen' },
  ];

  const categories = [
    'Fruits', 'Vegetables', 'Grains', 'Dairy',
    'Eco Friendly Products', 'Handmade Warli Painted'
  ];

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) 
      newErrors.price = 'Please enter a valid price';
    if (isNaN(form.quantity) || form.quantity < 0) 
      newErrors.quantity = 'Please enter a valid quantity';
    if (!form.category) 
      newErrors.category = 'Please select a category';
    if (form.min_stock_level < 0) 
      newErrors.min_stock_level = 'Minimum stock level cannot be negative';
    if (form.max_stock_level <= form.min_stock_level) 
      newErrors.max_stock_level = 'Maximum stock level must be greater than minimum';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    try {
      setUploading(true);
      return await productService.uploadImage(file, 'products');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or WebP image.',
      });
      return;
    }
    
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Maximum file size is 5MB.',
      });
      return;
    }
    
    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      setForm(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  // Remove current image
  const removeImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!productId || !user?.id) return;
        
        const product = await productService.getProductById(productId);
        
        // Verify the product belongs to the current farmer
        if (product.farmer_id !== user.id) {
          throw new Error('You do not have permission to edit this product');
        }
        
        setForm({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          category: product.category || '',
          image_url: product.image_url || '',
          quantity: product.quantity,
          unit: product.unit || 'kg',
          min_stock_level: product.min_stock_level || 5,
          max_stock_level: product.max_stock_level || 100
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load product. Please try again.',
        });
        navigate('/farmer/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, navigate, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setSaving(true);
    try {
      // Create form data with proper types
      const formData: ProductFormData & { farmer_id: string } = {
        name: form.name,
        description: form.description,
        price: form.price, // Keep as string for form data
        category: form.category || '',
        image_url: form.image_url || '',
        quantity: form.quantity,
        unit: form.unit,
        min_stock_level: form.min_stock_level,
        max_stock_level: form.max_stock_level,
        farmer_id: user.id
      };

      if (productId) {
        // Update existing product
        await productService.updateProduct(productId, formData);
        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
      } else {
        // Create new product
        await productService.createProduct(formData);
        toast({
          title: "Success",
          description: "Product created successfully!",
        });
      }

      // Redirect to products list after a short delay
      setTimeout(() => navigate('/farmer/products'), 1500);

    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to save product. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        <p className="text-lg text-gray-600">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate('/farmer/dashboard')}
          variant="ghost"
          className="mb-4"
          disabled={saving}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your product details below. All fields marked with * are required.
            </p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      disabled={saving}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={form.category}
                      onValueChange={(value) => setForm({...form, category: value})}
                      disabled={saving}
                    >
                      <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      rows={3}
                      disabled={saving}
                      placeholder="Provide detailed information about your product..."
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Pricing & Stock</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm({...form, price: e.target.value})}
                        disabled={saving}
                        className={`pl-8 ${errors.price ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Stock Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={form.quantity}
                      onChange={(e) => setForm({...form, quantity: parseInt(e.target.value) || 0})}
                      disabled={saving}
                      className={errors.quantity ? 'border-red-500' : ''}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity}</p>
                    )}
                  </div>

                  {/* Unit */}
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select 
                      value={form.unit}
                      onValueChange={(value) => setForm({...form, unit: value})}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Min Stock Level */}
                  <div className="space-y-2">
                    <Label htmlFor="min_stock">Minimum Stock Level</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      min="0"
                      value={form.min_stock_level}
                      onChange={(e) => setForm({...form, min_stock_level: parseInt(e.target.value) || 0})}
                      disabled={saving}
                      className={errors.min_stock_level ? 'border-red-500' : ''}
                    />
                    {errors.min_stock_level && (
                      <p className="text-sm text-red-500">{errors.min_stock_level}</p>
                    )}
                  </div>

                  {/* Max Stock Level */}
                  <div className="space-y-2">
                    <Label htmlFor="max_stock">Maximum Stock Level</Label>
                    <Input
                      id="max_stock"
                      type="number"
                      min={form.min_stock_level + 1}
                      value={form.max_stock_level}
                      onChange={(e) => setForm({...form, max_stock_level: parseInt(e.target.value) || 0})}
                      disabled={saving}
                      className={errors.max_stock_level ? 'border-red-500' : ''}
                    />
                    {errors.max_stock_level && (
                      <p className="text-sm text-red-500">{errors.max_stock_level}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Image */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Product Image</h3>
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {form.image_url ? (
                        <img
                          src={form.image_url}
                          alt={form.name || 'Product image'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                          <span className="mt-2 block text-sm font-medium text-gray-500">
                            No image selected
                          </span>
                        </div>
                      )}
                    </div>
                    {form.image_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 bg-white rounded-full shadow-sm hover:bg-red-50"
                        onClick={removeImage}
                        disabled={saving || uploading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={saving || uploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving || uploading}
                        className="w-full sm:w-auto"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            {form.image_url ? 'Change Image' : 'Upload Image'}
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG up to 5MB. Recommended size: 800x800px
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/farmer/dashboard')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProduct;
