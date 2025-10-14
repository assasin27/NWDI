import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer' | 'farmer';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock admin credentials
    if (email === 'admin@farmfresh.com' && password === 'admin123') {
      setUser({
        id: 'admin1',
        email: 'admin@farmfresh.com',
        role: 'admin'
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}