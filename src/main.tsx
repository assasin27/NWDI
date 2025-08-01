
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CartProvider } from './hooks/useCart';
import { WishlistProvider } from './hooks/useWishlist';

createRoot(document.getElementById("root")!).render(
  <CartProvider>
    <WishlistProvider>
      <App />
    </WishlistProvider>
  </CartProvider>
);
