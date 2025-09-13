import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'farmer' | 'buyer' | 'guest';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User | null;
  profile: UserProfile | null;
  session: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  role: UserRole;
  hasRole: (role: UserRole) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<void>;
}
