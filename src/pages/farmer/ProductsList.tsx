import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Plus, Edit, Trash2, Loader2, Search, Package } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { productService } from '../../services';
import { useAuth } from '../../contexts';
import { Product } from '../../types/product';

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, pagination: paginationData } = await productService.getProducts(
        user.id,
        {
          search: searchQuery,
          page: pagination.page,
          limit: pagination.limit,
          sortBy: 'created_at',
          sortOrder: 'desc',
        }
      );
      
      setProducts(data);
      setPagination({
        page: paginationData.page,
        limit: paginationData.limit,
        total: paginationData.total,
        totalPages: paginationData.totalPages,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load products. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, searchQuery, pagination.page, pagination.limit, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchProducts]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;
    
    const unsubscribe = productService.subscribeToProducts(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setProducts(prev => [payload.new as Product, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setProducts(prev => 
          prev.map(p => p.id === payload.new.id ? payload.new as Product : p)
        );
      } else if (payload.eventType === 'DELETE') {
        setProducts(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await productService.deleteProduct(id);
      toast({
        title: 'Success',
        description: 'Product deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading products...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full sm:w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/farmer/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 && !loading ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'No products match your search. Try a different term.'
                  : 'Get started by adding your first product.'}
              </p>
              <Button onClick={() => navigate('/farmer/products/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover mr-3"
                            />
                          )}
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>{product.category || 'N/A'}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.quantity} {product.unit}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/farmer/products/${product.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> products
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (pagination.page > 1) {
                      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                    }
                  }}
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (pagination.page < pagination.totalPages) {
                      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                    }
                  }}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsList;
