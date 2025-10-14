import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

// Lazy loaded components
const OrdersManagement = React.lazy(() => import('@/pages/admin/modules/orders/OrdersManagement'));
const InventoryManagement = React.lazy(() => import('@/pages/admin/modules/inventory/InventoryManagement'));
const Analytics = React.lazy(() => import('@/pages/admin/modules/analytics/Analytics'));
const Settings = React.lazy(() => import('@/pages/admin/modules/settings/Settings'));
const UserManagement = React.lazy(() => import('@/pages/admin/modules/users/UserManagement'));
const Sidebar = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const menuItems = [
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Inventory', path: '/admin/inventory' },
    { name: 'Analytics', path: '/admin/analytics' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">
            Admin Portal
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold">Nareshwadi Admin</h2>
          <div className="flex items-center space-x-4">
            {/* Add any header actions here */}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPortal = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !user.email) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="md:hidden">
        <Header />
      </div>
      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col border-r min-h-screen">
          <Sidebar />
        </aside>
        <main className="flex-1">
          <div className="hidden md:block">
            <Header />
          </div>
          <div className="p-8">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/admin/orders" replace />}
                />
                <Route path="/orders" element={<OrdersManagement />} />
                <Route path="/inventory" element={<InventoryManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="*"
                  element={<Navigate to="/admin/orders" replace />}
                />
              </Routes>
            </React.Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;
