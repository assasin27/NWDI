import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SellerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch("/api/v1/products?seller=me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProducts(data));
    fetch("/api/v1/orders?seller=me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);
  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Seller Dashboard</h2>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">My Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="border rounded p-4">
              <div className="font-semibold">{product.name}</div>
              <div>Price: ₹{product.price}</div>
              <div>Stock: {product.quantity}</div>
              {/* Add edit/delete buttons here */}
            </div>
          ))}
          {products.length === 0 && <div>No products found.</div>}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">My Orders</h3>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded p-4">
              <div className="font-semibold">Order #{order.id}</div>
              <div>Status: {order.status}</div>
              <div>Date: {new Date(order.created_at).toLocaleString()}</div>
              <div>Items:
                <ul className="ml-4 list-disc">
                  {order.items.map((item: any) => (
                    <li key={item.id}>{item.product_name} x {item.quantity}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div>No orders found.</div>}
        </div>
      </div>
    </div>
  );
}
