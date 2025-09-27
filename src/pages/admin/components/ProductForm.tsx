import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  is_organic: z.boolean().default(false),
  image_url: z.string().url('Please enter a valid URL').or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      category: '',
      is_organic: false,
      image_url: '',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      // Fetch product data for editing
      const fetchProduct = async () => {
        try {
          setLoading(true);
          // Replace with actual API call
          // const response = await fetch(`/api/admin/products/${id}`);
          // const data = await response.json();
          
          // Mock data for now
          const mockProduct = {
            name: 'Organic Apples',
            description: 'Fresh organic apples from our farm',
            price: 120,
            quantity: 50,
            category: 'Fruits',
            is_organic: true,
            image_url: 'https://example.com/apples.jpg',
          };
          
          Object.entries(mockProduct).forEach(([key, value]) => {
            setValue(key as keyof ProductFormData, value);
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load product data',
            variant: 'destructive',
          });
          navigate('/admin/products');
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditMode, setValue, toast, navigate]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      
      // In a real app, you would make an API call here
      const url = isEditMode 
        ? `/api/admin/products/${id}` 
        : '/api/admin/products';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      // Replace with actual API call
      // const response = await fetch(url, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // if (!response.ok) throw new Error('Failed to save product');
      
      toast({
        title: 'Success',
        description: isEditMode 
          ? 'Product updated successfully' 
          : 'Product created successfully',
      });
      
      navigate('/admin/products');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        <p className="text-muted-foreground">
          {isEditMode 
            ? 'Update the product details below.'
            : 'Fill in the details to add a new product.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Fruits, Vegetables, Dairy"
                {...register('category')}
              />
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter product description"
              className="min-h-[120px]"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity in Stock *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register('image_url')}
            />
            {errors.image_url && (
              <p className="text-sm text-red-600">{errors.image_url.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is_organic" 
              onCheckedChange={(checked) => setValue('is_organic', Boolean(checked))}
            />
            <Label htmlFor="is_organic">This is an organic product</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/admin/products')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditMode ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
