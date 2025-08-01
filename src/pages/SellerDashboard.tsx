import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Package, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  total?: number;
  items: OrderItem[];
}

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    
    // Fetch products
    fetch("/api/v1/products?seller=me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setProductsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setProductsLoading(false);
      });

    // Fetch orders
    fetch("/api/v1/orders?seller=me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setOrdersLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setOrdersLoading(false);
      });

    // Set overall loading to false when both requests complete
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-8">
      <div className="px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Seller Dashboard</h2>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Products
          </h3>
          
          {productsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
              <span className="text-gray-600">Loading products...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="font-semibold text-lg mb-2">{product.name}</div>
                  <div className="text-gray-600 mb-1">Price: ₹{product.price}</div>
                  <div className="text-gray-600">Stock: {product.quantity}</div>
                  {/* Add edit/delete buttons here */}
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            My Orders
          </h3>
          
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
              <span className="text-gray-600">Loading orders...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="font-semibold text-lg mb-2">Order #{order.id}</div>
                  <div className="text-gray-600 mb-2">Status: {order.status}</div>
                  <div className="text-gray-600 mb-4">Date: {new Date(order.created_at).toLocaleString()}</div>
                  <div className="text-gray-700">
                    <span className="font-medium">Items:</span>
                    <ul className="ml-4 list-disc mt-2">
                      {order.items.map((item: OrderItem) => (
                        <li key={item.id} className="text-gray-600">
                          {item.product_name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
