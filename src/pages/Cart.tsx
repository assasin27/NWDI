import CartDrawer from "../components/CartDrawer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Cart: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(true);
  const navigate = useNavigate();

  const handleCloseCart = () => {
    setIsCartOpen(false);
    navigate('/');
  };

  return (
    <CartDrawer 
      isOpen={isCartOpen} 
      onClose={handleCloseCart} 
    />
  );
};

export default Cart;
