import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingCart, BarChart, Settings, Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated, or to homepage if not admin
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
          <Button variant="outline" onClick={logout} size="sm">
            Logout
          </Button>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-gray-200">
              <h1 className="text-xl font-semibold">Admin Portal</h1>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 flex-shrink-0 ${
                            isActive ? 'text-primary' : 'text-gray-400'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.email}
                  </p>
                  <button
                    onClick={logout}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto lg:ml-64 pt-16 lg:pt-0">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
