import CartDrawer from "../components/CartDrawer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Layout from "../components/Layout";

const Cart: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading time for cart initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseCart = () => {
    setIsCartOpen(false);
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={handleCloseCart} 
      />
    </Layout>
  );
};

export default Cart;
