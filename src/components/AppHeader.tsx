import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingCart, Heart, User, Home, List, LogOut, LayoutDashboard, X, Menu } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/supabaseClient";

export default function AppHeader({ onCartClick }: { onCartClick?: () => void }) {
  const { cart } = useCart();
  const [user, setUser] = useState(null);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setProfileName(data?.user?.user_metadata?.name || "");
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserDrawerOpen(false);
    window.location.href = "/";
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    try {
      const updates: any = {};
      if (profileName) updates['data'] = { name: profileName };
      if (profilePassword) updates['password'] = profilePassword;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        setProfileError(error.message);
      } else {
        setProfileSuccess("Profile updated successfully");
        setProfilePassword("");
      }
    } catch {
      setProfileError("Profile update failed");
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Nareshwadi</h1>
              <p className="text-xs text-muted-foreground font-script">Fresh from farm</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/products" className="text-foreground hover:text-primary transition-colors">Products</Link>
            <Link to="/wishlist" className="hover:underline flex items-center gap-1"><Heart className="h-4 w-4" /> Wishlist</Link>
            <Link to="/orders" className="hover:underline flex items-center gap-1"><List className="h-4 w-4" /> Orders</Link>
            {user && (
              <>
                <Link to="/profile" className="hover:underline flex items-center gap-1"><User className="h-4 w-4" /> Profile</Link>
                <Link to="/dashboard" className="hover:underline flex items-center gap-1"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
              </>
            )}
          </nav>

          {/* Cart & User Drawer */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                type="button"
                onClick={onCartClick}
                className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors bg-transparent border-none outline-none cursor-pointer"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-leaf-green text-white rounded-full text-xs px-2 py-0.5">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
            {user && (
              <div className="relative">
                <button
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setUserDrawerOpen((v) => !v)}
                  aria-label="User menu"
                >
                  <User className="h-6 w-6" />
                </button>
                {userDrawerOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded z-50 p-4">
                    <Button className="w-full mb-2" onClick={() => setProfileModalOpen(true)}>
                      My Profile
                    </Button>
                    <Button className="w-full" variant="destructive" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                )}
                {isProfileModalOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow w-full max-w-sm relative">
                      <button className="absolute top-2 right-2" onClick={() => setProfileModalOpen(false)}>
                        <X className="h-5 w-5" />
                      </button>
                      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                      <form onSubmit={handleProfileUpdate}>
                        <Input
                          placeholder="Name"
                          value={profileName}
                          onChange={e => setProfileName(e.target.value)}
                          className="mb-2"
                        />
                        <Input
                          type="password"
                          placeholder="New Password"
                          value={profilePassword}
                          onChange={e => setProfilePassword(e.target.value)}
                          className="mb-2"
                        />
                        {profileError && <div className="text-red-500 mb-2">{profileError}</div>}
                        {profileSuccess && <div className="text-green-500 mb-2">{profileSuccess}</div>}
                        <Button type="submit" className="w-full">Save Changes</Button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
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
              <Link to="/" className="text-foreground hover:text-primary transition-colors py-2">Home</Link>
              <Link to="/products" className="text-foreground hover:text-primary transition-colors py-2">Products</Link>
              <Link to="/wishlist" className="hover:underline flex items-center gap-1"><Heart className="h-4 w-4" /> Wishlist</Link>
              <Link to="/orders" className="hover:underline flex items-center gap-1"><List className="h-4 w-4" /> Orders</Link>
              {user && (
                <>
                  <Link to="/profile" className="hover:underline flex items-center gap-1"><User className="h-4 w-4" /> Profile</Link>
                  <Link to="/dashboard" className="hover:underline flex items-center gap-1"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
