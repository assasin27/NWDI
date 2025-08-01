import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Package } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  Product?: {
    name: string;
  };
  product_name?: string;
}

interface Order {
  id: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  OrderItems?: OrderItem[];
  items?: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch("/api/v1/orders", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-8">
      <div className="px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">My Orders</h2>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="font-semibold text-lg mb-2">Order #{order.id}</div>
              <div className="text-gray-600 mb-2">Status: {order.status}</div>
              <div className="text-gray-600 mb-4">Date: {new Date(order.createdAt || order.created_at).toLocaleString()}</div>
              <div className="text-gray-700">
                <span className="font-medium">Items:</span>
                <ul className="ml-4 list-disc mt-2">
                  {(order.OrderItems || order.items || []).map((item: OrderItem) => (
                    <li key={item.id} className="text-gray-600">
                      {item.Product ? item.Product.name : item.product_name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Package className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
              <p className="text-gray-500">You haven't placed any orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
