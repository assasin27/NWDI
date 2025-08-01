import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
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
      });
  }, []);
  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded p-4">
              <div className="font-semibold">Order #{order.id}</div>
              <div>Status: {order.status}</div>
              <div>Date: {new Date(order.createdAt || order.created_at).toLocaleString()}</div>
              <div>Items:
                <ul className="ml-4 list-disc">
                  {(order.OrderItems || order.items || []).map((item: any) => (
                    <li key={item.id}>{item.Product ? item.Product.name : item.product_name} x {item.quantity}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div>No orders found.</div>}
        </div>
      )}
    </div>
  );
}
