import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/supabaseClient";

interface HeaderProps {
  onCartClick?: () => void;
}

export const Header = ({ onCartClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // User menu logic removed; now handled by NavBar.tsx
  const { cart } = useCart();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and navigation removed; now handled by NavBar.tsx */}

          {/* Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* User menu removed; now handled by NavBar.tsx */}
            {/* Cart icon removed as requested */}
            {/* Login button removed as requested */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col space-y-3">
              <a href="#home" className="text-foreground hover:text-primary transition-colors py-2">Home</a>
              <a href="#products" className="text-foreground hover:text-primary transition-colors py-2">Products</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors py-2">About</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors py-2">Contact</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};